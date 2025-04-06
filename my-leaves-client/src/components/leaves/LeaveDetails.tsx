// --- Updated File: ./my-leaves-client/src/components/leaves/LeaveDetails.tsx ---
import React from 'react';
import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { formatDate } from '../../utils/dateUtils'; // Assuming you have this utility
import { LeaveStatusBadge } from './LeaveStatusBadge'; // Import badge

interface LeaveDetailsProps {
  leave: Leave | null;
  onClose: () => void;
  modalId?: string; // Optional ID for programmatic control if needed
}

// Helper function to get text - move to utils if used elsewhere
const getLeaveTypeText = (type: LeaveType): string => {
    switch (type) {
      case LeaveType.Annual: return 'Annual';
      case LeaveType.Sick: return 'Sick';
      case LeaveType.Special: return 'Special';
      case LeaveType.Unpaid: return 'Unpaid';
      default: return 'Unknown';
    }
  };

export const LeaveDetails = ({ leave, onClose, modalId = "leave_details_modal" }: LeaveDetailsProps) => {
  // This component now assumes the modal is controlled externally (e.g., by setting a state variable holding the 'leave' to display)
  // It renders the modal structure, but doesn't manage its open/closed state directly via internal state.

  if (!leave) return null; // Don't render anything if no leave is provided

  return (
    <dialog id={modalId} className="modal modal-open"> {/* Use modal-open driven by parent state */}
      <div className="modal-box w-11/12 max-w-lg"> {/* Control width */}
        <h3 className="font-bold text-xl mb-4">Leave Request Details</h3>

        {/* Using a definition list for better semantics */}
        <dl className="space-y-3">
            <div className="flex justify-between">
                <dt className="font-medium text-base-content/70">Request ID</dt>
                <dd>{leave.id}</dd>
            </div>
             <div className="flex justify-between">
                <dt className="font-medium text-base-content/70">Type</dt>
                <dd>{getLeaveTypeText(leave.type)}</dd>
            </div>
            <div className="flex justify-between">
                <dt className="font-medium text-base-content/70">Status</dt>
                <dd><LeaveStatusBadge status={leave.status} /></dd>
            </div>
            <div className="flex justify-between">
                <dt className="font-medium text-base-content/70">Start Date</dt>
                <dd>{formatDate(leave.startDate)}</dd>
            </div>
             <div className="flex justify-between">
                <dt className="font-medium text-base-content/70">End Date</dt>
                <dd>{formatDate(leave.endDate)}</dd>
            </div>
        </dl>


        {/* Close button in modal action */}
        <div className="modal-action mt-6">
          {/* Use button type="button" or form method="dialog" */}
           <form method="dialog" className="w-full"> {/* Form needed for modal-backdrop click */}
               <button className="btn btn-outline w-full" type="submit" onClick={onClose}>Close</button>
           </form>
          {/* <button className="btn btn-primary" onClick={onClose}>Close</button> */}
        </div>
      </div>
      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};