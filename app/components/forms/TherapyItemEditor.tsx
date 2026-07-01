import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Tag,
  Type,
  AlignLeft,
  Beaker,
  Repeat,
  Clock,
  CalendarDays,
  Package,
  Activity,
  Check,
  X,
} from "lucide-react";
import { Button, DatePicker, Input, Select, Textarea } from "~/components/ui";
import { FormField } from "./FormField";
import SupplementProductPicker from "./SupplementProductPicker";
import {
  itemSchema,
  EMPTY_ITEM,
  ITEM_FIELD_RULES,
  TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  TIMING_OPTIONS,
  STATUS_OPTIONS,
  isVisible,
  isRequired,
  TherapyItemType,
  TherapyFrequency,
  TherapyTiming,
  type TherapyItemFormValue,
  type ItemFieldRules,
} from "~/lib/therapy/therapy-item";

interface TherapyItemEditorProps {
  /** When editing, the existing values to seed the form with. */
  initialValue?: TherapyItemFormValue;
  onSave: (item: TherapyItemFormValue) => void;
  onCancel: () => void;
  /** When the save is persisted asynchronously, disables the actions. */
  isSaving?: boolean;
}

const star = (required: boolean) => (required ? " *" : "");

const TherapyItemEditor: React.FC<TherapyItemEditorProps> = ({
  initialValue,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TherapyItemFormValue>({
    resolver: yupResolver(itemSchema) as never,
    defaultValues: initialValue ?? EMPTY_ITEM,
  });

  const type = watch("type");
  const frequency = watch("frequency");
  const timing = watch("timing");
  const supplementProductName = watch("supplementProductName");

  // Until a type is picked, only type + title + description are meaningful, so
  // hide every type-specific field. Each appears as the type is chosen.
  const rules: ItemFieldRules =
    (type && ITEM_FIELD_RULES[type as TherapyItemType]) || {
      amount: "hidden",
      frequency: "hidden",
      timing: "hidden",
      dueDate: "hidden",
      supplementProduct: "hidden",
    };

  return (
    <div className="rounded-2xl border border-[#5850DE]/30 bg-[#F8F7FF] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
          <Tag size={15} />
        </span>
        <h4 className="text-sm font-bold text-[#1B173A]">
          {initialValue ? "Edit item" : "New item"}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <FormField
          label="Type *"
          icon={<Tag size={14} />}
          htmlFor="item-type"
          error={errors.type?.message}
        >
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                id="item-type"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={TYPE_OPTIONS}
                placeholder="Select a type"
                invalid={!!errors.type}
              />
            )}
          />
        </FormField>

        {/* Title */}
        <FormField
          label="Title *"
          icon={<Type size={14} />}
          htmlFor="item-title"
          error={errors.title?.message}
        >
          <Input
            id="item-title"
            {...register("title")}
            placeholder="e.g. Ibuprofen 200mg"
            className={errors.title ? "border-red-500" : ""}
          />
        </FormField>
      </div>

      {/* Description */}
      <FormField
        label="Description"
        icon={<AlignLeft size={14} />}
        htmlFor="item-description"
        error={errors.description?.message}
      >
        <Textarea
          id="item-description"
          rows={2}
          {...register("description")}
          placeholder="Optional details about this item"
          className={errors.description ? "border-red-500" : ""}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        {isVisible(rules.amount) && (
          <FormField
            label={`Amount / Dose${star(isRequired(rules.amount))}`}
            icon={<Beaker size={14} />}
            htmlFor="item-amount"
            error={errors.amount?.message}
          >
            <Input
              id="item-amount"
              {...register("amount")}
              placeholder="e.g. 500mg, 2 capsules"
              className={errors.amount ? "border-red-500" : ""}
            />
          </FormField>
        )}

        {/* Frequency */}
        {isVisible(rules.frequency) && (
          <FormField
            label={`Frequency${star(isRequired(rules.frequency))}`}
            icon={<Repeat size={14} />}
            htmlFor="item-frequency"
            error={errors.frequency?.message}
          >
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <Select
                  id="item-frequency"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={FREQUENCY_OPTIONS}
                  placeholder="Select frequency"
                  invalid={!!errors.frequency}
                />
              )}
            />
          </FormField>
        )}

        {/* Custom frequency note — only when frequency is CUSTOM */}
        {isVisible(rules.frequency) && frequency === TherapyFrequency.CUSTOM && (
          <FormField
            label="Custom frequency note"
            icon={<Repeat size={14} />}
            htmlFor="item-customFrequencyNote"
            error={errors.customFrequencyNote?.message}
          >
            <Input
              id="item-customFrequencyNote"
              {...register("customFrequencyNote")}
              placeholder="e.g. Every other day"
            />
          </FormField>
        )}

        {/* Timing */}
        {isVisible(rules.timing) && (
          <FormField
            label="Timing"
            icon={<Clock size={14} />}
            htmlFor="item-timing"
            error={errors.timing?.message}
          >
            <Controller
              control={control}
              name="timing"
              render={({ field }) => (
                <Select
                  id="item-timing"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={TIMING_OPTIONS}
                  placeholder="Select timing"
                />
              )}
            />
          </FormField>
        )}

        {/* Custom timing note — only when timing is CUSTOM */}
        {isVisible(rules.timing) && timing === TherapyTiming.CUSTOM && (
          <FormField
            label="Custom timing note"
            icon={<Clock size={14} />}
            htmlFor="item-customTimingNote"
            error={errors.customTimingNote?.message}
          >
            <Input
              id="item-customTimingNote"
              {...register("customTimingNote")}
              placeholder="e.g. 30 min before sleep"
            />
          </FormField>
        )}

        {/* Due date */}
        {isVisible(rules.dueDate) && (
          <FormField
            label={`Due date${star(isRequired(rules.dueDate))}`}
            icon={<CalendarDays size={14} />}
            htmlFor="item-dueDate"
            error={errors.dueDate?.message}
          >
            <Controller
              control={control}
              name="dueDate"
              render={({ field }) => (
                <DatePicker
                  id="item-dueDate"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Select due date"
                  invalid={!!errors.dueDate}
                />
              )}
            />
          </FormField>
        )}

        {/* Supplement product — search the catalog and link a product */}
        {isVisible(rules.supplementProduct) && (
          <FormField
            label="Supplement product"
            icon={<Package size={14} />}
            htmlFor="item-supplementProduct"
            hint="Search and link a product from the catalog"
            error={errors.supplementProduct?.message}
            className="md:col-span-2"
          >
            <Controller
              control={control}
              name="supplementProduct"
              render={({ field }) => (
                <SupplementProductPicker
                  id="item-supplementProduct"
                  value={field.value}
                  valueName={supplementProductName}
                  invalid={!!errors.supplementProduct}
                  onChange={(productId, productName) => {
                    field.onChange(productId);
                    setValue("supplementProductName", productName, {
                      shouldValidate: false,
                      shouldDirty: true,
                    });
                  }}
                />
              )}
            />
          </FormField>
        )}

        {/* Status */}
        <FormField
          label="Status"
          icon={<Activity size={14} />}
          htmlFor="item-status"
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                id="item-status"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={STATUS_OPTIONS}
                placeholder="Select status"
              />
            )}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-1.5"
        >
          <X size={14} />
          Cancel
        </Button>
        {/* Not a real submit — validate locally, then hand the item up. */}
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit(onSave)}
          disabled={isSaving}
          className="flex items-center gap-1.5"
        >
          <Check size={14} />
          {isSaving
            ? "Saving..."
            : initialValue
              ? "Update item"
              : "Add item"}
        </Button>
      </div>
    </div>
  );
};

export default TherapyItemEditor;
