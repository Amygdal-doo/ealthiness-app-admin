import React from "react";

interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

/** Label + optional icon + validation message wrapper, shared across forms. */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  htmlFor,
  error,
  hint,
  children,
}) => (
  <div className="space-y-2">
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2"
    >
      {icon}
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-[#8E8E93] text-xs">{hint}</p>}
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);
