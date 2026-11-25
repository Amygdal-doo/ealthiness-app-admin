import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/* Small modal used by the role portals (forms, decisions with a note). */

interface PortalModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  busy?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function PortalModal({ open, title, onClose, busy = false, children, footer }: PortalModalProps) {
  if (!open || typeof document === "undefined") return null;
  const close = () => {
    if (!busy) onClose();
  };
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 p-4 md:p-5 border-b border-[#E0E1E6]">
          <h3 className="text-lg font-bold text-[#1B173A]">{title}</h3>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="p-2 rounded-xl text-[#60646C] hover:bg-[#F0F0F3]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 md:p-5 space-y-4">{children}</div>
        {footer && (
          <div className="p-4 md:p-5 border-t border-[#E0E1E6] flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-[#60646C] uppercase tracking-wider mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#8E8E93] mt-1">{hint}</span>}
    </label>
  );
}
