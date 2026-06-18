import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "~/components/ui";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "Delete item",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
}) => {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleClose = () => {
    if (isDeleting) return;
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            {title}
          </h3>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="text-sm text-[#60646C] leading-relaxed mb-6 pl-1">
          {description}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                {confirmLabel}
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
