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

            var query = db.Users.Include(u => u.LeaveBalances).AsNoTracking(); // Include balances

            var totalCount = await query.CountAsync();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u => (!string.IsNullOrEmpty(u.Email) && u.Email.Contains(searchTerm)) || (!string.IsNullOrEmpty(u.UserName) && u.UserName.Contains(searchTerm)));
            }

            var users = await query
                .OrderBy(u => u.Email) // Or UserName
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    UserName = u.UserName,
                    LeaveBalances = u.LeaveBalances != null ? new LeaveBalancesDto // Map owned entity to a DTO
                    {
                        AnnualLeavesBalance = u.LeaveBalances.AnnualLeavesBalance,
                        SickLeavesBalance = u.LeaveBalances.SickLeavesBalance,
                        SpecialLeavesBalance = u.LeaveBalances.SpecialLeavesBalance
                    } : null
                })
                .ToListAsync();

            var response = new PaginatedResponse<UserListItemDto>
            {
                Data = users,
                TotalCount = totalCount,
                // These counts aren't relevant for users, set to 0 or remove from PaginatedResponse if possible,
                // otherwise, just populate Data, TotalCount, PageNumber, PageSize.
                PendingCount = 0,
                ApprovedCount = 0,
                RejectedCount = 0,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };

            return TypedResults.Ok(response);

        }).RequireAuthorization(pb => pb.RequireCurrentUser());

        return group;
    }
}
