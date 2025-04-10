using System.ComponentModel.DataAnnotations;

public class LeaveBalances
{
    public LeaveBalances(int annualLeavesBalance, int sickLeavesBalance, int specialLeavesBalance)
    {
        AnnualLeavesBalance = annualLeavesBalance;
        SickLeavesBalance = sickLeavesBalance;
        SpecialLeavesBalance = specialLeavesBalance;
    }

    public LeaveBalances() : this(0, 0, 0) { }

    // Changed to auto-properties with getters and setters
    public int AnnualLeavesBalance { get; set; }
    public int SickLeavesBalance { get; set; }
    public int SpecialLeavesBalance { get; set; }

    public void IncreaseAnnualLeaves(int amount)
    {
        AnnualLeavesBalance += amount;
    }

    public bool DecreaseAnnualLeaves(int amount)
    {
        if (amount > AnnualLeavesBalance)
        {
            return false;
        }
        AnnualLeavesBalance -= amount;
        return true;
    }

    public void IncreaseSickLeaves(int amount)
    {
        SickLeavesBalance += amount;
    }

    public bool DecreaseSickLeaves(int amount)
    {
        if (amount > SickLeavesBalance)
        {
            return false;
        }
        SickLeavesBalance -= amount;
        return true;
    }

    public void IncreaseSpecialLeaves(int amount)
    {
        SpecialLeavesBalance += amount;
    }

    public bool DecreaseSpecialLeaves(int amount)
    {
        if (amount > SpecialLeavesBalance)
        {
            return false;
        }
        SpecialLeavesBalance -= amount;
        return true;
    }
}

// We will use this DTO to assign balances from a PUT endpoint
public class LeaveBalancesUpdateRequest
{
    [Range(0, int.MaxValue, ErrorMessage = $"The balance cannot be negative")]
    public int PaidLeavesBalance { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = $"The balance cannot be negative")]
    public int SickLeavesBalance { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = $"The balance cannot be negative")]
    public int SpecialLeavesBalance { get; set; }
}