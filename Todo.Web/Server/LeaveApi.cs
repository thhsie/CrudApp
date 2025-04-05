using Microsoft.AspNetCore.Authentication;
using Yarp.ReverseProxy.Forwarder;
using Yarp.ReverseProxy.Transforms;

namespace Todo.Web.Server;

public static class LeaveApi
{
    public static RouteGroupBuilder MapLeaves(this IEndpointRouteBuilder routes)
    {
        // The leave API translates the authentication cookie between the browser the BFF into an
        // access token that is sent to the leave API. We're using YARP to forward the request.

        var group = routes.MapGroup("/leaves");

        group.RequireAuthorization();

        group.MapForwarder("{*path}", "http://todoapi", new ForwarderRequestConfig(), b =>
        {
            b.AddRequestTransform(async c =>
            {
                var accessToken = await c.HttpContext.GetTokenAsync(TokenNames.AccessToken);
                c.ProxyRequest.Headers.Authorization = new("Bearer", accessToken);
            });
        });

        return group;
    }
}
