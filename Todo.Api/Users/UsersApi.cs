using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace TodoApi;

public static class UsersApi
{
    public static RouteGroupBuilder MapUsers(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/users");

        group.WithTags("Users");

        // TODO: Add service to service auth between the BFF and this API

        group.WithParameterValidation(typeof(ExternalUserInfo), typeof(UserRole));

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

        group.MapGet("/roles", async ([FromQuery] string userId, UserManager<TodoUser> userManager, CurrentUser currentUser) =>
        {
            if (!currentUser.IsAdmin) return Results.Unauthorized();

            var user = await userManager.FindByIdAsync(userId);
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

        return group;
    }
}
