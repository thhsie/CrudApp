import React, { useState, useEffect, useRef } from 'react';
import { UserListItem, LeaveBalancesUpdateDto } from '../../types/auth';
import { ErrorDisplay } from '../ui/ErrorDisplay';

interface EditLeaveBalancesModalProps {
  isOpen: boolean;
  user: UserListItem;
  onClose: () => void;
  onSave: (userId: string, balances: LeaveBalancesUpdateDto) => void;
  isSaving: boolean;
  updateError: string | null;
}

export const EditLeaveBalancesModal = ({
  isOpen,
  user,
  onClose,
  onSave,
  isSaving,
  updateError,
}: EditLeaveBalancesModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [balances, setBalances] = useState<LeaveBalancesUpdateDto>({
    paidLeavesBalance: 0,
    sickLeavesBalance: 0,
    specialLeavesBalance: 0,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setBalances({
        paidLeavesBalance: user.leaveBalances?.annualLeavesBalance ?? 0,
        sickLeavesBalance: user.leaveBalances?.sickLeavesBalance ?? 0,
        specialLeavesBalance: user.leaveBalances?.specialLeavesBalance ?? 0,
      });
      setValidationError(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      if (isOpen && !modal.open) {
        modal.showModal(); // Use native method to show modal
      } else if (!isOpen && modal.open) {
        modal.close(); // Use native method to close modal
      }
    }
  }, [isOpen]); // Rerun when isOpen prop changes

   // Effect to handle closing via ESC or backdrop click (native dialog behavior)
   useEffect(() => {
       const modal = modalRef.current;
       const handleDialogClose = () => {
           // This is triggered by modal.close() or ESC key
           // Only call the prop onClose if the modal was managed as 'open' via the prop
           if (isOpen) {
                onClose();
           }
       };
       modal?.addEventListener('close', handleDialogClose);
       // Cleanup listener on unmount or when dependencies change
       return () => modal?.removeEventListener('close', handleDialogClose);
     }, [onClose, isOpen]); // Depend on isOpen to ensure correct behavior


  // Handler for input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValidationError(null); // Clear validation error on change
    const numericValue = parseInt(value, 10);

    // Allow empty input (treat as 0) or positive integers
    if (value === '' || ( !isNaN(numericValue) && numericValue >= 0 ) ) {
        setBalances(prev => ({
            ...prev,
            [name]: value === '' ? 0 : numericValue, // Store number, default empty to 0
        }));
    } else {
        // Set validation error for immediate feedback if negative or non-numeric
        setValidationError("Balances must be zero or positive numbers.");
    }
  };

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setValidationError(null); // Clear previous validation error

    // Final validation check before calling onSave
    if (balances.paidLeavesBalance < 0 || balances.sickLeavesBalance < 0 || balances.specialLeavesBalance < 0) {
        setValidationError("Leave balances cannot be negative.");
        return;
    }
    if (isNaN(balances.paidLeavesBalance) || isNaN(balances.sickLeavesBalance) || isNaN(balances.specialLeavesBalance)) {
         setValidationError("Balances must be valid numbers.");
        return;
    }

    // Call the onSave callback passed from the parent (AdminUsers page)
    onSave(user.id, balances);
    // Note: Modal closing on success is handled by the parent component (AdminUsers)
    // based on the mutation result. Error feedback is shown via `updateError` prop.
  };

  // Handler for the cancel button
  const handleCancelClick = () => {
     // Simply call the onClose prop to signal closure intent
     onClose();
     // The useEffect hook listening to 'isOpen' will actually call modal.close()
   };

  // Combine local validation error and error from the update mutation for display
  const displayError = validationError || updateError;

  return (
    // Use the native <dialog> element with DaisyUI's 'modal' class
    <dialog ref={modalRef} id={`edit_balances_modal_${user.id}`} className="modal modal-bottom sm:modal-middle">
      {/* Modal Box Content */}
      <div className="modal-box pl-8">
        {/* Close button (positioned absolute) - triggers onClose via useEffect */}
        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" onClick={handleCancelClick} type="button" disabled={isSaving}>✕</button>

        <h3 className="font-bold text-lg mb-1">Readjust balances</h3>
        <p className="text-sm text-base-content/70 mb-4 truncate" title={user.email ?? user.userName ?? `User ID: ${user.id}`}>
            for: {user.email || user.userName || `User ID: ${user.id}`}
        </p>

        {/* Form for editing balances */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display combined validation/update errors */}
          {displayError && <ErrorDisplay message={displayError} />}

          {/* Input field for Annual Leaves (using DaisyUI label structure) */}
           <label className="form-control w-full">
              <div className="label"><span className="label-text">Annual Leave balance</span></div>
              <input
                type="number"
                name="paidLeavesBalance" // Must match LeaveBalancesUpdateDto property
                value={balances.paidLeavesBalance} // Controlled component
                onChange={handleChange}
                className={`input input-bordered w-full ${displayError ? 'input-error' : ''}`} // Highlight input on error
                min="0" // HTML5 validation
                required
                disabled={isSaving} // Disable when save is in progress
                aria-invalid={!!displayError} // Accessibility attribute for invalid state
                aria-describedby={displayError ? `balance-error-${user.id}` : undefined}
                padding-bottom="2"
              />
           </label>

           {/* Input field for Sick Leaves */}
            <label className="form-control w-full">
              <div className="label"><span className="label-text pt-3">Sick Leave balance</span></div>
              <input
                type="number"
                name="sickLeavesBalance"
                value={balances.sickLeavesBalance}
                onChange={handleChange}
                className={`input input-bordered w-full ${displayError ? 'input-error' : ''}`}
                min="0"
                required
                disabled={isSaving}
                aria-invalid={!!displayError}
                aria-describedby={displayError ? `balance-error-${user.id}` : undefined}
              />
            </label>

          {/* Input field for Special Leaves */}
            <label className="form-control w-full">
               <div className="label"><span className="label-text pt-3">Special Leave balance</span></div>
               <input
                 type="number"
                 name="specialLeavesBalance"
                 value={balances.specialLeavesBalance}
                 onChange={handleChange}
                 className={`input input-bordered w-full ${displayError ? 'input-error' : ''}`}
                 min="0"
                 required
                 disabled={isSaving}
                 aria-invalid={!!displayError}
                 aria-describedby={displayError ? `balance-error-${user.id}` : undefined}
               />
             </label>

           {/* Hidden error description for screen readers */}
           {displayError && <p id={`balance-error-${user.id}`} className="sr-only">{displayError}</p>}

          {/* Modal Actions (Cancel and Save buttons) */}
          <div className="modal-action mt-6">
             {/* Cancel button - Use type="button" to prevent form submission */}
            <button
              type="button"
              className="btn btn-ghost" // Ghost style for less emphasis
              onClick={handleCancelClick} // Use specific handler
              disabled={isSaving} // Disable when saving
            >
              Cancel
            </button>
            {/* Save button - type="submit" triggers the form's onSubmit */}
            <button
              type="submit"
              className={`btn btn-primary ${isSaving ? 'btn-disabled' : ''}`} // Show loading state
              disabled={isSaving || !!validationError} // Disable if saving or validation error exists
            >
              {/* Show loading spinner when saving */}
              {isSaving && <span className="loading loading-spinner loading-xs mr-2"></span>}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

       {/* Optional: Backdrop click to close (native dialog behavior handles this, but explicit form helps) */}
       {/* Ensure button type isn't submit */}
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={onClose} disabled={isSaving}>close</button>
        </form>
    </dialog>
  );
};