import { useState } from 'react';
import { LeaveRequest, LeaveType } from '../../types/leave';

interface LeaveFormProps {
  onSubmit: (leave: LeaveRequest) => void;
  isSubmitting: boolean;
}

export const LeaveForm = ({ onSubmit, isSubmitting }: LeaveFormProps) => {
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest>({
    startDate: '',
    endDate: '',
    reason: '',
    type: LeaveType.Vacation,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLeaveRequest((prev) => ({
      ...prev,
      [name]: name === 'type' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(leaveRequest);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Leave Type</span>
        </label>
        <select
          name="type"
          value={leaveRequest.type}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value={LeaveType.Vacation}>Vacation</option>
          <option value={LeaveType.Sick}>Sick</option>
          <option value={LeaveType.Personal}>Personal</option>
          <option value={LeaveType.Bereavement}>Bereavement</option>
          <option value={LeaveType.Other}>Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={leaveRequest.startDate}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={leaveRequest.endDate}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Reason</span>
        </label>
        <textarea
          name="reason"
          value={leaveRequest.reason}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
          placeholder="Please provide a reason for your leave request..."
          required
        />
      </div>

      <div className="form-control mt-6">
        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};