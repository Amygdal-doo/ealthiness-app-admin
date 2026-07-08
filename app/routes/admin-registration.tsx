import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/admin-registration";
import { AlertCircle } from "lucide-react";
import { Button, Card, Badge } from "~/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleAdminInvitation } from "~/lib/services/adminRegistration";
import { getAdminTypeIcon, getAdminTypeColors, getAdminTypeName } from "~/lib/utils/adminTypes";
import { 
  validateAdminRegistrationForm, 
  type AdminRegistrationFormData, 
  type ValidationErrors 
} from "~/lib/validation/adminRegistration";
import { AdminInvitationAcceptance } from "~/components/auth/AdminInvitationAcceptance";
import { AdminRegistrationForm } from "~/components/auth/AdminRegistrationForm";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Accept Admin Invitation - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Accept your admin invitation to join the Ealthiness platform",
    },
  ];
}

export default function AdminRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Form state for new users
  const [userInfo, setUserInfo] = useState<AdminRegistrationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    gender: "male",
    height: 170,
    weight: 70,
    password: "",
    confirmPassword: "",
    country: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Get token, admin type, and existing user flag from URL parameters
  const token = searchParams.get("token");
  const adminType = searchParams.get("adminType");
  const existingUser = searchParams.get("existingUser") === "true";
  


  // Unified mutation for both existing and new users
  const invitationMutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("Missing invitation token");
      }
      if (existingUser && !adminType) {
        throw new Error("Missing admin type for existing user");
      }
      
      const userData = existingUser ? undefined : {
        ...userInfo,
        confirmPassword: undefined, // Remove confirmPassword from payload
      };
      
      return handleAdminInvitation(token, adminType!, existingUser, userData);
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Redirect to login page with appropriate success message
      const message = existingUser ? "invitation-accepted" : "registration-complete";
      navigate(`/?message=${message}`, { replace: true });
    },
    onError: (error: Error) => {
      const action = existingUser ? "Invitation acceptance" : "Registration";
      console.error(`${action} failed:`, error);
    },
  });

  // Validate form using imported validation function
  const validateForm = () => {
    const validation = validateAdminRegistrationForm(userInfo);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Handle form submission for new users
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    invitationMutation.mutate();
  };

  // Handle direct invitation acceptance for existing users
  const handleAcceptInvitation = () => {
    invitationMutation.mutate();
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    let processedValue: any = value;

    // Convert numeric fields to numbers
    if (field === "height" || field === "weight") {
      processedValue = parseInt(value) || 0;
    }

    setUserInfo((prev) => ({ ...prev, [field]: processedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check if we have valid parameters
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B173A] mb-2">
            Invalid Invitation
          </h2>
          <p className="text-[#60646C] mb-6">
            This invitation link is invalid or has expired. Please contact your
            administrator for a new invitation.
          </p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  const colors = getAdminTypeColors(adminType || "");

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header Card */}
        <Card className="p-8 mb-6">
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mx-auto mb-4 text-white`}
            >
              {getAdminTypeIcon(adminType || "")}
            </div>
            <h1 className="text-2xl font-extrabold text-[#1B173A] mb-2">
              {existingUser
                ? "Accept Admin Invitation"
                : "Welcome to Ealthiness"}
            </h1>
            <p className="text-[#60646C] mb-4">
              {existingUser
                ? "Accept your invitation to become a"
                : "Complete your registration to become a"}{" "}
              <Badge
                className={`${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {getAdminTypeName(adminType || "")}{" "}
                Admin
              </Badge>
            </p>
            <div
              className={`p-3 ${colors.bg} rounded-lg border ${colors.border}`}
            >
              <p className={`text-sm ${colors.text} font-medium`}>
                {existingUser
                  ? `You've been invited to manage ${adminType} operations. Click accept to activate your admin role.`
                  : `You've been invited to manage ${adminType} operations on the Ealthiness platform`}
              </p>
            </div>
          </div>
        </Card>

        {/* Registration Form or Invitation Acceptance */}
        <Card className="p-8 overflow-visible">
          {existingUser ? (
            <AdminInvitationAcceptance
              adminType={adminType || ""}
              colors={colors}
              onAcceptInvitation={handleAcceptInvitation}
              isLoading={invitationMutation.isPending}
              error={invitationMutation.error}
              isSuccess={invitationMutation.isSuccess}
            />
          ) : (
            <AdminRegistrationForm
              userInfo={userInfo}
              errors={errors}
              colors={colors}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={invitationMutation.isPending}
              error={invitationMutation.error}
              isSuccess={invitationMutation.isSuccess}
            />
          )}

          {/* Footer */}
          {!existingUser && (
            <div className="mt-8 pt-6 border-t border-[#E0E1E6] text-center">
              <p className="text-sm text-[#8E8E93]">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-[#5850DE] hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
