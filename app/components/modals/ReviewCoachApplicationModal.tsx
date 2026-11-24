import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { Button, Textarea } from "~/components/ui";
import {
  useApproveCoachApplication,
  useRejectCoachApplication,
} from "~/hooks/useAuthApi";
import { getApiErrorMessage } from "~/lib/services/api";
import type { ApiCoachApplication } from "~/lib/auth/types";

export type CoachApplicationDecision = "approve" | "reject";

interface ReviewCoachApplicationModalProps {
  application: ApiCoachApplication | null;
  decision: CoachApplicationDecision | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ReviewCoachApplicationModal: React.FC<
  ReviewCoachApplicationModalProps
> = ({ application, decision, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const approveMutation = useApproveCoachApplication();
  const rejectMutation = useRejectCoachApplication();

  const isOpen = !!application && !!decision;
  const isReject = decision === "reject";
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;
  const isReasonValid = reason.trim() !== "";

  // Reset state when the modal opens for a new application/decision
  useEffect(() => {
    if (isOpen) {
      approveMutation.reset();
      rejectMutation.reset();
      setReason("");
      setErrorMessage("");
    }
  }, [isOpen, application?._id, decision]);

  if (!isOpen || !application || typeof document === "undefined") {
    return null;
  }

  const fullName = `${application.firstName} ${application.lastName}`;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleConfirm = async () => {
    setErrorMessage("");

    try {
      if (isReject) {
        if (!isReasonValid) return;
        await rejectMutation.mutateAsync({
          userId: application._id,
          reason: reason.trim(),
        });
        onSuccess(`Rejected the coach application from ${fullName}.`);
      } else {
        await approveMutation.mutateAsync(application._id);
        onSuccess(`Approved ${fullName} as a coach.`);
      }
    } catch (error) {
      console.error(`Failed to ${decision} coach application:`, error);
      setErrorMessage(
        getApiErrorMessage(
          error,
          `Failed to ${decision} the application. Please try again.`,
        ),
      );
    }
  };

  const Icon = isReject ? XCircle : CheckCircle2;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isReject
                  ? "bg-red-50 text-red-500"
                  : "bg-[#E8E6FC] text-[#5850DE]"
              }`}
            >
              <Icon size={20} />
            </div>
            {isReject ? "Reject Application" : "Approve Application"}
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="text-sm text-[#60646C] leading-relaxed mb-4 pl-1">
          {isReject ? (
            <>
              Reject the coach application from{" "}
              <strong className="text-[#1B173A]">{fullName}</strong>? The
              reason below is shown to the applicant.
            </>
          ) : (
            <>
              Approve <strong className="text-[#1B173A]">{fullName}</strong>{" "}
              as a coach? They will be granted the COACH role.
            </>
          )}
        </div>

        {isReject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please add details about your certifications."
              rows={3}
              className="w-full"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || (isReject && !isReasonValid)}
            className={`flex-1 text-white ${
              isReject
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#5850DE] hover:bg-[#4A42C7]"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isReject ? "Rejecting..." : "Approving..."}
              </>
            ) : (
              <>
                <Icon size={16} className="mr-2" />
                {isReject ? "Reject" : "Approve"}
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isSubmitting}
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
