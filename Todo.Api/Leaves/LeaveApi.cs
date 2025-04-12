using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Shared;

namespace TodoApi;

internal static class LeaveApi
{
    public static RouteGroupBuilder MapLeaves(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/leaves");

        group.WithTags("Leaves");
        group.RequireAuthorization(pb => pb.RequireCurrentUser());
        group.RequirePerUserRateLimit();
        group.WithParameterValidation(typeof(LeaveItem), typeof(PaginationRequest));

        group.MapGet("/all", async Task<Results<Ok<PaginatedResponse<LeaveItem>>, NotFound>> (
            TodoDbContext db,
            UserManager<TodoUser> userManager,
            [AsParameters] PaginationRequest pagination,
            [FromQuery] string? searchTerm,
            CurrentUser user) =>
        {
            if (!user.IsAdmin)
            {
                return TypedResults.NotFound();
            }

            string? targetUserId = null;
            // Find user ID if email filter is provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLowerInvariant();
                var userQuery = db.Users.AsNoTracking().Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(lowerSearchTerm)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(lowerSearchTerm))
                );
                var userId = await userQuery.Select(u => u.Id).SingleOrDefaultAsync();
                if (string.IsNullOrEmpty(userId))
                {
                    // Return empty results if email doesn't match any user
                    var emptyResponse = new PaginatedResponse<LeaveItem>
                    {
                        Data = [],
                        TotalCount = 0,
                        PendingCount = 0,
                        ApprovedCount = 0,
                        RejectedCount = 0,
                        PageNumber = pagination.PageNumber,
                        PageSize = pagination.PageSize
                    };
                    return TypedResults.Ok(emptyResponse);
                    // Or alternatively return BadRequest:
                    // return TypedResults.BadRequest($"User with email '{ownerEmail}' not found.");
                }
                targetUserId = userId;
            }

            var query = db.Leaves.AsSplitQuery().AsNoTracking();

            // Apply search filter conditionally
            if (targetUserId != null)
            {
                query = query.Where(l => l.OwnerId == targetUserId);
            }

            var totalCount = await query.CountAsync();
            var pendingCount = await query.CountAsync(l => l.Status == LeaveStatus.Pending);
            var approvedCount = await query.CountAsync(l => l.Status == LeaveStatus.Approved);
            var rejectedCount = await query.CountAsync(l => l.Status == LeaveStatus.Rejected);

            var leaves = await query
                .OrderBy(l => l.Status == LeaveStatus.Pending ? 0 : 1)
                .ThenBy(l => l.StartDate)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                // Join with Users to get the email
                .Join(db.Users, // Inner sequence
                      leave => leave.OwnerId, // Outer key selector
                      user => user.Id, // Inner key selector
                      (leave, user) => new LeaveItem // Result selector
                      {
                          Id = leave.Id,
                          Type = leave.Type,
                          StartDate = leave.StartDate,
                          EndDate = leave.EndDate,
                          Status = leave.Status,
                          OwnerEmail = user.Email // Project the email
                      })
                .ToListAsync();

            var response = new PaginatedResponse<LeaveItem>
            {
                Data = leaves,
                TotalCount = totalCount,
                PendingCount = pendingCount,
                ApprovedCount = approvedCount,
                RejectedCount = rejectedCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };

            return TypedResults.Ok(response);
        });

        group.MapGet("/", async Task<Ok<PaginatedResponse<LeaveItem>>> (TodoDbContext db, CurrentUser owner, [AsParameters] PaginationRequest pagination) =>
        {
            var query = db.Leaves
               .Where(leave => leave.OwnerId == owner.Id)
               .AsNoTracking();

            // Get counts specific to the owner
            var totalCount = await query.CountAsync();
            var pendingCount = await query.CountAsync(l => l.Status == LeaveStatus.Pending);
            var approvedCount = await query.CountAsync(l => l.Status == LeaveStatus.Approved);
            var rejectedCount = await query.CountAsync(l => l.Status == LeaveStatus.Rejected);

            // Get paginated data
            var leaves = await query
                .OrderBy(l => l.Status == LeaveStatus.Pending ? 0 : 1)
                .ThenBy(l => l.StartDate)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                // Select directly into LeaveItem, using the known owner's email
                .Select(leave => new LeaveItem
                {
                    Id = leave.Id,
                    Type = leave.Type,
                    StartDate = leave.StartDate,
                    EndDate = leave.EndDate,
                    Status = leave.Status,
                    OwnerEmail = owner.User.Email // Use email from the CurrentUser object
                })
                .ToListAsync();

            var response = new PaginatedResponse<LeaveItem>
            {
                Data = leaves,
                TotalCount = totalCount,
                PendingCount = pendingCount,
                ApprovedCount = approvedCount,
                RejectedCount = rejectedCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };

            // Always return Ok, even if empty list, response structure indicates counts
            return TypedResults.Ok(response);
        });

        group.MapGet("/{id}", async Task<Results<Ok<LeaveItem>, NotFound>> (TodoDbContext db, int id, CurrentUser currentUser) =>
        {
            var leaveItem = await db.Leaves
                .Where(l => l.Id == id)
                // Join with Users to get the email
                .Join(db.Users,
                      leave => leave.OwnerId,
                      user => user.Id,
                      (leave, user) => new { Leave = leave, User = user }) // Intermediate anonymous type
                .Select(joined => new LeaveItem // Project to LeaveItem
                {
                    Id = joined.Leave.Id,
                    Type = joined.Leave.Type,
                    StartDate = joined.Leave.StartDate,
                    EndDate = joined.Leave.EndDate,
                    Status = joined.Leave.Status,
                    OwnerEmail = joined.User.Email
                })
                .FirstOrDefaultAsync();

            if (leaveItem == null)
            {
                return TypedResults.NotFound();
            }

            // Need to re-fetch the original leave entity briefly to check ownership
            // This is slightly less efficient but necessary for the authorization check here
            var originalLeave = await db.Leaves.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id);
            if (originalLeave == null || (originalLeave.OwnerId != currentUser.Id && !currentUser.IsAdmin))
            {
                // If the leave doesn't exist OR the user is not the owner and not an admin
                return TypedResults.NotFound(); // Treat as NotFound for security
            }

            // If ownership check passes, return the projected DTO
            return TypedResults.Ok(leaveItem);
        });

        group.MapPost("/", async Task<Results<Created<LeaveItem>, BadRequest<string>>> (TodoDbContext db, LeaveItem newLeave, CurrentUser owner) =>
        {
            // IMPORTANT: Add +1 if EndDate is inclusive of the leave period
            var leaveDays = (int)(newLeave.EndDate - newLeave.StartDate).TotalDays + 1;
            if (!owner.User.HasSufficientLeaveBalance(newLeave.Type, leaveDays))
            {
                return TypedResults.BadRequest("Insufficient leave balance.");
            }

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

        group.MapPut("/{id}", async Task<Results<Ok, NotFound, BadRequest<string>>> (TodoDbContext db, int id, LeaveItem leaveItem, CurrentUser owner) =>
        {
            if (id != leaveItem.Id)
            {
                return TypedResults.BadRequest("Route and payload Ids must match.");
            }

            var leave = await db.Leaves.FindAsync(id);

            if (leave == null || leave.OwnerId != owner.Id)
            {
                return TypedResults.NotFound();
            }

            // Check if the leave is still pending - only pending leaves can be edited
            if (leave.Status != LeaveStatus.Pending)
            {
                return TypedResults.BadRequest("Only pending leave requests can be modified.");
            }

            // Check balance before updating
            var leaveDays = (int)(leaveItem.EndDate - leaveItem.StartDate).TotalDays;
            if (!owner.User.HasSufficientLeaveBalance(leaveItem.Type, leaveDays))
            {
                return TypedResults.BadRequest("Insufficient leave balance for the updated request.");
            }

            // Update properties
            leave.UpdateFromLeaveItem(leaveItem);

            await db.SaveChangesAsync();

            return TypedResults.Ok();
        });

        group.MapDelete("/{id}", async Task<Results<NotFound, Ok>> (TodoDbContext db, int id, CurrentUser owner) =>
        {
            // Allow delete only if pending and owned by user, OR if admin
            var leaveToDelete = await db.Leaves.FindAsync(id);
            if (leaveToDelete == null)
            {
                return TypedResults.NotFound();
            }

            bool canDelete = (leaveToDelete.OwnerId == owner.Id && leaveToDelete.Status == LeaveStatus.Pending) || owner.IsAdmin;

            if (!canDelete)
            {
                // Return 404 or 403 if trying to delete something not allowed
                return TypedResults.NotFound();
            }

            var rowsAffected = await db.Leaves
                .Where(l => l.Id == id) // Condition already checked
                .ExecuteDeleteAsync();


            return rowsAffected == 0 ? TypedResults.NotFound() : TypedResults.Ok();
        });

        group.MapPost("/{id}/approve", async Task<Results<Ok, NotFound, BadRequest<string>>> (TodoDbContext db, int id, CurrentUser approver) =>
        {
            if (!approver.IsAdmin)
            {
                // Return 403 Forbidden or 404 Not Found if non-admin tries
                return TypedResults.NotFound();
            }

            var leave = await db.Leaves.FindAsync(id);
            // Ensure leave exists and is pending before approving
            if (leave == null || leave.Status != LeaveStatus.Pending)
            {
                return TypedResults.BadRequest("Leave request not found or already processed.");
            }

            // Need user context to potentially adjust balances
            var user = await db.Users.Include(u => u.LeaveBalances).FirstOrDefaultAsync(u => u.Id == leave.OwnerId);
            if (user == null)
            {
                return TypedResults.BadRequest("Leave owner not found.");
            }

            if (!leave.Approve(user))
            {
                // Approval logic might fail (e.g., start date passed)
                return TypedResults.BadRequest("Could not approve leave request.");
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        });

        group.MapPost("/{id}/reject", async Task<Results<Ok, NotFound, BadRequest<string>>> (TodoDbContext db, int id, CurrentUser approver) =>
        {
            if (!approver.IsAdmin)
            {
                return TypedResults.NotFound();
            }

            var leave = await db.Leaves.FindAsync(id);
            // Allow rejection of Pending OR Approved leaves (to revert an approval)
            if (leave == null || leave.Status == LeaveStatus.Rejected)
            {
                return TypedResults.BadRequest("Leave request not found or already rejected.");
            }

            var user = await db.Users.Include(u => u.LeaveBalances).FirstOrDefaultAsync(u => u.Id == leave.OwnerId);
            if (user == null)
            {
                return TypedResults.BadRequest("Leave owner not found.");
            }

            if (!leave.Reject(user))
            {
                return TypedResults.BadRequest("Could not reject leave request.");
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        });

        return group;
    }
}
