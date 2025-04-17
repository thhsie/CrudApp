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

        // GET /users/all (Admin - Paginated User List with Balances and Taken Leaves)
        group.MapGet("/all", async Task<Results<Ok<PaginatedResponse<UserListItemDto>>, UnauthorizedHttpResult, BadRequest<string>>> (
            TodoDbContext db,
            CurrentUser currentUser,
            [FromQuery] string? searchTerm,
            [AsParameters] PaginationRequest pagination) =>
        {
            if (!currentUser.IsAdmin)
            {
                return TypedResults.Unauthorized();
            }

            var userQuery = db.Users
                .Include(u => u.LeaveBalances)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLowerInvariant();
                userQuery = userQuery.Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(lowerSearchTerm)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(lowerSearchTerm))
                );
            }

            // Get the total count *after* filtering
            var totalCount = await userQuery.CountAsync();

            // Fetch base user data for the current page
            var users = await userQuery
                .OrderBy(u => u.Email ?? u.UserName)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(u => new UserListItemDto // Project to DTO
                {
                    Id = u.Id,
                    Email = u.Email,
                    UserName = u.UserName,
                    LeaveBalances = u.LeaveBalances != null ? new LeaveBalancesDto // Map balances
                    {
                        AnnualLeavesBalance = u.LeaveBalances.AnnualLeavesBalance,
                        SickLeavesBalance = u.LeaveBalances.SickLeavesBalance,
                        SpecialLeavesBalance = u.LeaveBalances.SpecialLeavesBalance
                    } : null,
                    LeavesTaken = null // Initialize LeavesTaken, will populate next
                })
                .ToListAsync();

            // --- Calculate and add Taken Leaves ---
            if (users.Any()) // Only proceed if there are users on the current page
            {
                var userIds = users.Select(u => u.Id).ToList();

                // 1. Fetch necessary data for approved leaves for users on this page
                var approvedLeavesData = await db.Leaves
                    .Where(l => userIds.Contains(l.OwnerId) && l.Status == LeaveStatus.Approved)
                    .Select(l => new // Select raw data needed for calculation
                    {
                        l.OwnerId,
                        l.Type,
                        l.StartDate,
                        l.EndDate,
                        l.IsStartHalfDay,
                        l.IsEndHalfDay
                    })
                    .ToListAsync(); // Fetch data into memory

                // 2. Calculate duration and group in memory
                var takenLeavesSummary = approvedLeavesData
                    .GroupBy(l => new { l.OwnerId, l.Type }) // Group by user and leave type
                    .Select(g => new
                    {
                        g.Key.OwnerId,
                        g.Key.Type,
                        // Calculate duration for each leave IN THE GROUP using flags, then sum
                        TotalDurationTaken = g.Sum(l =>
                           CalculateLeaveDuration(l.StartDate, l.EndDate, l.IsStartHalfDay, l.IsEndHalfDay) // <-- Use helper
                        )
                    })
                    .ToList(); // Result is now in memory

                // 3. Map the summary back to the user DTOs
                foreach (var user in users)
                {
                    var userTakenSummary = takenLeavesSummary.Where(t => t.OwnerId == user.Id).ToList();
                    user.LeavesTaken = new LeavesTakenDto
                    {
                        AnnualLeavesTaken = userTakenSummary.FirstOrDefault(t => t.Type == (int)LeaveType.Annual)?.TotalDurationTaken ?? 0m,
                        SickLeavesTaken = userTakenSummary.FirstOrDefault(t => t.Type == (int)LeaveType.Sick)?.TotalDurationTaken ?? 0m,
                        SpecialLeavesTaken = userTakenSummary.FirstOrDefault(t => t.Type == (int)LeaveType.Special)?.TotalDurationTaken ?? 0m,
                        // Note: Unpaid leave duration isn't typically tracked against a balance here
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

    // Helper function to calculate duration (mirrors Leave.CalculateLeaveDuration)
    // Keep this consistent with the logic in Leave.cs
    private static decimal CalculateLeaveDuration(DateTime startDate, DateTime endDate, bool isStartHalf, bool isEndHalf)
    {
        // Ensure start is not after end (basic validation)
        if (startDate.Date > endDate.Date) return 0m;

        // Single Day Leave
        if (startDate.Date == endDate.Date)
        {
            // If either is marked as half, it's 0.5. If neither, it's 1.0.
            // If both are marked (invalid state), treat as 0.5 for calculation.
            return (isStartHalf || isEndHalf) ? 0.5m : 1.0m;
        }

        // Multi-Day Leave
        decimal duration = 0m;

        // Start day duration
        duration += isStartHalf ? 0.5m : 1.0m;

        // End day duration
        duration += isEndHalf ? 0.5m : 1.0m;

        // Full days in between
        // Subtract 1 because we've already accounted for the start and end days partially/fully.
        int fullDaysBetween = (int)(endDate.Date - startDate.Date).TotalDays - 1;
        if (fullDaysBetween > 0)
        {
            duration += fullDaysBetween;
        }

        return duration;
    }
}
