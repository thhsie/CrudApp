// --- Updated File: ./my-leaves-client/src/components/leaves/LeaveForm.tsx ---
import React, { useState } from 'react';
import { LeaveRequestData, LeaveType } from '../../types/leave';

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
      {error && (
         <div role="alert" className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
        </div>
      )}

      {/* Leave Type Select */}
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Leave Type</span>
        </div>
        <select
          name="type"
          value={leaveRequest.type}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
          aria-label="Select Leave Type" // Accessibility
        >
          {/* Map enum values to options */}
          <option value={LeaveType.Annual}>Annual Leave</option>
          <option value={LeaveType.Sick}>Sick Leave</option>
          <option value={LeaveType.Special}>Special Leave</option>
          <option value={LeaveType.Unpaid}>Unpaid Leave</option>
        </select>
      </label>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="input input-bordered w-full" // Use input class
            required
            min={today} // Prevent selecting past dates
            aria-label="Leave Start Date" // Accessibility
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
            className="input input-bordered w-full" // Use input class
            required
            min={leaveRequest.startDate || today} // Ensure end date >= start date
            aria-label="Leave End Date" // Accessibility
          />
        </label>
      </div>

      {/* Submit Button */}
      <div className="form-control pt-4"> {/* Add padding top */}
        <button
          type="submit"
          className={`btn btn-primary w-full md:w-auto ${isSubmitting ? 'btn-disabled' : ''}`} // Adjust width, use btn-disabled
          disabled={isSubmitting}
        >
          {isSubmitting && <span className="loading loading-spinner loading-xs mr-2"></span>} {/* Add spinner */}
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};;