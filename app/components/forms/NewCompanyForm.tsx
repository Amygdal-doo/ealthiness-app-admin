import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Building2,
  Mail,
  MapPin,
  Phone,
  Globe,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button, Card, Input } from "~/components/ui";
import { useCountries } from "~/hooks/useAuthApi";
import { apiClient } from "~/lib/services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const newCompanySchema = z.object({
  name: z
    .string()
    .min(3, "Company name must be at least 3 characters")
    .max(100, "Company name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  contact: z
    .string()
    .min(5, "Contact must be at least 5 characters")
    .max(50, "Contact must be less than 50 characters"),
  countryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Please select a valid country"),
  logo: z
    .any()
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true;
      return files[0]?.size <= MAX_FILE_SIZE;
    }, `Max file size is 5MB.`)
    .refine((files) => {
      if (!files || files.length === 0) return true;
      return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
    }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
});

type NewCompanyFormData = z.infer<typeof newCompanySchema>;

interface NewCompanyFormProps {
  onSuccess?: (company: any) => void;
  onCancel?: () => void;
}

const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: countriesResponse, isLoading: countriesLoading } = useCountries(
    {
      limit: 1000, // Get all countries
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<NewCompanyFormData>({
    resolver: zodResolver(newCompanySchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      contact: "",
      countryId: "",
    },
  });

  const logoFiles = watch("logo");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // React Query mutation for creating company
  const createCompanyMutation = useMutation({
    mutationFn: async (data: NewCompanyFormData) => {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("email", data.email.trim());
      formData.append("address", data.address.trim());
      formData.append("contact", data.contact.trim());
      formData.append("countryId", data.countryId);

      if (data.logo && data.logo[0]) {
        formData.append("logo", data.logo[0]);
      }

      // Debug: Log all FormData entries
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await apiClient.post("/v1/company", formData);
      return response;
    },
    onSuccess: (response) => {
      // Invalidate companies query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["companies"] });

      // Reset form
      reset();
      setPreviewImage(null);

      onSuccess?.(response);
    },
    onError: (error) => {
      console.error("Error creating company:", error);
    },
  });

  // Register the logo field manually for better control
  const { onChange: logoOnChange, ...logoRest } = register("logo");

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    // Call the register onChange first
    logoOnChange(e);

    if (files && files.length > 0) {
      const file = files[0];

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const onSubmit = (data: NewCompanyFormData) => {
    console.log("Form data:", data);
    createCompanyMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl">
      <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F0F0F3] text-[#1B173A] flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[#1B173A]">
            Add New Company
          </h3>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-[#8E8E93] hover:text-[#1B173A] transition text-xl font-bold"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2"
            >
              <Building2 size={14} />
              Company Name *
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter company name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">
                {String(errors.name.message)}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2"
            >
              <Mail size={14} />
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="company@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label
              htmlFor="contact"
              className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2"
            >
              <Phone size={14} />
              Contact *
            </label>
            <Input
              id="contact"
              {...register("contact")}
              placeholder="Contact information"
              className={errors.contact ? "border-red-500" : ""}
            />
            {errors.contact && (
              <p className="text-red-500 text-xs">
                {String(errors.contact.message)}
              </p>
            )}
          </div>
        </div>

        {/* Country - Full Width */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2">
            <Globe size={14} />
            Country *
          </label>
          <div className="relative" ref={countryDropdownRef}>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                !countriesLoading &&
                setIsCountryDropdownOpen(!isCountryDropdownOpen)
              }
              className={`justify-between w-full bg-white border rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
                errors.countryId
                  ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/10"
                  : "border-[#E0E1E6] text-[#1B173A] hover:border-[#5850DE] focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10"
              } ${countriesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={countriesLoading}
            >
              {(() => {
                const selectedCountry = countriesResponse?.results?.find(
                  (country) => country.id === watch("countryId"),
                );

                if (countriesLoading) return "Loading countries...";
                if (selectedCountry) return selectedCountry.name;
                return "Select a country";
              })()}
              <ChevronDown
                size={16}
                className={`text-[#8E8E93] transition-transform duration-200 ${
                  isCountryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {isCountryDropdownOpen && !countriesLoading && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E1E6] rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
                {countriesResponse?.results?.map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => {
                      setValue("countryId", country.id);
                      setIsCountryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[#F0F0F3] transition-colors flex items-center justify-between ${
                      watch("countryId") === country.id
                        ? "text-[#5850DE] bg-[#F0F0F3]"
                        : "text-[#1B173A]"
                    }`}
                  >
                    {country.name}
                    {watch("countryId") === country.id && (
                      <Check size={16} className="text-[#5850DE]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...register("countryId")}
              value={watch("countryId")}
            />
          </div>
          {errors.countryId && (
            <p className="text-red-500 text-xs">
              {String(errors.countryId.message)}
            </p>
          )}
        </div>
        {/* Address */}
        <div className="space-y-2">
          <label
            htmlFor="address"
            className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2"
          >
            <MapPin size={14} />
            Address *
          </label>
          <textarea
            id="address"
            {...register("address")}
            placeholder="Enter company address"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:border-[#5850DE] outline-none resize-none ${
              errors.address ? "border-red-500" : "border-[#E0E1E6]"
            }`}
          />
          {errors.address && (
            <p className="text-red-500 text-xs">
              {String(errors.address.message)}
            </p>
          )}
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2">
            <Upload size={14} />
            Company Logo
          </label>
          <div className="border-2 border-dashed border-[#E0E1E6] rounded-lg p-6 text-center hover:border-[#5850DE] transition">
            <input
              type="file"
              accept="image/*"
              {...logoRest}
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {previewImage ? (
                <div className="space-y-3">
                  <img
                    src={previewImage}
                    alt="Logo preview"
                    className="w-24 h-24 object-cover mx-auto rounded-lg border"
                  />
                  <p className="text-sm text-[#5850DE] font-medium">
                    Click to change logo
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload size={32} className="mx-auto text-[#8E8E93]" />
                  <div>
                    <p className="text-[#5850DE] font-medium">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-[#8E8E93] mt-1">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
          {errors.logo && (
            <p className="text-red-500 text-xs">
              {String(errors.logo.message)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E1E6]">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={createCompanyMutation.isPending}>
            {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NewCompanyForm;
