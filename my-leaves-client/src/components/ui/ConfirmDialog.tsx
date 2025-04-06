// --- Updated File: ./my-leaves-client/src/components/ui/ConfirmDialog.tsx ---
import React, { ReactNode, useRef, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
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
}: ConfirmDialogProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  // Use useEffect to control the dialog's open state via its methods
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      if (isOpen) {
        modal.showModal(); // Use daisyUI/HTML recommended method
      } else {
        // Check if modal is open before trying to close
        // This prevents errors if it's already closed programmatically
        if (modal.hasAttribute('open')) {
             modal.close();
        }
      }
    }
  }, [isOpen]);

  // Handle closing via the dialog's native close event (e.g., ESC key)
  useEffect(() => {
    const modal = modalRef.current;
    const handleDialogClose = () => {
      if (isOpen) { // Only call onClose if the dialog was supposed to be open
        onClose();
      }
    };
    modal?.addEventListener('close', handleDialogClose);
    return () => {
      modal?.removeEventListener('close', handleDialogClose);
    };
  }, [onClose, isOpen]);


  // Prevent form submission from closing dialog prematurely if needed
   const handleConfirmClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault(); // Prevent default form submission behavior if inside a form
     onConfirm();
   };

   const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault();
     onClose(); // Trigger the close handler
   };

  return (
    // Use the dialog element directly
    <dialog ref={modalRef} id="confirm_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4">{children}</div>
        <div className="modal-action">
          {/* Use button type="button" to prevent accidental form submission */}
          <button type="button" className="btn" onClick={handleCancelClick}>
            {cancelText}
          </button>
          <button type="button" className={`btn ${confirmButtonClass}`} onClick={handleConfirmClick}>
            {confirmText}
          </button>
        </div>
      </div>
       {/* Optional: Click outside to close */}
       <form method="dialog" className="modal-backdrop">
         <button type="button" onClick={onClose}>close</button>
       </form>
    </dialog>
  );
};;