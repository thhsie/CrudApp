using Microsoft.AspNetCore.Authentication;
using Yarp.ReverseProxy.Forwarder;
using Yarp.ReverseProxy.Transforms;

namespace Todo.Web.Server;

public static class LeaveBalancesApi
{
    public static RouteGroupBuilder MapLeaveBalances(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/users/leave-balances");

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
