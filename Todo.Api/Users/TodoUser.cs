using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace TodoApi;

// This is our TodoUser, we can modify this if we need
// to add custom properties to the user
public class TodoUser : IdentityUser
{
    #region Leave balances
    public LeaveBalances LeaveBalances { get; private set; } = null!;

    public void SetLeaveBalances(decimal paidLeavesBalance, decimal sickLeavesBalance, decimal specialLeavesBalance)
    {
        LeaveBalances = new LeaveBalances(paidLeavesBalance, sickLeavesBalance, specialLeavesBalance);
    }

    public void IncreaseAnnualLeaves(decimal amount)
    {
        LeaveBalances.IncreaseAnnualLeaves(amount);
    }

    public bool DecreaseAnnualLeaves(decimal amount)
    {
        return LeaveBalances.DecreaseAnnualLeaves(amount);
    }

    public void IncreaseSickLeaves(decimal amount)
    {
        LeaveBalances.IncreaseSickLeaves(amount);
    }

    public bool DecreaseSickLeaves(decimal amount)
    {
        return LeaveBalances.DecreaseSickLeaves(amount);
    }

    public void IncreaseSpecialLeaves(decimal amount)
    {
        LeaveBalances.IncreaseSpecialLeaves(amount);
    }

    public bool DecreaseSpecialLeaves(decimal amount)
    {
        return LeaveBalances.DecreaseSpecialLeaves(amount);
    }

    public bool HasSufficientLeaveBalance(decimal leaveType, decimal days)
    {
        if (LeaveBalances == null)
        {
            return false;
        }

        return (LeaveType)leaveType switch
        {
            LeaveType.Annual => LeaveBalances.AnnualLeavesBalance >= days,
            LeaveType.Sick => LeaveBalances.SickLeavesBalance >= days,
            LeaveType.Special => LeaveBalances.SpecialLeavesBalance >= days,
            LeaveType.Unpaid => true,
            _ => false, // Unknown leave type
        };
    }
    #endregion
}

// This is the DTO used to exchange username and password details to
// the create user and token endpoints
public class UserInfo
{
    [Required]
    public string Email { get; set; } = default!;

    [Required]
    public string Password { get; set; } = default!;
}

public class ExternalUserInfo
{
    [Required]
    public string Username { get; set; } = default!;

    [Required]
    public string ProviderKey { get; set; } = default!;

    public string? Email { get; set; }
}

// To assign a role to a user
public class UserRole
{
    [Required]
    public string Email { get; set; } = default!;

    [Required]
    public string Role { get; set; } = default!;
}

// DTO for Taken Leave Counts
public class LeavesTakenDto
{
    public decimal AnnualLeavesTaken { get; set; }
    public decimal SickLeavesTaken { get; set; }
    public decimal SpecialLeavesTaken { get; set; }
}

// DTO for Leave Balances
public class LeaveBalancesDto
{
    public decimal AnnualLeavesBalance { get; set; }
    public decimal SickLeavesBalance { get; set; }
    public decimal SpecialLeavesBalance { get; set; }
}

// UPDATE the UserListItemDto to include both balances and taken counts
public class UserListItemDto
{
    public required string Id { get; set; }
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public LeaveBalancesDto? LeaveBalances { get; set; }
    public LeavesTakenDto? LeavesTaken { get; set; } // Add this property
}
