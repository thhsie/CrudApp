using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace TodoApi;

// This is our TodoUser, we can modify this if we need
// to add custom properties to the user
public class TodoUser : IdentityUser
{
    #region Leave balances
    public LeaveBalances LeaveBalances { get; private set; } = null!;

    public void SetLeaveBalances(int paidLeavesBalance, int sickLeavesBalance, int specialLeavesBalance)
    {
        LeaveBalances = new LeaveBalances(paidLeavesBalance, sickLeavesBalance, specialLeavesBalance);
    }

    public void IncreaseAnnualLeaves(int amount)
    {
        LeaveBalances = LeaveBalances.IncreaseAnnualLeaves(amount);
    }

    public void DecreaseAnnualLeaves(int amount)
    {
        LeaveBalances = LeaveBalances.DecreaseAnnualLeaves(amount);
    }

    public void IncreaseSickLeaves(int amount)
    {
        LeaveBalances = LeaveBalances.IncreaseSickLeaves(amount);
    }

    public void DecreaseSickLeaves(int amount)
    {
        LeaveBalances = LeaveBalances.DecreaseSickLeaves(amount);
    }

    public void IncreaseSpecialLeaves(int amount)
    {
        LeaveBalances = LeaveBalances.IncreaseSpecialLeaves(amount);
    }

    public void DecreaseSpecialLeaves(int amount)
    {
        LeaveBalances = LeaveBalances.DecreaseSpecialLeaves(amount);
    }

    public bool HasSufficientLeaveBalance(int leaveType, int days)
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
