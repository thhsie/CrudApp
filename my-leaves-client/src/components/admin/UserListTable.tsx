// src/components/admin/UserListTable.tsx
import { UserListItem } from '../../types/auth';
import { FaEdit } from 'react-icons/fa';

interface UserListTableProps {
  users: UserListItem[];
  onEdit: (user: UserListItem) => void;
}

// Helper function to format the stat-like display within a cell
const renderLeaveStat = (balance: number | undefined | null, taken: number | undefined | null) => {
  // Default taken to 0 if null/undefined for display
  const displayTaken = taken ?? 0;

  // Handle balance display, applying color only if it's a valid number
  const displayBalanceElement = typeof balance === 'number'
    ? <span className="text-success">{balance.toFixed(1)}</span> // Apply success color
    : <span className="text-xs italic opacity-50">N/A</span>; // Render 'N/A' without success color

  return (
    <div className="text-right"> {/* Align content to the right */}
      {/* Balance: Render the conditionally colored element */}
      <div className="text-sm text-base-content/60 tabular-nums">
        Available: <span className="text-success font-medium">{displayBalanceElement}</span>
      </div>
      {/* Taken: Keep base style for "Taken:", apply error color only to the number */}
      <div className="text-xs text-base-content/60 tabular-nums">
        Taken: <span className="text-error font-medium">{displayTaken.toFixed(1)}</span>
      </div>
    </div>
  );
};

export const UserListTable = ({ users, onEdit }: UserListTableProps) => {
  return (
    <div className="overflow-x-auto"> {/* Keep horizontal scroll */}
      {/* Apply table-zebra for striping and potentially table-sm or table-xs for density */}
      <table className="table table-zebra table-sm w-full">
        {/* Head */}
        <thead className="text-base-content/80"> {/* Slightly enhance header contrast */}
          <tr>
            {/* User Info (takes more space now) */}
            <th className="w-1/3">User</th>

            {/* Combined Leave Type Headers */}
            <th className="text-right">Annual</th>
            <th className="text-right">Sick</th>
            <th className="text-right">Special</th>

            {/* Actions */}
            <th className="text-right">Edit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover"> {/* Keep hover effect */}
              {/* User Info Cell */}
              <td>
                <div className="font-bold">{user.userName || 'N/A'}</div>
                <div className="text-sm opacity-70">{user.email || 'No Email'}</div>
              </td>

              {/* Annual Leave Stat Cell */}
              <td>
                {renderLeaveStat(
                  user.leaveBalances?.annualLeavesBalance,
                  user.leavesTaken?.annualLeavesTaken,
                )}
              </td>

              {/* Sick Leave Stat Cell */}
              <td>
                 {renderLeaveStat(
                  user.leaveBalances?.sickLeavesBalance,
                  user.leavesTaken?.sickLeavesTaken,
                )}
              </td>

              {/* Special Leave Stat Cell */}
              <td>
                 {renderLeaveStat(
                  user.leaveBalances?.specialLeavesBalance,
                  user.leavesTaken?.specialLeavesTaken,
                )}
              </td>

              {/* Actions Cell */}
              <td className="text-right">
                <button
                  className="btn btn-ghost btn-sm btn-square" // Keep square ghost button for edit
                  onClick={() => onEdit(user)}
                  aria-label={`Edit balances for ${user.userName || user.email}`}
                  title="Edit Balances" // Add title for better accessibility
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
         {/* Optional: Footer for summary or notes */}
         {/* <tfoot>
          <tr>
            <td colSpan={5} className="text-center text-xs opacity-60">Leave balances and taken days</td>
          </tr>
        </tfoot> */}
      </table>
    </div>
  );
};