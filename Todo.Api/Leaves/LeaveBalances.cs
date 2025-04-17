using System.ComponentModel.DataAnnotations;

public class LeaveBalances
{
    public LeaveBalances(decimal annualLeavesBalance, decimal sickLeavesBalance, decimal specialLeavesBalance)
    {
        AnnualLeavesBalance = annualLeavesBalance;
        SickLeavesBalance = sickLeavesBalance;
        SpecialLeavesBalance = specialLeavesBalance;
    }

    public LeaveBalances() : this(0, 0, 0) { }

    public decimal AnnualLeavesBalance { get; set; }
    public decimal SickLeavesBalance { get; set; }
    public decimal SpecialLeavesBalance { get; set; }

    public void IncreaseAnnualLeaves(decimal amount)
    {
        AnnualLeavesBalance += amount;
    }

    public bool DecreaseAnnualLeaves(decimal amount)
    {
        if (amount > AnnualLeavesBalance)
        {
            return false;
        }
        AnnualLeavesBalance -= amount;
        return true;
    }

    public void IncreaseSickLeaves(decimal amount)
    {
        SickLeavesBalance += amount;
    }

    public bool DecreaseSickLeaves(decimal amount)
    {
        if (amount > SickLeavesBalance)
        {
            return false;
        }
        SickLeavesBalance -= amount;
        return true;
    }

    public void IncreaseSpecialLeaves(decimal amount)
    {
        SpecialLeavesBalance += amount;
    }

    public bool DecreaseSpecialLeaves(decimal amount)
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
    [Range(0.0, (double)decimal.MaxValue, ErrorMessage = $"The balance cannot be negative")]
    public decimal PaidLeavesBalance { get; set; }

    [Range(0.0, (double)decimal.MaxValue, ErrorMessage = $"The balance cannot be negative")]
    public decimal SickLeavesBalance { get; set; }

    [Range(0.0, (double)decimal.MaxValue, ErrorMessage = $"The balance cannot be negative")]
    public decimal SpecialLeavesBalance { get; set; }
}