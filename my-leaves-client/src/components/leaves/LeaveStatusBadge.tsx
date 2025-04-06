// --- Updated File: ./my-leaves-client/src/components/leaves/LeaveStatusBadge.tsx ---
import React from 'react';
import { LeaveStatus } from '../../types/leave';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

export const LeaveStatusBadge = ({ status }: LeaveStatusBadgeProps) => {
  let badgeClass = '';
  let statusText = 'Unknown';

  switch (status) {
    case LeaveStatus.Approved:
      badgeClass = 'badge-success'; // Use daisyUI semantic color
      statusText = 'Approved';
      break;
    case LeaveStatus.Rejected:
      badgeClass = 'badge-error'; // Use daisyUI semantic color
      statusText = 'Rejected';
      break;
    case LeaveStatus.Pending:
      badgeClass = 'badge-warning'; // Use daisyUI semantic color
      statusText = 'Pending';
      break;
    default:
      badgeClass = 'badge-ghost'; // Fallback style
      // Log unexpected status
      console.warn(`Unknown leave status encountered: ${status}`);
      break;
  }

  return (
    // Use badge component with appropriate color modifier
    // Add size modifier if needed e.g., badge-sm
    <div className={`badge ${badgeClass} badge-md font-semibold`}>
      {statusText}
    </div>
  );
};;