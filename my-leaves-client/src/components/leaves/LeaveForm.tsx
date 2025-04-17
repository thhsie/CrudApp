import React, { useState, useEffect, useRef } from 'react';
import { LeaveRequestData, LeaveType } from '../../types/leave';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { DayPicker } from 'react-day-picker';
import { format, isValid, parse } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface LeaveFormProps {
  onSubmit: (leave: LeaveRequestData) => void;
  isSubmitting: boolean;
}

type OpenModalType = 'start' | 'end' | null;

// Define leave type options for mapping
const leaveTypeOptions = [
    { value: LeaveType.Annual, label: 'Annual Leave' },
    { value: LeaveType.Sick, label: 'Sick Leave' },
    { value: LeaveType.Special, label: 'Special Leave' },
    { value: LeaveType.Unpaid, label: 'Unpaid Leave' },
];

export const LeaveForm = ({ onSubmit, isSubmitting }: LeaveFormProps) => {
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequestData>({
    startDate: '',
    endDate: '',
    type: LeaveType.Annual, // Default selection
    isStartHalfDay: false,
    isEndHalfDay: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
  const [openModal, setOpenModal] = useState<OpenModalType>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const [isStartHalfDay, setIsStartHalfDay] = useState<boolean>(false);
  const [isEndHalfDay, setIsEndHalfDay] = useState<boolean>(false);

  useEffect(() => {
    const parseDate = (dateStr: string): Date | undefined => {
        if (!dateStr) return undefined;
        const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
        return isValid(parsed) ? parsed : undefined;
    }
    setSelectedStartDate(parseDate(leaveRequest.startDate));
    setSelectedEndDate(parseDate(leaveRequest.endDate));
  }, [leaveRequest.startDate, leaveRequest.endDate]);

  useEffect(() => {
     const modal = modalRef.current;
     if (modal) {
       if (openModal !== null && !modal.open) {
         modal.showModal();
       } else if (openModal === null && modal.open) {
         modal.close();
       }
     }
   }, [openModal]);

   // Update handler for radio buttons
   const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setLeaveRequest((prev) => ({
      ...prev,
      type: parseInt(e.target.value, 10) as LeaveType, // Parse value from radio
    }));
  };

  const handleDateSelectInModal = (date: Date | undefined) => {
      setError(null);
      if (openModal === 'start') {
          const newStartDate = date ? format(date, 'yyyy-MM-dd') : '';
          setSelectedStartDate(date);
          setLeaveRequest(prev => ({ ...prev, startDate: newStartDate }));
          if (!date) setIsStartHalfDay(false);
          if (date && selectedEndDate && date > selectedEndDate) {
              setSelectedEndDate(undefined);
              setLeaveRequest(prev => ({ ...prev, endDate: '' }));
          }
          setOpenModal(null);
      } else if (openModal === 'end') {
          if (date && selectedStartDate && date < selectedStartDate) {
              setError("End date cannot be before the start date.");
              return;
          }
          if (!date) setIsEndHalfDay(false);
          const newEndDate = date ? format(date, 'yyyy-MM-dd') : '';
          setSelectedEndDate(date);
          setLeaveRequest(prev => ({ ...prev, endDate: newEndDate }));
          setOpenModal(null);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!leaveRequest.startDate || !leaveRequest.endDate) {
      setError("Please select both start and end dates.");
      return;
    }
     if (leaveRequest.endDate < leaveRequest.startDate) {
         setError("End date cannot be before start date.");
         return;
     }
     // Add validation for single day half/half
     if (leaveRequest.startDate === leaveRequest.endDate && isStartHalfDay && isEndHalfDay) {
         setError("Cannot select both first and last day as half for a single day leave.");
         return;
     }

    onSubmit({
        ...leaveRequest,
        isStartHalfDay: isStartHalfDay,
        isEndHalfDay: isEndHalfDay
    });

    // Optionally reset flags after successful submission (handled in parent usually)
    // setIsStartHalfDay(false);
    // setIsEndHalfDay(false);
  };

  const today = new Date();

  const formatDateForDisplay = (dateString: string) => {
      if (!dateString) return <span className="text-base-content/50">Select date...</span>;
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return isValid(date) ? format(date, 'PPP') : <span className="text-error">Invalid Date</span>;
  };

  return (
    <>
        <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorDisplay message={error} />}

        {/* --- Leave Type Radio Buttons --- */}
        <div className="form-control w-full">
            <label className="label"><span className="label-text">Leave Type</span></label>
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-1">
                {leaveTypeOptions.map((option) => (
                    <label key={option.value} className="label cursor-pointer space-x-2">
                        <input
                            type="radio"
                            name="type"
                            className="radio radio-primary"
                            value={option.value}
                            checked={leaveRequest.type === option.value}
                            onChange={handleTypeChange}
                            disabled={isSubmitting}
                        />
                        <span className="label-text">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* Date Inputs using Modals and DayPicker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date Trigger */}
            <label className="form-control w-full">
                <div className="label"><span className="label-text">Start Date</span></div>
                <button type="button" className="btn btn-outline border-base-300 justify-start font-normal w-full hover:bg-base-200 h-12" onClick={() => setOpenModal('start')} disabled={isSubmitting}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 opacity-60 flex-shrink-0"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                    {formatDateForDisplay(leaveRequest.startDate)}
                </button>
            </label>

            {/* End Date Trigger */}
            <label className="form-control w-full">
                <div className="label"><span className="label-text">End Date</span></div>
                 <button type="button" className={`btn btn-outline border-base-300 justify-start font-normal w-full hover:bg-base-200 h-12 ${!leaveRequest.startDate || isSubmitting ? 'btn-disabled' : ''}`} onClick={() => { if (leaveRequest.startDate) setOpenModal('end'); }} disabled={!leaveRequest.startDate || isSubmitting}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 opacity-60 flex-shrink-0"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                    {formatDateForDisplay(leaveRequest.endDate)}
                     {!leaveRequest.startDate && <span className="text-xs text-base-content/50 ml-auto">Select start date first</span>}
                </button>
            </label>
        </div>

        {/* --- Half Day Selection --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0 mt-[-10px] mb-2"> {/* Adjust grid/margins */}
          {/* Start Half Day Checkbox */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2 py-1"> {/* Reduced padding */}
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={isStartHalfDay}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsStartHalfDay(checked);
                  // Validation: If single day and end is checked, uncheck end
                  if (checked && leaveRequest.startDate && leaveRequest.startDate === leaveRequest.endDate && isEndHalfDay) {
                    setIsEndHalfDay(false);
                  }
                  setError(null); // Clear error on change
                }}
                disabled={!leaveRequest.startDate || isSubmitting}
              />
              <span className="label-text text-sm">First day is half day (AM)</span>
            </label>
          </div>

          {/* End Half Day Checkbox */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2 py-1"> {/* Reduced padding */}
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={isEndHalfDay}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsEndHalfDay(checked);
                   // Validation: If single day and start is checked, uncheck start
                   if (checked && leaveRequest.endDate && leaveRequest.startDate === leaveRequest.endDate && isStartHalfDay) {
                     setIsStartHalfDay(false);
                   }
                  setError(null); // Clear error on change
                }}
                disabled={!leaveRequest.endDate || isSubmitting}
              />
              <span className="label-text text-sm">Last day is half day (PM)</span>
            </label>
          </div>
        </div>
        {/* --- End Half Day Selection --- */}

        {/* Submit Button */}
        <div className="form-control pt-4 flex items-end">
            <button type="submit" className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`} disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner loading-sm mr-2"></span>}
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
        </div>
        </form>

      {/* Modal for Date Picker */}
      <dialog ref={modalRef} id="date_picker_modal" className="modal">
        <div className="modal-box w-auto max-w-fit p-0">
          {openModal === 'start' && (
            <DayPicker
              mode="single"
              selected={selectedStartDate}
              onSelect={handleDateSelectInModal}
              //disabled ={{ before: today}}
              className="react-day-picker m-4"
              showOutsideDays
              fixedWeeks
              modifiersClassNames={{
                selected: 'rdp-day_selected_custom',
                today: 'rdp-day_today_custom',
              }}
            />
          )}
          {openModal === 'end' && (
            <DayPicker
              mode="single"
              selected={selectedEndDate}
              onSelect={handleDateSelectInModal}
              disabled={{ before: selectedStartDate ? selectedStartDate : today }}
              className="react-day-picker m-4"
              showOutsideDays
              fixedWeeks
              modifiersClassNames={{
                selected: 'rdp-day_selected_custom',
              }}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setOpenModal(null)}>close</button>
        </form>
      </dialog>
    </>
  );
};