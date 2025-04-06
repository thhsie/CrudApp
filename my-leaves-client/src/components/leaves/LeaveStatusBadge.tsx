import { LeaveStatus } from '../../types/leave';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

export const LeaveStatusBadge = ({ status }: LeaveStatusBadgeProps) => {
  let badgeClass = '';
  let statusText = 'Unknown';

  switch (status) {
    case LeaveStatus.Approved:
      badgeClass = 'badge-success';
      statusText = 'Approved';
      break;
    case LeaveStatus.Rejected:
      badgeClass = 'badge-error';
      statusText = 'Rejected';
      break;
    case LeaveStatus.Pending:
      badgeClass = 'badge-warning';
      statusText = 'Pending';
      break;
    default:
      badgeClass = 'badge-ghost';
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