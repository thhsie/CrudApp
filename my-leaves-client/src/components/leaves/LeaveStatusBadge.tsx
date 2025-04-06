import { LeaveStatus } from '../../types/leave';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

export const LeaveStatusBadge = ({ status }: LeaveStatusBadgeProps) => {
  const getBadgeClass = () => {
    switch (status) {
      case LeaveStatus.Approved:
        return 'badge-success';
      case LeaveStatus.Rejected:
        return 'badge-error';
      case LeaveStatus.Pending:
      default:
        return 'badge-warning';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case LeaveStatus.Approved:
        return 'Approved';
      case LeaveStatus.Rejected:
        return 'Rejected';
      case LeaveStatus.Pending:
      default:
        return 'Pending';
    }
  };

  return (
    <div className={`badge ${getBadgeClass()}`}>
      {getStatusText()}
    </div>
  );
};