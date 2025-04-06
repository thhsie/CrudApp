import React, { ReactNode, useRef, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string; // e.g., btn-error, btn-warning
  isLoading?: boolean; // Add loading state for confirm button
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'btn-primary', // Default confirm button style
  isLoading = false, // Default loading state
}: ConfirmDialogProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  // Control dialog visibility via props
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      if (isOpen && !modal.open) {
        modal.showModal();
      } else if (!isOpen && modal.open) {
        modal.close();
      }
    }
  }, [isOpen]);

  // Handle closing via ESC key or backdrop click (if using form method="dialog")
  useEffect(() => {
    const modal = modalRef.current;
    const handleDialogClose = () => {
      if (isOpen) { // Only call onClose if the dialog was programmatically open
        onClose();
      }
    };
    modal?.addEventListener('close', handleDialogClose);
    return () => modal?.removeEventListener('close', handleDialogClose);
  }, [onClose, isOpen]);


  const handleConfirmClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault();
     if (!isLoading) { // Prevent action if already loading
         onConfirm();
     }
   };

   const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault();
     onClose();
   };

  return (
    <dialog ref={modalRef} id="confirm_modal" className="modal modal-bottom sm:modal-middle"> {/* Responsive position */}
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4 text-base-content/90">{children}</div> {/* Slightly less prominent text */}
        <div className="modal-action">
          {/* Cancel Button */}
          <button
            type="button"
            className="btn btn-ghost" // Use ghost for cancel
            onClick={handleCancelClick}
            disabled={isLoading} // Disable cancel while loading confirm
          >
            {cancelText}
          </button>
          {/* Confirm Button */}
          <button
            type="button"
            className={`btn ${confirmButtonClass} ${isLoading ? 'btn-disabled loading' : ''}`} // Combined loading/disabled
            onClick={handleConfirmClick}
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner loading-xs"></span> : confirmText}
          </button>
        </div>
      </div>
       {/* Optional: Click outside to close */}
       <form method="dialog" className="modal-backdrop">
         <button type="button" onClick={onClose} disabled={isLoading}>close</button> {/* Disable backdrop click when loading */}
       </form>
    </dialog>
  );
};