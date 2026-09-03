import * as yup from "yup";
import type { SelectOption } from "~/components/ui";

/* -------------------------------------------------------------------------- */
/*  Enums (mirrors the backend)                                               */
/* -------------------------------------------------------------------------- */

export enum TherapyItemType {
  TASK = "task",
  PRESCRIPTION = "prescription",
  SUPPLEMENT = "supplement",
  EXERCISE = "exercise",
  DIET = "diet",
  COUNSELING = "counseling",
  FOLLOW_UP = "follow_up",
  OTHER = "other",
}

export enum TherapyFrequency {
  ONCE = "once",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

export enum TherapyTiming {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  EVENING = "evening",
  BEFORE_MEAL = "before_meal",
  AFTER_MEAL = "after_meal",
  BEFORE_TRAINING = "before_training",
  AFTER_TRAINING = "after_training",
  CUSTOM = "custom",
}

export enum TherapyItemStatus {
  PENDING = "pending",
  ACTIVE = "active",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  SKIPPED = "skipped",
  STOPPED = "stopped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/* -------------------------------------------------------------------------- */
/*  Human-readable labels + select option lists                              */
/* -------------------------------------------------------------------------- */

export const TYPE_LABELS: Record<TherapyItemType, string> = {
  [TherapyItemType.TASK]: "Task",
  [TherapyItemType.PRESCRIPTION]: "Prescription",
  [TherapyItemType.SUPPLEMENT]: "Supplement",
  [TherapyItemType.EXERCISE]: "Exercise",
  [TherapyItemType.DIET]: "Diet",
  [TherapyItemType.COUNSELING]: "Counseling",
  [TherapyItemType.FOLLOW_UP]: "Follow-up",
  [TherapyItemType.OTHER]: "Other",
};

export const FREQUENCY_LABELS: Record<TherapyFrequency, string> = {
  [TherapyFrequency.ONCE]: "Once",
  [TherapyFrequency.DAILY]: "Daily",
  [TherapyFrequency.WEEKLY]: "Weekly",
  [TherapyFrequency.MONTHLY]: "Monthly",
  [TherapyFrequency.CUSTOM]: "Custom",
};

export const TIMING_LABELS: Record<TherapyTiming, string> = {
  [TherapyTiming.MORNING]: "Morning",
  [TherapyTiming.AFTERNOON]: "Afternoon",
  [TherapyTiming.EVENING]: "Evening",
  [TherapyTiming.BEFORE_MEAL]: "Before meal",
  [TherapyTiming.AFTER_MEAL]: "After meal",
  [TherapyTiming.BEFORE_TRAINING]: "Before training",
  [TherapyTiming.AFTER_TRAINING]: "After training",
  [TherapyTiming.CUSTOM]: "Custom",
};

export const STATUS_LABELS: Record<TherapyItemStatus, string> = {
  [TherapyItemStatus.PENDING]: "Pending",
  [TherapyItemStatus.ACTIVE]: "Active",
  [TherapyItemStatus.IN_PROGRESS]: "In progress",
  [TherapyItemStatus.DONE]: "Done",
  [TherapyItemStatus.SKIPPED]: "Skipped",
  [TherapyItemStatus.STOPPED]: "Stopped",
  [TherapyItemStatus.COMPLETED]: "Completed",
  [TherapyItemStatus.CANCELLED]: "Cancelled",
};

const toOptions = <T extends string>(labels: Record<T, string>): SelectOption[] =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

export const TYPE_OPTIONS = toOptions(TYPE_LABELS);
export const FREQUENCY_OPTIONS = toOptions(FREQUENCY_LABELS);
export const TIMING_OPTIONS = toOptions(TIMING_LABELS);
export const STATUS_OPTIONS = toOptions(STATUS_LABELS);

/* -------------------------------------------------------------------------- */
/*  Per-type field visibility / requiredness                                  */
/*                                                                            */
/*  This single config drives BOTH which fields render and which are         */
/*  required, so the UI and the validation can never drift apart.            */
/* -------------------------------------------------------------------------- */

export type FieldRule = "hidden" | "optional" | "required";

export interface ItemFieldRules {
  amount: FieldRule;
  frequency: FieldRule;
  timing: FieldRule;
  dueDate: FieldRule;
  supplementProduct: FieldRule;
}

const H: FieldRule = "hidden";
const O: FieldRule = "optional";
const R: FieldRule = "required";

export const ITEM_FIELD_RULES: Record<TherapyItemType, ItemFieldRules> = {
  // amount + frequency required (dose without a schedule is clinically incomplete)
  [TherapyItemType.PRESCRIPTION]: { amount: R, frequency: R, timing: O, dueDate: O, supplementProduct: H },
  // same as prescription, plus an optional linked supplement product
  [TherapyItemType.SUPPLEMENT]: { amount: R, frequency: R, timing: O, dueDate: O, supplementProduct: O },
  // inherently recurring → frequency required
  [TherapyItemType.EXERCISE]: { amount: O, frequency: R, timing: O, dueDate: O, supplementProduct: H },
  [TherapyItemType.COUNSELING]: { amount: H, frequency: R, timing: O, dueDate: O, supplementProduct: H },
  // the whole point is the date
  [TherapyItemType.FOLLOW_UP]: { amount: H, frequency: H, timing: H, dueDate: R, supplementProduct: H },
  // generic types: everything optional
  [TherapyItemType.TASK]: { amount: O, frequency: O, timing: O, dueDate: O, supplementProduct: H },
  [TherapyItemType.DIET]: { amount: O, frequency: O, timing: O, dueDate: O, supplementProduct: H },
  [TherapyItemType.OTHER]: { amount: O, frequency: O, timing: O, dueDate: O, supplementProduct: H },
};

export const isVisible = (rule: FieldRule) => rule !== "hidden";
export const isRequired = (rule: FieldRule) => rule === "required";

/* -------------------------------------------------------------------------- */
/*  Item form value + validation schema                                       */
/* -------------------------------------------------------------------------- */

export interface TherapyItemFormValue {
  type: TherapyItemType | "";
  title: string;
  description: string;
  amount: string;
  frequency: TherapyFrequency | "";
  timing: TherapyTiming | "";
  dueDate: string;
  customFrequencyNote: string;
  customTimingNote: string;
  /** Linked product id (sent to the API). */
  supplementProduct: string;
  /** Linked product display name — UI only, never sent to the API. */
  supplementProductName: string;
  status: TherapyItemStatus | "";
}

export const EMPTY_ITEM: TherapyItemFormValue = {
  type: "",
  title: "",
  description: "",
  amount: "",
  frequency: "",
  timing: "",
  dueDate: "",
  customFrequencyNote: "",
  customTimingNote: "",
  supplementProduct: "",
  supplementProductName: "",
  status: "",
};

/** Types whose `<field>` rule is `required`, used to drive yup's `.when`. */
const typesWhere = (field: keyof ItemFieldRules): string[] =>
  (Object.keys(ITEM_FIELD_RULES) as TherapyItemType[]).filter((type) =>
    isRequired(ITEM_FIELD_RULES[type][field]),
  );

const requiredWhenType = (field: keyof ItemFieldRules, message: string) =>
  yup.string().trim().when("type", {
    is: (type: string) => typesWhere(field).includes(type),
    then: (s) => s.required(message),
    otherwise: (s) => s.optional(),
  });

export const itemSchema = yup.object({
  type: yup
    .string()
    .oneOf(Object.values(TherapyItemType), "Select an item type")
    .required("Type is required"),
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .max(120, "Title must be less than 120 characters"),
  description: yup
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters"),
  amount: requiredWhenType("amount", "Amount is required for this type"),
  frequency: requiredWhenType("frequency", "Frequency is required for this type"),
  dueDate: requiredWhenType("dueDate", "Due date is required for this type"),
  timing: yup.string(),
  customFrequencyNote: yup.string().trim().max(200),
  customTimingNote: yup.string().trim().max(200),
  supplementProduct: yup.string().trim().max(120),
  supplementProductName: yup.string(),
  status: yup.string(),
});

/* -------------------------------------------------------------------------- */
/*  Mapping to the API payload (drop empty optionals)                         */
/* -------------------------------------------------------------------------- */

export function toApiItem(item: TherapyItemFormValue): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: item.type,
    title: item.title.trim(),
  };

  const addIfSet = (key: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
  };

  addIfSet("description", item.description);
  addIfSet("amount", item.amount);
  addIfSet("frequency", item.frequency);
  addIfSet("timing", item.timing);
  addIfSet("dueDate", item.dueDate);
  addIfSet("supplementProduct", item.supplementProduct);
  addIfSet("status", item.status);

  // Custom notes only carry meaning when their parent field is CUSTOM.
  if (item.frequency === TherapyFrequency.CUSTOM) {
    addIfSet("customFrequencyNote", item.customFrequencyNote);
  }
  if (item.timing === TherapyTiming.CUSTOM) {
    addIfSet("customTimingNote", item.customTimingNote);
  }

  return payload;
}

/** Short summary line shown in the items review list. */
export function describeItem(item: TherapyItemFormValue): string {
  const parts = [TYPE_LABELS[item.type as TherapyItemType] ?? "Item"];
  if (item.amount.trim()) parts.push(item.amount.trim());
  if (item.frequency) parts.push(FREQUENCY_LABELS[item.frequency]);
  if (item.dueDate.trim()) parts.push(`due ${item.dueDate.trim()}`);
  return parts.join(" · ");
}

/* -------------------------------------------------------------------------- */
/*  API response types (GET /v1/therapy-plan/:id/items)                       */
/* -------------------------------------------------------------------------- */

/** A persisted therapy plan item as returned by the backend. */
export interface TherapyPlanItem {
  id: string;
  patient: string;
  therapyPlan: string;
  type: TherapyItemType;
  /** Role that issued the item, e.g. "psychologist". */
  issuedBy: string;
  /** Id of the user who issued the item. */
  issuedByUser: string;
  title: string;
  description: string | null;
  supplementProduct: string | null;
  amount: string | null;
  frequency: TherapyFrequency | null;
  customFrequencyNote: string | null;
  timing: TherapyTiming | null;
  customTimingNote: string | null;
  duration: string | null;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  instructions: string | null;
  safetyNote: string | null;
  status: TherapyItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TherapyPlanItemsResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: TherapyPlanItem[];
}

export interface TherapyPlanItemsQueryParams {
  page?: number;
  limit?: number;
  type?: TherapyItemType;
  status?: TherapyItemStatus;
}
