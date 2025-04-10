/* =============================================
   9. src/components/admin/UserListTable.tsx (NEW FILE)
   ============================================= */
import React from 'react';
import { UserListItem } from '../../types/auth';

interface UserListTableProps {
  users: UserListItem[];
  onEdit: (user: UserListItem) => void; // Callback when edit button is clicked
}

export const UserListTable = ({ users, onEdit }: UserListTableProps) => {
  return (
    // Use DaisyUI table component within an overflow container for responsiveness
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full table-sm md:table-md"> {/* Use size modifiers */}
        {/* Table Head */}
        <thead>
          <tr>
            <th>Email</th>
            <th>User Name</th>
            <th className="text-right">Annual</th> {/* Align balance numbers to the right */}
            <th className="text-right">Sick</th>
            <th className="text-right">Special</th>
            <th className="text-center">Actions</th> {/* Center align actions */}
          </tr>
        </thead>
        {/* Table Body */}
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover"> {/* Add hover effect */}
              {/* User Email (truncate if long) */}
              <td className="max-w-xs truncate" title={user.email ?? undefined}>{user.email || '-'}</td>
              {/* User Name */}
              <td>{user.userName || '-'}</td>
              {/* Leave Balances (handle null case, align right) */}
              <td className="text-right">
                {user.leaveBalances?.annualLeavesBalance ?? <span className="text-base-content/50">N/A</span>}
              </td>
              <td className="text-right">
                {user.leaveBalances?.sickLeavesBalance ?? <span className="text-base-content/50">N/A</span>}
              </td>
              <td className="text-right">
                {user.leaveBalances?.specialLeavesBalance ?? <span className="text-base-content/50">N/A</span>}
              </td>
              {/* Action Button */}
              <td className="text-center">
                <button
                  className="btn btn-ghost btn-sm text-primary px-2" // Smaller padding, ghost style
                  onClick={() => onEdit(user)} // Trigger edit handler
                  aria-label={`Edit leave balances for ${user.email || user.userName}`}
                >
                  Edit Balances
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};