import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ClipboardList,
  FileText,
  Stethoscope,
  ListChecks,
  CalendarDays,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button, Card, DatePicker, Input, Textarea } from "~/components/ui";
import { FormField } from "./FormField";
import TherapyItemEditor from "./TherapyItemEditor";
import { useCreateTherapyPlan } from "~/hooks/useAuthApi";
import type { CreateTherapyPlanPayload } from "~/lib/auth/types";
import {
  describeItem,
  toApiItem,
  TYPE_LABELS,
  TherapyItemType,
  type TherapyItemFormValue,
} from "~/lib/therapy/therapy-item";

/* -------------------------------------------------------------------------- */
/*  Plan details validation                                                   */
/* -------------------------------------------------------------------------- */

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
});

type PlanFormValues = yup.InferType<typeof planSchema>;

/* -------------------------------------------------------------------------- */
/*  Step header                                                               */
/* -------------------------------------------------------------------------- */

const STEPS = ["Plan details", "Items"] as const;

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center gap-2">
    {STEPS.map((label, index) => {
      const step = index + 1;
      const isActive = step === current;
      const isDone = step < current;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isActive
                  ? "bg-[#5850DE] text-white"
                  : isDone
                    ? "bg-[#E8E6FC] text-[#5850DE]"
                    : "bg-[#F0F0F3] text-[#8E8E93]"
              }`}
            >
              {isDone ? <Check size={13} /> : step}
            </span>
            <span
              className={`text-xs font-semibold ${
                isActive ? "text-[#1B173A]" : "text-[#8E8E93]"
              }`}
            >
              {label}
            </span>
          </div>
          {step < STEPS.length && (
            <span className="w-6 h-px bg-[#E0E1E6]" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Items review list                                                         */
/* -------------------------------------------------------------------------- */

interface ItemsListProps {
  items: TherapyItemFormValue[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const ItemsList: React.FC<ItemsListProps> = ({ items, onEdit, onRemove }) => (
  <div className="space-y-2">
    {items.map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E1E6] bg-white px-4 py-3"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#5850DE] bg-[#E8E6FC] px-2 py-0.5 rounded-full">
              {TYPE_LABELS[item.type as TherapyItemType]}
            </span>
            <span className="text-sm font-semibold text-[#1B173A] truncate">
              {item.title}
            </span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-1 truncate">
            {describeItem(item)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(index)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#60646C] hover:bg-[#F0F0F3] hover:text-[#5850DE] transition-colors"
            aria-label="Edit item"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#60646C] hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

interface TherapyPlanFormProps {
  /** The client this plan belongs to (the session's `client`). */
  patientId: string;
  /** The session this plan is created from (from the URL). */
  sessionId: string;
  onSuccess?: (plan: unknown) => void;
  onCancel?: () => void;
}

// `null` index = adding a new item; a number = editing that item.
type EditorState = { index: number | null } | null;

const TherapyPlanForm: React.FC<TherapyPlanFormProps> = ({
  patientId,
  sessionId,
  onSuccess,
  onCancel,
}) => {
  const createTherapyPlan = useCreateTherapyPlan();

  const [step, setStep] = useState(1);
  const [items, setItems] = useState<TherapyItemFormValue[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: yupResolver(planSchema),
    defaultValues: {
      title: "",
      reason: "",
      generalInstructions: "",
      startDate: "",
      endDate: "",
    },
  });

  const goToItems = async () => {
    const valid = await trigger();
    if (valid) setStep(2);
  };

  const handleSaveItem = (item: TherapyItemFormValue) => {
    setItems((prev) => {
      if (editor?.index == null) return [...prev, item];
      return prev.map((existing, i) => (i === editor.index ? item : existing));
    });
    setEditor(null);
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = (values: PlanFormValues) => {
    const payload: CreateTherapyPlanPayload = {
      patientId,
      sessionId,
      title: values.title.trim(),
      reason: values.reason.trim(),
      generalInstructions: values.generalInstructions.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      items: items.map(toApiItem),
    };

    createTherapyPlan.mutate(payload, {
      onSuccess: (plan) => onSuccess?.(plan),
    });
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
              Create Therapy Plan
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Linked to this session and patient.
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

      {/* Steps */}
      <div className="px-6 py-4 border-b border-[#E0E1E6] shrink-0">
        <StepIndicator current={step} />
      </div>

      {/* Body (scrolls) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Step 1 — plan details (kept mounted to preserve values) */}
        <div className={step === 1 ? "space-y-6" : "hidden"}>
          <FormField
            label="Title *"
            icon={<FileText size={14} />}
            htmlFor="title"
            error={errors.title?.message}
          >
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. Weekly wellness plan"
              className={errors.title ? "border-red-500" : ""}
            />
          </FormField>

          <FormField
            label="Reason *"
            icon={<Stethoscope size={14} />}
            htmlFor="reason"
            error={errors.reason?.message}
          >
            <Textarea
              id="reason"
              rows={2}
              {...register("reason")}
              placeholder="e.g. Manage chronic pain"
              className={errors.reason ? "border-red-500" : ""}
            />
          </FormField>

          <FormField
            label="General Instructions *"
            icon={<ListChecks size={14} />}
            htmlFor="generalInstructions"
            error={errors.generalInstructions?.message}
          >
            <Textarea
              id="generalInstructions"
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
              htmlFor="startDate"
              error={errors.startDate?.message}
            >
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    id="startDate"
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
              htmlFor="endDate"
              error={errors.endDate?.message}
            >
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    id="endDate"
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
        </div>

        {/* Step 2 — items */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#1B173A]">Plan items</h4>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Add tasks, prescriptions, supplements and more — or leave it
                empty and add them later.
              </p>
            </div>

            {items.length > 0 && (
              <ItemsList
                items={items}
                onEdit={(index) => setEditor({ index })}
                onRemove={removeItem}
              />
            )}

            {editor ? (
              <TherapyItemEditor
                initialValue={
                  editor.index != null ? items[editor.index] : undefined
                }
                onSave={handleSaveItem}
                onCancel={() => setEditor(null)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditor({ index: null })}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E0E1E6] py-3 text-sm font-semibold text-[#5850DE] hover:border-[#5850DE] hover:bg-[#F8F7FF] transition-colors"
              >
                <Plus size={16} />
                {items.length === 0 ? "Add an item" : "Add another item"}
              </button>
            )}

            {createTherapyPlan.isError && (
              <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
                <AlertCircle size={14} />
                {createTherapyPlan.error instanceof Error
                  ? createTherapyPlan.error.message
                  : "Couldn't create the therapy plan. Please try again."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex justify-between gap-3 p-6 border-t border-[#E0E1E6] shrink-0">
        {step === 1 ? (
          <>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              onClick={goToItems}
              className="flex items-center gap-1.5"
            >
              Next: Items
              <ArrowRight size={15} />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={createTherapyPlan.isPending}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft size={15} />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={createTherapyPlan.isPending || !!editor}
            >
              {createTherapyPlan.isPending
                ? "Creating..."
                : `Create Plan${items.length ? ` (${items.length})` : ""}`}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default TherapyPlanForm;
