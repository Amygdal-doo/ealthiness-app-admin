import React, { useState } from "react";
import { useNavigate } from "react-router";
import { HeartPulse, Mail, Lock, Shield, ArrowRight } from "lucide-react";
import FloatingInput from "./FloatingInput";
import { Button } from "~/components/ui";
import { useLogin, useCurrentUser } from "~/hooks/useAuthApi";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "~/lib/services/api";

const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useLogin();
  const userQuery = useCurrentUser();

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (loginMutation.error) loginMutation.reset();
    if (fieldErrors) setFieldErrors(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors(null);

    try {
      console.log("Making direct API call to /v1/auth/signin/admin");
      console.log("Request payload:", {
        email: formState.email,
        password: formState.password ? "[HIDDEN]" : "EMPTY",
      });

      const response = await fetch(
        "https://elathiness-backend-app-company-idea-production.up.railway.app/v1/auth/signin/admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: formState.email.trim(),
            password: formState.password,
          }),
        },
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      // Get response text first to debug server errors
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: `Server error: ${responseText}` };
        }

        console.log("Error data:", errorData);
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${responseText}`,
        );
      }

      const data = JSON.parse(responseText);
      console.log("Login successful:", data);

      // Store tokens in cookies using js-cookie
      if (data.accessToken && data.refreshToken) {
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; secure=${location.protocol === "https:"}; samesite=lax`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=2592000; secure=${location.protocol === "https:"}; samesite=lax`;
        console.log("Tokens stored in cookies");
        
        // Invalidate and refetch user data to trigger auth state update
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // Wait a moment for queries to update, then navigate
        setTimeout(() => {
          // Navigate to home - auth guard will handle the role-based routing
          navigate("/");
        }, 100);
      } else {
        // Navigate immediately if no tokens (shouldn't happen)
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setFieldErrors({
        general: err instanceof Error ? err.message : "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] via-white to-[#F0F4FF] flex items-center justify-center p-4 font-sans selection:bg-[#5850DE] selection:text-white">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#5850DE] to-[#248FEC] rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 mx-auto">
            <HeartPulse size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B173A] mb-2">
            Ealthiness Admin
          </h1>
          <p className="text-[#8E8E93] font-medium">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-[32px] shadow-2xl border border-white relative overflow-hidden backdrop-blur-sm">
          {/* Form */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-[#1B173A] mb-2">
                Secure Access Portal
              </h2>
              <p className="text-[#8E8E93] text-sm font-medium">
                Enter your credentials to continue
              </p>
            </div>

            {/* Error Message */}
            {fieldErrors?.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 text-sm font-medium">
                  {fieldErrors.general}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <FloatingInput
                label="Email Address"
                type="email"
                placeholder="admin@ealthiness.com"
                value={formState.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={fieldErrors?.email?.[0]}
                icon={Mail}
                required
              />

              <FloatingInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formState.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={fieldErrors?.password?.[0]}
                icon={Lock}
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#60646C] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#5850DE] border-[#E0E1E6] rounded focus:ring-[#5850DE]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-[#5850DE] font-bold hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
                  isLoading
                    ? "bg-[#8E8E93] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#5850DE] to-[#248FEC] hover:shadow-xl transform hover:-translate-y-1"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#8E8E93] font-medium flex items-center justify-center gap-2">
            <Shield size={12} className="text-[#4DAB46]" />
            Your connection is secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;
