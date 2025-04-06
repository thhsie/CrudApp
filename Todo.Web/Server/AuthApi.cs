using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;

namespace Todo.Web.Server;

public static class AuthApi
{
    public static RouteGroupBuilder MapAuth(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/auth");

        group.MapPost("register", async (UserInfo userInfo, AuthClient client) =>
        {
            // Retrieve the access token given the user info
            var token = await client.CreateUserAsync(userInfo);

            if (token is null)
            {
                return Results.Unauthorized();
            }

            return SignIn(userInfo, token);
        });

        group.MapPost("login", async (UserInfo userInfo, AuthClient client) =>
        {
            // Retrieve the access token give the user info
            var token = await client.GetTokenAsync(userInfo);

            if (token is null)
            {
                return Results.Unauthorized();
            }

            return SignIn(userInfo, token);
        });

        group.MapPost("logout", async (HttpContext context) =>
        {
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // TODO: Support remote logout
            // If this is an external login then use it
            //var result = await context.AuthenticateAsync();
            //if (result.Properties?.GetExternalProvider() is string providerName)
            //{
            //    await context.SignOutAsync(providerName, new() { RedirectUri = "/" });
            //}
        })
        .RequireAuthorization();

        // External login
        group.MapGet("login/{provider}", (string provider) =>
        {
            // Trigger the external login flow by issuing a challenge with the provider name.
            // This name maps to the registered authentication scheme names in AuthenticationExtensions.cs
            return Results.Challenge(
                properties: new() { RedirectUri = $"/auth/signin/{provider}" },
                authenticationSchemes: [provider]);
        });

        group.MapGet("signin/{provider}", async (string provider, AuthClient client, HttpContext context, IDataProtectionProvider dataProtectionProvider) =>
        {
            // Grab the login information from the external login dance
            var result = await context.AuthenticateAsync(AuthenticationSchemes.ExternalScheme);

            if (result.Succeeded)
            {
                var principal = result.Principal;

                var id = principal.FindFirstValue(ClaimTypes.NameIdentifier)!;

                // TODO: We should have the user pick a user name to complete the external login dance
                // for now we'll prefer the email address
                var name = (principal.FindFirstValue(ClaimTypes.Email) ?? principal.Identity?.Name)!;

                // Protect the user id so it for transport
                var protector = dataProtectionProvider.CreateProtector(provider);

                var token = await client.GetOrCreateUserAsync(provider, new() { Username = name, ProviderKey = protector.Protect(id) });

                if (token is not null)
                {
                    // Write the login cookie
                    await SignIn(id, name, token, provider).ExecuteAsync(context);
                }
            }

            // Delete the external cookie
            await context.SignOutAsync(AuthenticationSchemes.ExternalScheme);

            // TODO: Handle the failure somehow

            return Results.Redirect("http://localhost:5173");
        });

        // Endpoint to get current user details based on the BFF session cookie
        group.MapGet("/me", (HttpContext context) =>
        {
            var user = context.User;

            // We expect the cookie authentication middleware to have run
            if (user?.Identity?.IsAuthenticated != true)
            {
                // Should be caught by RequireAuthorization, but good safeguard
                return Results.Unauthorized();
            }

            // Extract claims populated by the SignIn method
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var name = user.FindFirstValue(ClaimTypes.Name); // This is the name/email stored during SignIn
            // Roles *should* be fetched by the API ClaimsTransformation and added there
            // But the BFF doesn't know about them unless explicitly added to *its* principal during SignIn.
            // For now, we assume roles are *not* in the BFF cookie principal directly.
            // The API token inside the cookie is what grants role access on the API side.
            // The frontend will determine roles based on *something else* for now (like email match).
            // TODO: Find a way to reliably get roles into the BFF principal or trust frontend logic.

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(name))
            {
                // If essential claims are missing from the BFF principal
                return Results.Problem("Essential user claims missing in session.", statusCode: 500);
            }

            // Return structure matching frontend User type (approximated)
            return Results.Ok(new {
                // Use the claims stored in the BFF cookie
                Id = userId, // This might be external provider ID or email depending on login type
                Email = name, // This is the ClaimTypes.Name stored during SignIn
                Roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray() // Get roles IF they were added during SignIn
            });
        })
        .RequireAuthorization(); // Ensure only authenticated users can access

        return group;
    }

    private static IResult SignIn(UserInfo userInfo, string token)
    {
        return SignIn(userInfo.Email, userInfo.Email, token, providerName: null);
    }

    private static IResult SignIn(string userId, string userName, string token, string? providerName)
    {
        var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme);
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId));
        identity.AddClaim(new Claim(ClaimTypes.Name, userName));

        var properties = new AuthenticationProperties();

        // Store the external provider name so we can do remote sign out
        if (providerName is not null)
        {
            properties.SetExternalProvider(providerName);
        }

        properties.StoreTokens([
            new AuthenticationToken { Name = TokenNames.AccessToken, Value = token }
        ]);

        return Results.SignIn(new ClaimsPrincipal(identity),
            properties: properties,
            authenticationScheme: CookieAuthenticationDefaults.AuthenticationScheme);
    }
}
