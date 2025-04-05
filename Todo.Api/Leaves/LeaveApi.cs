using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace TodoApi;

internal static class LeaveApi
{
    public static RouteGroupBuilder MapLeaves(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/leaves");

        group.WithTags("Leaves");

        // Add security requirements, all incoming requests to this API *must*
        // be authenticated with a valid user.
        group.RequireAuthorization(pb => pb.RequireCurrentUser());

        // Rate limit all of the APIs
        group.RequirePerUserRateLimit();

        // Validate the parameters
        group.WithParameterValidation(typeof(LeaveItem));

        group.MapGet("/", async (TodoDbContext db, CurrentUser owner) =>
        {
            return await db.Leaves
                .Where(leave => leave.OwnerId == owner.Id)
                .Select(l => l.AsLeaveItem())
                .AsNoTracking()
                .ToListAsync();
        });

        group.MapGet("/{id}", async Task<Results<Ok<LeaveItem>, NotFound>> (TodoDbContext db, int id, CurrentUser owner) =>
        {
            return await db.Leaves.FindAsync(id) switch
            {
                Leave leave when leave.OwnerId == owner.Id || owner.IsAdmin => TypedResults.Ok(leave.AsLeaveItem()),
                _ => TypedResults.NotFound()
            };
        });

        group.MapPost("/", async Task<Created<LeaveItem>> (TodoDbContext db, LeaveItem newLeave, CurrentUser owner) =>
        {
            var leave = new Leave
            {
                OwnerId = owner.Id,
                Type = newLeave.Type,
                StartDate = newLeave.StartDate,
                EndDate = newLeave.EndDate
            };

            db.Leaves.Add(leave);
            await db.SaveChangesAsync();

            return TypedResults.Created($"/leaves/{leave.Id}", leave.AsLeaveItem());
        });

        group.MapPut("/{id}", async Task<Results<Ok, NotFound, BadRequest>> (TodoDbContext db, int id, LeaveItem leaveItem, CurrentUser owner) =>
        {
            if (id != leaveItem.Id)
            {
                return TypedResults.BadRequest();
            }

            var rowsAffected = await db.Leaves
                .Where(l => l.Id == id && (l.OwnerId == owner.Id || owner.IsAdmin))
                .ExecuteUpdateAsync(updates =>
                    updates.SetProperty(l => l.Type, leaveItem.Type)
                           .SetProperty(l => l.StartDate, leaveItem.StartDate)
                           .SetProperty(l => l.EndDate, leaveItem.EndDate));

            return rowsAffected == 0 ? TypedResults.NotFound() : TypedResults.Ok();
        });

        group.MapDelete("/{id}", async Task<Results<NotFound, Ok>> (TodoDbContext db, int id, CurrentUser owner) =>
        {
            var rowsAffected = await db.Leaves
                .Where(l => l.Id == id && (l.OwnerId == owner.Id || owner.IsAdmin))
                .ExecuteDeleteAsync();

            return rowsAffected == 0 ? TypedResults.NotFound() : TypedResults.Ok();
        });

        group.MapPost("/{id}/approve", async Task<Results<Ok, NotFound, BadRequest>> (TodoDbContext db, int id, CurrentUser approver) =>
        {
            if (!approver.IsAdmin)
            {
                return TypedResults.NotFound();
            }

            var leave = await db.Leaves.FindAsync(id);
            if (leave == null)
            {
                return TypedResults.NotFound();
            }

            var user = await db.Users.FindAsync(leave.OwnerId);
            if (user == null || !leave.Approve(user))
            {
                return TypedResults.BadRequest();
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        });

        group.MapPost("/{id}/reject", async Task<Results<Ok, NotFound, BadRequest>> (TodoDbContext db, int id, CurrentUser approver) =>
        {
            if (!approver.IsAdmin)
            {
                return TypedResults.NotFound();
            }

            var leave = await db.Leaves.FindAsync(id);
            if (leave == null)
            {
                return TypedResults.NotFound();
            }

            var user = await db.Users.FindAsync(leave.OwnerId);
            if (user == null || !leave.Reject(user))
            {
                return TypedResults.BadRequest();
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        });

        return group;
    }
}
