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
        if (AnnualLeavesBalance - amount < 0)
        {
            throw new InvalidOperationException("Cannot decrease AnnualLeavesBalance below zero.");
        }

        return new LeaveBalances(AnnualLeavesBalance - amount, SickLeavesBalance, SpecialLeavesBalance);
    }

    public LeaveBalances IncreaseSickLeaves(int amount)
    {
        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance + amount, SpecialLeavesBalance);
    }

    public LeaveBalances DecreaseSickLeaves(int amount)
    {
        if (SickLeavesBalance - amount < 0)
        {
            throw new InvalidOperationException("Cannot decrease SickLeavesBalance below zero.");
        }

        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance - amount, SpecialLeavesBalance);
    }

    public LeaveBalances IncreaseSpecialLeaves(int amount)
    {
        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance, SpecialLeavesBalance + amount);
    }

    public LeaveBalances DecreaseSpecialLeaves(int amount)
    {
        if (SpecialLeavesBalance - amount < 0)
        {
            throw new InvalidOperationException("Cannot decrease SpecialLeavesBalance below zero.");
        }

        return new LeaveBalances(AnnualLeavesBalance, SickLeavesBalance, SpecialLeavesBalance - amount);
    }
}

// We will use this DTO to assign balances from a PUT endpoint
public class LeaveBalancesUpdateRequest
{
    public int PaidLeavesBalance { get; set; }
    public int SickLeavesBalance { get; set; }
    public int SpecialLeavesBalance { get; set; }
}
