import React, { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ChevronDown,
  Check,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, Input } from "~/components/ui";
import type { AdminRegistrationFormData, ValidationErrors } from "~/lib/validation/adminRegistration";
import type { AdminTypeColors } from "~/lib/utils/adminTypes";

interface AdminRegistrationFormProps {
  userInfo: AdminRegistrationFormData;
  errors: ValidationErrors;
  colors: AdminTypeColors;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function AdminRegistrationForm({
  userInfo,
  errors,
  colors,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  isSuccess,
}: AdminRegistrationFormProps) {
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  // Close gender dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* First Row - Name Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            First Name
          </label>
          <Input
            type="text"
            value={userInfo.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            placeholder="Enter your first name"
            className={errors.firstName ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Last Name
          </label>
          <Input
            type="text"
            value={userInfo.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
            placeholder="Enter your last name"
            className={errors.lastName ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Second Row - Email and Username */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Email
          </label>
          <Input
            type="email"
            value={userInfo.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            placeholder="Enter your email address"
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Username
          </label>
          <Input
            type="text"
            value={userInfo.username}
            onChange={(e) => onInputChange("username", e.target.value)}
            placeholder="Choose a username"
            className={errors.username ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username}
            </p>
          )}
        </div>
      </div>

      {/* Third Row - Gender, Height and Weight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2 flex items-center gap-2">
            <User size={14} />
            Gender
          </label>
          <div className="relative" ref={genderDropdownRef}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
              className="justify-between w-full bg-white border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border-[#E0E1E6] text-[#1B173A] hover:border-[#5850DE] focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10"
              disabled={isLoading}
            >
              {userInfo.gender === "male" ? "Male" : "Female"}
              <ChevronDown
                size={16}
                className={`text-[#8E8E93] transition-transform duration-200 ${
                  isGenderDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {isGenderDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E1E6] rounded-lg shadow-lg z-50 py-1">
                <button
                  type="button"
                  onClick={() => {
                    onInputChange("gender", "male");
                    setIsGenderDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-medium hover:bg-[#F0F0F3] transition-colors flex items-center justify-between ${
                    userInfo.gender === "male"
                      ? "text-[#5850DE] bg-[#F0F0F3]"
                      : "text-[#1B173A]"
                  }`}
                >
                  Male
                  {userInfo.gender === "male" && (
                    <Check size={16} className="text-[#5850DE]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInputChange("gender", "female");
                    setIsGenderDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-medium hover:bg-[#F0F0F3] transition-colors flex items-center justify-between ${
                    userInfo.gender === "female"
                      ? "text-[#5850DE] bg-[#F0F0F3]"
                      : "text-[#1B173A]"
                  }`}
                >
                  Female
                  {userInfo.gender === "female" && (
                    <Check size={16} className="text-[#5850DE]" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Height (cm)
          </label>
          <Input
            type="number"
            value={userInfo.height}
            onChange={(e) => onInputChange("height", e.target.value)}
            placeholder="170"
            min="100"
            max="250"
            className={errors.height ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.height && (
            <p className="text-red-500 text-sm mt-1">{errors.height}</p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Weight (kg)
          </label>
          <Input
            type="number"
            value={userInfo.weight}
            onChange={(e) => onInputChange("weight", e.target.value)}
            placeholder="70"
            min="30"
            max="300"
            className={errors.weight ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.weight && (
            <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
          )}
        </div>
      </div>

      {/* Fourth Row - Password Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={userInfo.password}
              onChange={(e) => onInputChange("password", e.target.value)}
              placeholder="Create a secure password"
              className={`pr-12 ${errors.password ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93] hover:text-[#5850DE] transition-colors focus:outline-none"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={userInfo.confirmPassword}
              onChange={(e) => onInputChange("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              className={`pr-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93] hover:text-[#5850DE] transition-colors focus:outline-none"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle size={16} className="text-red-600 mt-0.5" />
          <div className="ml-2">
            <p className="text-red-800 font-medium">
              Registration Failed
            </p>
            <p className="text-red-700 text-sm mt-1">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 transition-opacity`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Completing Registration...
          </>
        ) : (
          <>
            Complete Registration
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
              Registration Complete!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Redirecting you to the login page...
            </p>
          </div>
        </div>
      )}
    </form>
  );
}