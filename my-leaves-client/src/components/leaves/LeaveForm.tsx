// --- Updated File: ./my-leaves-client/src/components/leaves/LeaveForm.tsx ---
import React, { useState } from 'react';
import { LeaveRequestData, LeaveType } from '../../types/leave';
import { ErrorDisplay } from '../ui/ErrorDisplay'; // Using standard error display

interface LeaveFormProps {
  onSubmit: (leave: LeaveRequestData) => void;
  isSubmitting: boolean;
}

export const LeaveForm = ({ onSubmit, isSubmitting }: LeaveFormProps) => {
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequestData>({
    startDate: '',
    endDate: '',
    type: LeaveType.Annual, // Default to Annual
  });
  const [error, setError] = useState<string | null>(null); // For validation errors

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setError(null); // Clear error on change
    setLeaveRequest((prev) => ({
      ...prev,
      [name]: name === 'type' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    if (!leaveRequest.startDate || !leaveRequest.endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    if (new Date(leaveRequest.endDate) < new Date(leaveRequest.startDate)) {
        setError("End date cannot be before start date.");
        return;
    }
    onSubmit(leaveRequest);
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Validation Error Display */}
      {error && <ErrorDisplay message={error} />}

      {/* Leave Type Select */}
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Leave Type</span>
        </div>
        <select
          name="type"
          value={leaveRequest.type}
          onChange={handleChange}
          className="select select-bordered w-full" // Standard bordered select
          required
          aria-label="Select Leave Type" // Accessibility
          disabled={isSubmitting} // Disable while submitting
        >
          {/* Map enum values to options */}
          <option value={LeaveType.Annual}>Annual Leave</option>
          <option value={LeaveType.Sick}>Sick Leave</option>
          <option value={LeaveType.Special}>Special Leave</option>
          <option value={LeaveType.Unpaid}>Unpaid Leave</option>
        </select>
      </label>

      {/* Date Inputs in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Start Date</span>
          </div>
          <input
            type="date"
            name="startDate"
            value={leaveRequest.startDate}
            onChange={handleChange}
            className="input input-bordered w-full" // Standard bordered input
            required
            min={today} // Prevent selecting past dates
            aria-label="Leave Start Date" // Accessibility
            disabled={isSubmitting} // Disable while submitting
          />
        </label>

        {/* End Date */}
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">End Date</span>
          </div>
          <input
            type="date"
            name="endDate"
            value={leaveRequest.endDate}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
            min={leaveRequest.startDate || today} // Ensure end date >= start date
            aria-label="Leave End Date" // Accessibility
            disabled={isSubmitting} // Disable while submitting
          />
        </label>
      </div>

      {/* Submit Button */}
      <div className="form-control pt-4 flex items-end"> {/* Align button right */}
        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`} // Keep width auto, use btn-disabled
          disabled={isSubmitting}
        >
          {isSubmitting && <span className="loading loading-spinner loading-sm mr-2"></span>} {/* Use sm spinner */}
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};