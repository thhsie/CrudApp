using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Shared;

namespace TodoApi;

public static class UsersApi
{
    public static RouteGroupBuilder MapUsers(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/users");

        group.WithTags("Users");

        // TODO: Add service to service auth between the BFF and this API

        group.WithParameterValidation(typeof(ExternalUserInfo), typeof(UserRole), typeof(LeaveBalancesUpdateRequest));

        group.MapIdentityApi<TodoUser>();

        // To assign and view roles of a user
        group.MapPost("/roles", async (UserRole userRole, UserManager<TodoUser> userManager, RoleManager<IdentityRole> roleManager, CurrentUser currentUser) =>
        {
            if (!currentUser.IsAdmin) return Results.Unauthorized();

            var user = await userManager.FindByEmailAsync(userRole.Email);
            if (user == null) return Results.NotFound();

            if (!await roleManager.RoleExistsAsync(userRole.Role))
            {
                return Results.BadRequest("Role does not exist");
            }

            var result = await userManager.AddToRoleAsync(user, userRole.Role);
            return result.Succeeded ? Results.Ok() : Results.ValidationProblem(result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description }));
        }).RequireAuthorization(pb => pb.RequireCurrentUser());

        group.MapGet("/roles", async ([FromQuery] string email, UserManager<TodoUser> userManager, CurrentUser currentUser) =>
        {
            if (!currentUser.IsAdmin) return Results.Unauthorized();

            var user = await userManager.FindByEmailAsync(email);
            if (user == null) return Results.NotFound();

            var roles = await userManager.GetRolesAsync(user);
            return Results.Ok(roles);
        }).RequireAuthorization(pb => pb.RequireCurrentUser());

        // The MapIdentityApi<T> doesn't expose an external login endpoint so we write this custom endpoint that follows
        // a similar pattern
        group.MapPost("/token/{provider}", async Task<Results<Ok<AccessTokenResponse>, SignInHttpResult, ValidationProblem>> (string provider, ExternalUserInfo userInfo, UserManager<TodoUser> userManager, SignInManager<TodoUser> signInManager, IDataProtectionProvider dataProtectionProvider) =>
        {
            var protector = dataProtectionProvider.CreateProtector(provider);

            var providerKey = protector.Unprotect(userInfo.ProviderKey);

            var user = await userManager.FindByLoginAsync(provider, providerKey);

            var result = IdentityResult.Success;

            if (user is null)
            {
                user = new TodoUser() { UserName = userInfo.Username, Email = userInfo.Email };

                result = await userManager.CreateAsync(user);

                if (result.Succeeded)
                {
                    result = await userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerKey, displayName: null));
                }
            }

            if (result.Succeeded)
            {
                var principal = await signInManager.CreateUserPrincipalAsync(user);

                return TypedResults.SignIn(principal);
            }

            return TypedResults.ValidationProblem(result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description }));
        });

        group.MapPut("/leave-balances/{id}", async ([FromRoute] string id, LeaveBalancesUpdateRequest request, UserManager<TodoUser> userManager, CurrentUser currentUser) =>
        {
            if (!currentUser.IsAdmin) return Results.Unauthorized();

            var user = await userManager.FindByIdAsync(id);
            if (user == null) return Results.NotFound();

            user.SetLeaveBalances(request.PaidLeavesBalance, request.SickLeavesBalance, request.SpecialLeavesBalance);
            await userManager.UpdateAsync(user);

            return Results.Ok();
        }).RequireAuthorization(pb => pb.RequireCurrentUser());

        group.MapGet("/me", (CurrentUser currentUser) =>
        {
            return Results.Ok(new
            {
                currentUser.Id,
                currentUser.User?.Email,
                currentUser.IsAdmin,
                currentUser.User.LeaveBalances,
            });
        }).RequireAuthorization(pb => pb.RequireCurrentUser());

        group.MapGet("/all", async Task<Results<Ok<PaginatedResponse<UserListItemDto>>, UnauthorizedHttpResult>> (
            TodoDbContext db,
            CurrentUser currentUser,
            [FromQuery] string? searchTerm,
            [AsParameters] PaginationRequest pagination) =>
        {
            if (!currentUser.IsAdmin)
            {
                return TypedResults.Unauthorized();
            }

            // Base query for users
            var userQuery = db.Users
                .Include(u => u.LeaveBalances) // Include balances
                .AsNoTracking();

            // Apply search filter *before* counting for accurate totalCount
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLowerInvariant(); // Optimize for case-insensitive search
                userQuery = userQuery.Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(lowerSearchTerm)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(lowerSearchTerm))
                );
            }

            // Get the total count *after* filtering
            var totalCount = await userQuery.CountAsync();

            // Apply pagination and select initial user data
            var users = await userQuery
                .OrderBy(u => u.Email ?? u.UserName) // Ensure consistent ordering
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    UserName = u.UserName,
                    LeaveBalances = u.LeaveBalances != null ? new LeaveBalancesDto
                    {
                        AnnualLeavesBalance = u.LeaveBalances.AnnualLeavesBalance,
                        SickLeavesBalance = u.LeaveBalances.SickLeavesBalance,
                        SpecialLeavesBalance = u.LeaveBalances.SpecialLeavesBalance
                    } : null,
                    LeavesTaken = null // Initialize as null, will populate next
                })
                .ToListAsync();

            // --- Calculate and add Taken Leaves ---
            if (users.Any()) // Only proceed if there are users on the current page
            {
                var userIds = users.Select(u => u.Id).ToList();

                // Query approved leaves for the users on the current page
                var approvedLeaves = await db.Leaves
                    .Where(l => userIds.Contains(l.OwnerId) && l.Status == LeaveStatus.Approved)
                    .Select(l => new { l.OwnerId, l.Type, l.StartDate, l.EndDate }) // Select only needed fields
                    .ToListAsync();

                // Calculate taken days per user per type in memory
                var takenLeavesSummary = approvedLeaves
                    .GroupBy(l => new { l.OwnerId, l.Type })
                    .Select(g => new
                    {
                        g.Key.OwnerId,
                        g.Key.Type,
                        // IMPORTANT: Add +1 if EndDate is inclusive of the leave period
                        TotalDaysTaken = g.Sum(l => (int)(l.EndDate.Date - l.StartDate.Date).TotalDays + 1)
                    })
                    .ToList(); // Bring grouped summary into memory

                // Map the summary back to the user DTOs
                foreach (var user in users)
                {
                    var userTaken = takenLeavesSummary.Where(t => t.OwnerId == user.Id).ToList();
                    user.LeavesTaken = new LeavesTakenDto
                    {
                        AnnualLeavesTaken = userTaken.FirstOrDefault(t => t.Type == (int)LeaveType.Annual)?.TotalDaysTaken ?? 0,
                        SickLeavesTaken = userTaken.FirstOrDefault(t => t.Type == (int)LeaveType.Sick)?.TotalDaysTaken ?? 0,
                        SpecialLeavesTaken = userTaken.FirstOrDefault(t => t.Type == (int)LeaveType.Special)?.TotalDaysTaken ?? 0,
                    };
                }
            }
            // --- End of Taken Leaves Calculation ---


            var response = new PaginatedResponse<UserListItemDto>
            {
                Data = users,
                TotalCount = totalCount,
                PendingCount = 0, // Not relevant for user list
                ApprovedCount = 0,// Not relevant for user list
                RejectedCount = 0,// Not relevant for user list
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };

            return TypedResults.Ok(response);

        }).RequireAuthorization(pb => pb.RequireCurrentUser());

        return group;
    }
}
