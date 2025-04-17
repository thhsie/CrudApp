using System.ComponentModel.DataAnnotations;

public class Leave
{
    public int Id { get; set; }

    [Required]
    public string OwnerId { get; set; } = default!;
    public int Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public LeaveStatus Status { get; private set; } = LeaveStatus.Pending;
    public bool IsStartHalfDay { get; set; } = false;
    public bool IsEndHalfDay { get; set; } = false;

    public bool Approve(TodoUser user)
    {
        if (DateTime.Now.Date >= StartDate.Date)
        {
            return false;
        }

        bool balanceUpdated = false;
        var leaveDays = CalculateLeaveDuration();

        switch (Type)
        {
            case (int)LeaveType.Annual:
                balanceUpdated = user.DecreaseAnnualLeaves(leaveDays);
                break;
            case (int)LeaveType.Sick:
                balanceUpdated = user.DecreaseSickLeaves(leaveDays);
                break;
            case (int)LeaveType.Special:
                balanceUpdated = user.DecreaseSpecialLeaves(leaveDays);
                break;
            case (int)LeaveType.Unpaid:
                balanceUpdated = true; // No balance to check for unpaid leave
                break;
        }

        if (!balanceUpdated)
        {
            return false; // Insufficient balance
        }

        Status = LeaveStatus.Approved;
        return true;
    }

    public bool Reject(TodoUser user)
    {
        if (DateTime.Now.Date >= StartDate.Date)
        {
            return false;
        }

        if (Status == LeaveStatus.Approved)
        {
            var leaveDays = CalculateLeaveDuration();

            switch (Type)
            {
                case (int)LeaveType.Annual:
                    user.IncreaseAnnualLeaves(leaveDays);
                    break;
                case (int)LeaveType.Sick:
                    user.IncreaseSickLeaves(leaveDays);
                    break;
                case (int)LeaveType.Special:
                    user.IncreaseSpecialLeaves(leaveDays);
                    break;
            }
        }

        Status = LeaveStatus.Rejected;
        return true;
    }

    public decimal CalculateLeaveDuration()
    {
        // Ensure start is not after end (should be validated elsewhere too)
        if (StartDate.Date > EndDate.Date) return 0m;

        // Single Day Leave
        if (StartDate.Date == EndDate.Date)
        {
            // If either (but not both) is marked as half, it's 0.5 days.
            // If neither is marked, it's 1.0 day.
            // Marking both as half on a single day is invalid but could default to 0.5 or 1.0 - let's treat as 0.5.
            return (IsStartHalfDay || IsEndHalfDay) ? 0.5m : 1.0m;
        }

        // Multi-Day Leave
        decimal duration = 0m;

        // Calculate duration for the start day
        duration += IsStartHalfDay ? 0.5m : 1.0m;

        // Calculate duration for the end day (only if EndDate is after StartDate)
        duration += IsEndHalfDay ? 0.5m : 1.0m;

        // Calculate full days in between
        int fullDaysBetween = (int)(EndDate.Date - StartDate.Date).TotalDays - 1;
        if (fullDaysBetween > 0)
        {
            duration += fullDaysBetween;
        }

        return duration;
    }
}

// The DTO that excludes the OwnerId (we don't want that exposed to clients)
public class LeaveItem
{
    public int Id { get; set; }

    [Required]
    public int Type { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }
    public LeaveStatus Status { get; set; }

    public string? OwnerEmail { get; set; }

    public bool IsStartHalfDay { get; set; }
    public bool IsEndHalfDay { get; set; }
    // Optional: Add calculated duration if useful for frontend
    // public decimal Duration { get; set; }
}

public static class LeaveMappingExtensions
{
    public static LeaveItem AsLeaveItem(this Leave leave)
    {
        return new()
        {
            Id = leave.Id,
            Type = leave.Type,
            StartDate = leave.StartDate,
            EndDate = leave.EndDate,
            Status = leave.Status,
            IsStartHalfDay = leave.IsStartHalfDay,
            IsEndHalfDay = leave.IsEndHalfDay
            // OwnerEmail will now be set by projection in the API layer
        };
    }

    public static void UpdateFromLeaveItem(this Leave leave, LeaveItem leaveItem)
    {
        leave.Type = leaveItem.Type;
        leave.StartDate = leaveItem.StartDate;
        leave.EndDate = leaveItem.EndDate;
        leave.IsStartHalfDay = leaveItem.IsStartHalfDay;
        leave.IsEndHalfDay = leaveItem.IsEndHalfDay;
    }
}
