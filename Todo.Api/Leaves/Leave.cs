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

    public bool Approve(TodoUser user)
    {
        if (DateTime.Now.Date >= StartDate.Date)
        {
            return false;
        }

        bool balanceUpdated = false;
        int leaveDays = CalculateLeaveDays();

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
            int leaveDays = CalculateLeaveDays();

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

    private int CalculateLeaveDays()
    {
        return (int)(EndDate - StartDate).TotalDays;
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
            Status = leave.Status
            // OwnerEmail will now be set by projection in the API layer
        };
    }

    public static void UpdateFromLeaveItem(this Leave leave, LeaveItem leaveItem)
    {
        leave.Type = leaveItem.Type;
        leave.StartDate = leaveItem.StartDate;
        leave.EndDate = leaveItem.EndDate;
    }
}
