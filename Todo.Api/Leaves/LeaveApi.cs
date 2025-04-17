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

        // GET /leaves/all (Admin view)
        group.MapGet("/all", async Task<Results<Ok<PaginatedResponse<LeaveItem>>, NotFound, BadRequest<string>>> (
            TodoDbContext db,
            UserManager<TodoUser> userManager,
            [AsParameters] PaginationRequest pagination,
            [FromQuery] string? searchTerm,
            CurrentUser user) =>
        {
            if (!user.IsAdmin)
            {
                // Return 404 or 403 if a non-admin tries to access
                return TypedResults.NotFound();
            }

            string? targetUserId = null;
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLowerInvariant();
                var userQuery = db.Users.AsNoTracking().Where(u =>
                    (u.Email != null && u.Email.ToLower().Contains(lowerSearchTerm)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(lowerSearchTerm))
                );
                targetUserId = await userQuery.Select(u => u.Id).SingleOrDefaultAsync();

                // If search term provided but no user found, return empty paginated result
                if (string.IsNullOrEmpty(targetUserId))
                {
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
                }
            }

            var query = db.Leaves.AsSplitQuery().AsNoTracking();

            // Apply user filter if targetUserId was found
            if (!string.IsNullOrEmpty(targetUserId))
            {
                query = query.Where(l => l.OwnerId == targetUserId);
            }

            // Get counts (these counts reflect the filtered user if applicable)
            var totalCount = await query.CountAsync();
            var pendingCount = await query.CountAsync(l => l.Status == LeaveStatus.Pending);
            var approvedCount = await query.CountAsync(l => l.Status == LeaveStatus.Approved);
            var rejectedCount = await query.CountAsync(l => l.Status == LeaveStatus.Rejected);

            var leaves = await query
                .OrderBy(l => l.Status == LeaveStatus.Pending ? 0 : 1)
                .ThenBy(l => l.Status == LeaveStatus.Pending ? l.StartDate : DateTime.MaxValue)
                .ThenByDescending(l => l.Status != LeaveStatus.Pending ? l.StartDate : DateTime.MinValue)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Join(db.Users, // Join with Users to get the email
                      leave => leave.OwnerId, // Outer key selector
                      appUser => appUser.Id, // Inner key selector
                      (leave, appUser) => new LeaveItem // Project directly to LeaveItem
                      {
                          Id = leave.Id,
                          Type = leave.Type,
                          StartDate = leave.StartDate,
                          EndDate = leave.EndDate,
                          Status = leave.Status,
                          IsStartHalfDay = leave.IsStartHalfDay,
                          IsEndHalfDay = leave.IsEndHalfDay,
                          OwnerEmail = appUser.Email
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

        // GET /leaves (Current user view)
        group.MapGet("/", async Task<Ok<PaginatedResponse<LeaveItem>>> (TodoDbContext db, CurrentUser owner, [AsParameters] PaginationRequest pagination) =>
        {
            var query = db.Leaves
               .Where(leave => leave.OwnerId == owner.Id)
               .AsNoTracking();

            var totalCount = await query.CountAsync();
            var pendingCount = await query.CountAsync(l => l.Status == LeaveStatus.Pending);
            var approvedCount = await query.CountAsync(l => l.Status == LeaveStatus.Approved);
            var rejectedCount = await query.CountAsync(l => l.Status == LeaveStatus.Rejected);

            var leaves = await query
                .OrderBy(l => l.Status == LeaveStatus.Pending ? 0 : 1)
                .ThenBy(l => l.Status == LeaveStatus.Pending ? l.StartDate : DateTime.MaxValue)
                .ThenByDescending(l => l.Status != LeaveStatus.Pending ? l.StartDate : DateTime.MinValue)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(leave => new LeaveItem // Project directly into LeaveItem
                {
                    Id = leave.Id,
                    Type = leave.Type,
                    StartDate = leave.StartDate,
                    EndDate = leave.EndDate,
                    Status = leave.Status,
                    IsStartHalfDay = leave.IsStartHalfDay,
                    IsEndHalfDay = leave.IsEndHalfDay,
                    OwnerEmail = owner.User!.Email // Use email from CurrentUser
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

        // GET /leaves/{id}
        group.MapGet("/{id}", async Task<Results<Ok<LeaveItem>, NotFound>> (TodoDbContext db, int id, CurrentUser currentUser) =>
        {
            // Fetch the projected LeaveItem first
            var leaveItem = await db.Leaves
               .Where(l => l.Id == id)
               .Join(db.Users,
                     leave => leave.OwnerId,
                     user => user.Id,
                     (leave, user) => new LeaveItem // Project to LeaveItem
                     {
                         Id = leave.Id,
                         Type = leave.Type,
                         StartDate = leave.StartDate,
                         EndDate = leave.EndDate,
                         Status = leave.Status,
                         IsStartHalfDay = leave.IsStartHalfDay,
                         IsEndHalfDay = leave.IsEndHalfDay,
                         s
                         OwnerEmail = user.Email
                     })
               .FirstOrDefaultAsync();

            if (leaveItem == null)
            {
                return TypedResults.NotFound();
            }

            // Perform authorization check separately on the original entity if needed
            // (Less efficient but separates concerns)
            var originalLeaveOwnerId = await db.Leaves
                .Where(l => l.Id == id)
                .Select(l => l.OwnerId)
                .FirstOrDefaultAsync();

            if (originalLeaveOwnerId == null || (originalLeaveOwnerId != currentUser.Id && !currentUser.IsAdmin))
            {
                // If the leave doesn't exist OR the user is not the owner and not an admin
                return TypedResults.NotFound(); // Treat as NotFound for security
            }

            // If ownership check passes, return the projected DTO
            return TypedResults.Ok(leaveItem);
        });

        // POST /leaves (Create)
        group.MapPost("/", async Task<Results<Created<LeaveItem>, BadRequest<string>>> (TodoDbContext db, LeaveItem newLeave, CurrentUser owner) =>
        {
            // --- Validation ---
            // 1. Single day request validation
            if (newLeave.StartDate.Date == newLeave.EndDate.Date && newLeave.IsStartHalfDay && newLeave.IsEndHalfDay)
            {
                return TypedResults.BadRequest("Cannot request both start and end as half-day for a single-day leave.");
            }

            // 2. Overlap check (Basic - Needs refinement for precise half-day overlap)
            //    This basic check prevents obvious full-day overlaps with pending requests.
            //    A precise half-day check would require more complex logic comparing start/end times potentially.
            var overlappingLeave = await db.Leaves
                .AnyAsync(l => l.OwnerId == owner.Id &&
                               l.Status == LeaveStatus.Pending &&
                               l.StartDate.Date <= newLeave.EndDate.Date && // Basic date range check
                               newLeave.StartDate.Date <= l.EndDate.Date);

            if (overlappingLeave)
            {
                // NOTE: This message might be slightly inaccurate if the overlap is only partial due to half-days.
                return TypedResults.BadRequest("You already have a pending leave request that overlaps with this period.");
            }

            // --- Create Entity ---
            var leave = new Leave
            {
                OwnerId = owner.Id,
                Type = newLeave.Type,
                StartDate = newLeave.StartDate,
                EndDate = newLeave.EndDate,
                IsStartHalfDay = newLeave.IsStartHalfDay,
                IsEndHalfDay = newLeave.IsEndHalfDay,
                // Status defaults to Pending
            };

            // 3. Balance Check (using decimal duration)
            var leaveDuration = leave.CalculateLeaveDuration();
            // Ensure user is loaded with balances for the check
            var userWithBalances = await db.Users.Include(u => u.LeaveBalances).FirstOrDefaultAsync(u => u.Id == owner.Id);
            if (userWithBalances == null) // Should not happen for authenticated user, but safety check
            {
                return TypedResults.BadRequest("User not found.");
            }
            if (!userWithBalances.HasSufficientLeaveBalance(leave.Type, leaveDuration))
            {
                return TypedResults.BadRequest("Insufficient leave balance.");
            }

            // --- Save ---
            db.Leaves.Add(leave);
            await db.SaveChangesAsync();

            // Return the created item (Projecting to LeaveItem)
            var createdLeaveItem = leave.AsLeaveItem();
            createdLeaveItem.OwnerEmail = owner.User!.Email; // Add email
            return TypedResults.Created($"/leaves/{leave.Id}", createdLeaveItem);
        });

        // PUT /leaves/{id} (Update)
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

            // --- Validation ---
            // 1. Single day request validation
            if (leaveItem.StartDate.Date == leaveItem.EndDate.Date && leaveItem.IsStartHalfDay && leaveItem.IsEndHalfDay)
            {
                return TypedResults.BadRequest("Cannot request both start and end as half-day for a single-day leave.");
            }

            // --- Create a temporary Leave object with updated values for balance check ---
            // This avoids modifying the tracked entity before the check passes.
            var tempLeaveForCheck = new Leave
            {
                StartDate = leaveItem.StartDate,
                EndDate = leaveItem.EndDate,
                IsStartHalfDay = leaveItem.IsStartHalfDay,
                IsEndHalfDay = leaveItem.IsEndHalfDay,
                Type = leaveItem.Type
            };
            var updatedLeaveDuration = tempLeaveForCheck.CalculateLeaveDuration();

            // 2. Balance Check (using updated duration and potentially updated type)
            // Use the already loaded owner with balances
            if (!owner.User.HasSufficientLeaveBalance(leaveItem.Type, updatedLeaveDuration))
            {
                return TypedResults.BadRequest("Insufficient leave balance for the updated request.");
            }

            // --- Update Properties ---
            // Update properties using the extension method (ensure it's updated for half-days)
            leave.UpdateFromLeaveItem(leaveItem);

            await db.SaveChangesAsync();

            return TypedResults.Ok();
        });

        // DELETE /leaves/{id}
        group.MapDelete("/{id}", async Task<Results<NotFound, Ok, BadRequest<string>>> (TodoDbContext db, int id, CurrentUser owner) =>
        {
            var rowsAffected = await db.Leaves
                .Where(l => l.Id == id &&
                            ((l.OwnerId == owner.Id && l.Status == LeaveStatus.Pending) || owner.IsAdmin))
                .ExecuteDeleteAsync();
            return rowsAffected == 0 ? TypedResults.NotFound() : TypedResults.Ok();
        });

        // POST /leaves/{id}/approve (Admin)
        group.MapPost("/{id}/approve", async Task<Results<Ok, NotFound, BadRequest<string>>> (TodoDbContext db, int id, CurrentUser approver) =>
        {
            if (!approver.IsAdmin)
            {
                return TypedResults.NotFound(); // Or Forbidden (403)
            }

            // Load leave AND the owner with their balances
            var leave = await db.Leaves.FirstOrDefaultAsync(l => l.Id == id);
            var owner = await db.Users.Include(u => u.LeaveBalances).FirstOrDefaultAsync(u => u.Id == leave.OwnerId);

            if (leave == null)
            {
                return TypedResults.NotFound(); // Leave itself not found
            }

            // Check status before approving
            if (leave.Status != LeaveStatus.Pending)
            {
                return TypedResults.BadRequest("Leave request is not pending.");
            }

            if (owner == null || owner.LeaveBalances == null)
            {
                // This shouldn't happen if includes worked, but safety check
                return TypedResults.BadRequest("Leave owner or balances not found.");
            }

            // Perform approval logic (which now uses decimal duration)
            if (!leave.Approve(owner)) // Pass the loaded user object
            {
                // Approval logic might fail (e.g., start date passed, insufficient balance)
                // Check balance again explicitly to give a clearer message
                var duration = leave.CalculateLeaveDuration();
                if (!owner.HasSufficientLeaveBalance(leave.Type, duration))
                {
                    return TypedResults.BadRequest("Insufficient leave balance for owner.");
                }
                // Otherwise, assume start date passed
                return TypedResults.BadRequest("Approval failed. Start date may have passed or balance issue.");
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        });

        // POST /leaves/{id}/reject (Admin)
        group.MapPost("/{id}/reject", async Task<Results<Ok, NotFound, BadRequest<string>>> (TodoDbContext db, int id, CurrentUser approver) =>
        {
            if (!approver.IsAdmin)
            {
                return TypedResults.NotFound(); // Or Forbidden (403)
            }

            // Load leave AND the owner with their balances (needed if reverting an approval)
            var leave = await db.Leaves.FirstOrDefaultAsync(l => l.Id == id);
            var owner = await db.Users.Include(u => u.LeaveBalances).FirstOrDefaultAsync(u => u.Id == leave.OwnerId);

            if (leave == null)
            {
                return TypedResults.NotFound();
            }

            // Allow rejection of Pending OR Approved leaves (to revert an approval)
            if (leave.Status == LeaveStatus.Rejected)
            {
                return TypedResults.BadRequest("Leave request is already rejected.");
            }

            if (owner == null || owner.LeaveBalances == null)
            {
                return TypedResults.BadRequest("Leave owner or balances not found.");
            }

            if (!leave.Reject(owner))
            {
                // Rejection logic currently only fails if start date passed
                return TypedResults.BadRequest("Start date may have passed.");
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        });

        return group;
    }
}
