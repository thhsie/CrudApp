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
        if (DateTime.Now.Date < StartDate.Date)
        {
            switch (Type)
            {
                case (int)LeaveType.Annual:
                    user.DecreaseAnnualLeaves(CalculateLeaveDays());
                    break;
                case (int)LeaveType.Sick:
                    user.DecreaseSickLeaves(CalculateLeaveDays());
                    break;
                case (int)LeaveType.Special:
                    user.DecreaseSpecialLeaves(CalculateLeaveDays());
                    break;
            }

            Status = LeaveStatus.Approved;
            return true;
        }

        return false;
    }

    public bool Reject(TodoUser user)
    {
        if (DateTime.Now.Date < StartDate.Date)
        {
            if (Status == LeaveStatus.Approved)
            {
                switch (Type)
                {
                    case (int)LeaveType.Annual:
                        user.IncreaseAnnualLeaves(CalculateLeaveDays());
                        break;
                    case (int)LeaveType.Sick:
                        user.IncreaseSickLeaves(CalculateLeaveDays());
                        break;
                    case (int)LeaveType.Special:
                        user.IncreaseSpecialLeaves(CalculateLeaveDays());
                        break;
                }
            }

            Status = LeaveStatus.Rejected;
            return true;
        }

        return false;
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
    public int Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public LeaveStatus Status { get; set; }
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
        };
    }
}
