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
        LeaveBalances.IncreaseAnnualLeaves(amount);
    }

    public bool DecreaseAnnualLeaves(int amount)
    {
        return LeaveBalances.DecreaseAnnualLeaves(amount);
    }

    public void IncreaseSickLeaves(int amount)
    {
        LeaveBalances.IncreaseSickLeaves(amount);
    }

    public bool DecreaseSickLeaves(int amount)
    {
        return LeaveBalances.DecreaseSickLeaves(amount);
    }

    public void IncreaseSpecialLeaves(int amount)
    {
        LeaveBalances.IncreaseSpecialLeaves(amount);
    }

    public bool DecreaseSpecialLeaves(int amount)
    {
        return LeaveBalances.DecreaseSpecialLeaves(amount);
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

public class LeaveBalancesDto // DTO for owned entity
{
    public int AnnualLeavesBalance { get; set; }
    public int SickLeavesBalance { get; set; }
    public int SpecialLeavesBalance { get; set; }
}
public class UserListItemDto
{
    public required string Id { get; set; }
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public LeaveBalancesDto? LeaveBalances { get; set; } // Use the DTO
}