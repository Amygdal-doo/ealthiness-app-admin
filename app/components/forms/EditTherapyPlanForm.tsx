import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ClipboardList,
  FileText,
  Stethoscope,
  ListChecks,
  CalendarDays,
  Activity,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Textarea,
} from "~/components/ui";
import { FormField } from "./FormField";
import { useUpdateTherapyPlan } from "~/hooks/useAuthApi";
import type {
  TherapyPlan,
  TherapyPlanStatus,
  UpdateTherapyPlanPayload,
} from "~/lib/auth/types";

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

const STATUS_OPTIONS: { value: TherapyPlanStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const planSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be less than 120 characters"),
  reason: yup
    .string()
    .trim()
    .required("Reason is required")
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason must be less than 500 characters"),
  generalInstructions: yup
    .string()
    .trim()
    .required("General instructions are required")
    .min(3, "Instructions must be at least 3 characters")
    .max(1000, "Instructions must be less than 1000 characters"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .required("End date is required")
    .test(
      "after-start",
      "End date must be on or after the start date",
      (endDate, ctx) => {
        const { startDate } = ctx.parent as { startDate?: string };
        if (!endDate || !startDate) return true;
        return new Date(endDate) >= new Date(startDate);
      },
    ),
  status: yup
    .string()
    .oneOf(
      STATUS_OPTIONS.map((option) => option.value),
      "Select a status",
    )
    .required("Status is required"),
});

type PlanFormValues = yup.InferType<typeof planSchema>;

/** ISO datetime ("2026-07-30T00:00:00.000Z") → "YYYY-MM-DD" for the picker. */
const toDateInput = (iso: string): string => (iso ? iso.split("T")[0] : "");

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

interface EditTherapyPlanFormProps {
  plan: TherapyPlan;
  onSuccess?: (plan: TherapyPlan) => void;
  onCancel?: () => void;
}

const EditTherapyPlanForm: React.FC<EditTherapyPlanFormProps> = ({
  plan,
  onSuccess,
  onCancel,
}) => {
  const updateTherapyPlan = useUpdateTherapyPlan();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: yupResolver(planSchema),
    defaultValues: {
      title: plan.title,
      reason: plan.reason,
      generalInstructions: plan.generalInstructions,
      startDate: toDateInput(plan.startDate),
      endDate: toDateInput(plan.endDate),
      status: plan.status,
    },
  });

  const onSubmit = (values: PlanFormValues) => {
    const payload: UpdateTherapyPlanPayload = {
      title: values.title.trim(),
      reason: values.reason.trim(),
      generalInstructions: values.generalInstructions.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status as TherapyPlanStatus,
    };

    updateTherapyPlan.mutate(
      { planId: plan.id, data: payload },
      { onSuccess: (updated) => onSuccess?.(updated) },
    );
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1B173A]">
              Edit Therapy Plan
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Update this plan's details and status.
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[#8E8E93] hover:text-[#1B173A] transition text-xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Body (scrolls) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <FormField
          label="Title *"
          icon={<FileText size={14} />}
          htmlFor="edit-title"
          error={errors.title?.message}
        >
          <Input
            id="edit-title"
            {...register("title")}
            placeholder="e.g. Weekly wellness plan"
            className={errors.title ? "border-red-500" : ""}
          />
        </FormField>

        <FormField
          label="Reason *"
          icon={<Stethoscope size={14} />}
          htmlFor="edit-reason"
          error={errors.reason?.message}
        >
          <Textarea
            id="edit-reason"
            rows={2}
            {...register("reason")}
            placeholder="e.g. Manage chronic pain"
            className={errors.reason ? "border-red-500" : ""}
          />
        </FormField>

        <FormField
          label="General Instructions *"
          icon={<ListChecks size={14} />}
          htmlFor="edit-generalInstructions"
          error={errors.generalInstructions?.message}
        >
          <Textarea
            id="edit-generalInstructions"
            rows={3}
            {...register("generalInstructions")}
            placeholder="e.g. Follow the schedule strictly."
            className={errors.generalInstructions ? "border-red-500" : ""}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Start Date *"
            icon={<CalendarDays size={14} />}
            htmlFor="edit-startDate"
            error={errors.startDate?.message}
          >
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  id="edit-startDate"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Select start date"
                  invalid={!!errors.startDate}
                />
              )}
            />
          </FormField>

          <FormField
            label="End Date *"
            icon={<CalendarDays size={14} />}
            htmlFor="edit-endDate"
            error={errors.endDate?.message}
          >
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DatePicker
                  id="edit-endDate"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Select end date"
                  min={watch("startDate")}
                  invalid={!!errors.endDate}
                />
              )}
            />
          </FormField>
        </div>

        <FormField
          label="Status *"
          icon={<Activity size={14} />}
          htmlFor="edit-status"
          error={errors.status?.message}
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                id="edit-status"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={STATUS_OPTIONS}
                placeholder="Select status"
                invalid={!!errors.status}
              />
            )}
          />
        </FormField>

        {updateTherapyPlan.isError && (
          <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
            <AlertCircle size={14} />
            {updateTherapyPlan.error instanceof Error
              ? updateTherapyPlan.error.message
              : "Couldn't update the therapy plan. Please try again."}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between gap-3 p-6 border-t border-[#E0E1E6] shrink-0">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={updateTherapyPlan.isPending}
          >
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={updateTherapyPlan.isPending}
          className="flex items-center gap-1.5"
        >
          <Save size={15} />
          {updateTherapyPlan.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
};

export default EditTherapyPlanForm;
