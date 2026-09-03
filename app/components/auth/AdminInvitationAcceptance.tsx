import React from "react";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui";
import type { AdminTypeColors } from "~/lib/utils/adminTypes";

interface AdminInvitationAcceptanceProps {
  adminType: string;
  colors: AdminTypeColors;
  onAcceptInvitation: () => void;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function AdminInvitationAcceptance({
  adminType,
  colors,
  onAcceptInvitation,
  isLoading,
  error,
  isSuccess,
}: AdminInvitationAcceptanceProps) {
  return (
    <div className="text-center space-y-6">
      <div
        className={`p-6 ${colors.bg} rounded-xl border ${colors.border}`}
      >
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
          <CheckCircle
            size={32}
            className={colors.text.replace("text-", "text-")}
          />
        </div>
        <h3 className="text-lg font-bold text-[#1B173A] mb-2">
          Ready to Accept Invitation
        </h3>
        <p className={`text-sm ${colors.text} font-medium`}>
          You already have an account. Simply click accept to activate
          your {adminType} admin role.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle size={16} className="text-red-600 mt-0.5" />
          <div className="ml-2">
            <p className="text-red-800 font-medium">
              Invitation Acceptance Failed
            </p>
            <p className="text-red-700 text-sm mt-1">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Accept Button */}
      <Button
        onClick={onAcceptInvitation}
        className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 transition-opacity`}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Accepting Invitation...
          </>
        ) : (
          <>
            Accept Admin Invitation
            <ArrowRight size={16} className="ml-2" />
          </>
        )}
      </Button>

      {/* Success State */}
      {isSuccess && (
        <div className="flex items-start p-4 border border-green-200 bg-green-50 rounded-lg">
          <CheckCircle size={16} className="text-green-600 mt-0.5" />
          <div className="ml-2">
            <p className="text-green-800 font-medium">
              Invitation Accepted!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Redirecting you to the login page...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}