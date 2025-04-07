using System.ComponentModel.DataAnnotations;

public class LeaveBalances
{
    public LeaveBalances(int paidLeavesBalance, int sickLeavesBalance, int specialLeavesBalance)
    {
        AnnualLeavesBalance = paidLeavesBalance;
        SickLeavesBalance = sickLeavesBalance;
        SpecialLeavesBalance = specialLeavesBalance;
    }

    public LeaveBalances() : this(0, 0, 0) { }

    public int AnnualLeavesBalance { get; }
    public int SickLeavesBalance { get; }
    public int SpecialLeavesBalance { get; }

    public LeaveBalances IncreaseAnnualLeaves(int amount)
    {
        return new LeaveBalances(AnnualLeavesBalance + amount, SickLeavesBalance, SpecialLeavesBalance);
    }

    public LeaveBalances DecreaseAnnualLeaves(int amount)
    {
        int newBalance = Math.Max(0, AnnualLeavesBalance - amount);
        return new LeaveBalances(newBalance, SickLeavesBalance, SpecialLeavesBalance);
    }

    public LeaveBalances IncreaseSickLeaves(int amount)
    {
        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance + amount, SpecialLeavesBalance);
    }

    public LeaveBalances DecreaseSickLeaves(int amount)
    {
        int newBalance = Math.Max(0, SickLeavesBalance - amount);
        return new LeaveBalances(AnnualLeavesBalance, newBalance, SpecialLeavesBalance);
    }

    public LeaveBalances IncreaseSpecialLeaves(int amount)
    {
        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance, SpecialLeavesBalance + amount);
    }

    public LeaveBalances DecreaseSpecialLeaves(int amount)
    {
        int newBalance = Math.Max(0, SpecialLeavesBalance - amount);
        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance, newBalance);
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
