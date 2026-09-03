import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UtensilsCrossed, X, Plus, ImageIcon, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select } from "~/components/ui";
import { useUpdateDietPlan } from "~/hooks/useAuthApi";
import {
  DIET_PLAN_GOALS,
  DIET_PLAN_VISIBILITIES,
  DIET_PLAN_CURRENCIES,
  DIET_PLAN_GOAL_LABELS,
  DIET_PLAN_VISIBILITY_LABELS,
  DIET_PLAN_CURRENCY_LABELS,
  type DietPlanDetail,
  type DietPlanGoal,
  type DietPlanVisibility,
  type DietPlanCurrency,
} from "~/lib/diet-plans/diet-plan";

interface EditDietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DietPlanDetail;
}

const GOAL_OPTIONS = DIET_PLAN_GOALS.map((goal) => ({
  value: goal,
  label: DIET_PLAN_GOAL_LABELS[goal],
}));

const VISIBILITY_OPTIONS = DIET_PLAN_VISIBILITIES.map((visibility) => ({
  value: visibility,
  label: DIET_PLAN_VISIBILITY_LABELS[visibility],
}));

const CURRENCY_OPTIONS = DIET_PLAN_CURRENCIES.map((currency) => ({
  value: currency,
  label: DIET_PLAN_CURRENCY_LABELS[currency],
}));

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <label className="block text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

const asCurrency = (value: string): DietPlanCurrency =>
  DIET_PLAN_CURRENCIES.includes(value as DietPlanCurrency)
    ? (value as DietPlanCurrency)
    : "usd";

export const EditDietPlanModal: React.FC<EditDietPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const updateDietPlan = useUpdateDietPlan();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState<DietPlanGoal | "">("");
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [restrictionInput, setRestrictionInput] = useState("");
  const [visibility, setVisibility] = useState<DietPlanVisibility | "">("");
  const [coachGroup, setCoachGroup] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<DietPlanCurrency | "">("usd");
  const [image, setImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill the form from the plan every time the modal opens.
  useEffect(() => {
    if (isOpen) {
      updateDietPlan.reset();
      setTitle(plan.title ?? "");
      setDescription(plan.description ?? "");
      setGoal(plan.goal);
      setDailyCalorieTarget(
        plan.dailyCalorieTarget != null ? String(plan.dailyCalorieTarget) : "",
      );
      setDurationDays(
        plan.durationDays != null ? String(plan.durationDays) : "",
      );
      setProtein(plan.macros?.protein != null ? String(plan.macros.protein) : "");
      setCarbs(plan.macros?.carbs != null ? String(plan.macros.carbs) : "");
      setFat(plan.macros?.fat != null ? String(plan.macros.fat) : "");
      setRestrictions(plan.restrictions ?? []);
      setRestrictionInput("");
      setVisibility(plan.visibility);
      setCoachGroup("");
      setIsFree(plan.isFree);
      setPrice(!plan.isFree && plan.price != null ? String(plan.price) : "");
      setCurrency(asCurrency(plan.currency));
      setImage(null);
      setErrorMessage("");
    }
  }, [isOpen, plan]);

  const addRestriction = () => {
    const value = restrictionInput.trim();
    if (value && !restrictions.includes(value)) {
      setRestrictions((prev) => [...prev, value]);
    }
    setRestrictionInput("");
  };

  const removeRestriction = (value: string) => {
    setRestrictions((prev) => prev.filter((item) => item !== value));
  };

  const onRestrictionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRestriction();
    }
  };

  const calorieNum = Number(dailyCalorieTarget);
  const durationNum = Number(durationDays);
  const priceNum = Number(price);

  const isValid =
    title.trim() &&
    goal &&
    visibility &&
    dailyCalorieTarget !== "" &&
    !Number.isNaN(calorieNum) &&
    calorieNum >= 0 &&
    durationDays !== "" &&
    !Number.isNaN(durationNum) &&
    durationNum >= 1 &&
    (visibility !== "coach_group" || coachGroup.trim()) &&
    (isFree || (price !== "" && !Number.isNaN(priceNum) && priceNum >= 0));

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setErrorMessage(
        "Please complete all required fields: title, goal, visibility, daily calorie target, and duration (at least 1 day).",
      );
      return;
    }
    setErrorMessage("");

    // Only include macros if at least one value was provided.
    const macros =
      protein !== "" || carbs !== "" || fat !== ""
        ? {
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
          }
        : undefined;

    try {
      await updateDietPlan.mutateAsync({
        dietPlanId: plan.id,
        data: {
          title: title.trim(),
          description: description.trim(),
          goal: goal as DietPlanGoal,
          dailyCalorieTarget: calorieNum,
          macros,
          durationDays: durationNum,
          restrictions,
          visibility: visibility as DietPlanVisibility,
          coachGroup:
            visibility === "coach_group" ? coachGroup.trim() : undefined,
          isFree,
          price: isFree ? 0 : priceNum,
          currency: isFree ? undefined : (currency as DietPlanCurrency),
          image: image ?? undefined,
        },
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update diet plan:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update diet plan. Please try again.",
      );
    }
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between gap-3 shrink-0">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
              <UtensilsCrossed size={20} />
            </div>
            Edit Diet Plan
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <SectionLabel>Title *</SectionLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-Day Muscle Gain Blueprint"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <SectionLabel>Description</SectionLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of the plan"
              className="w-full min-h-[64px]"
            />
          </div>

          {/* Goal + Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel>Goal *</SectionLabel>
              <Select
                value={goal}
                onChange={(value) => setGoal(value as DietPlanGoal)}
                options={GOAL_OPTIONS}
                placeholder="Select goal"
              />
            </div>
            <div>
              <SectionLabel>Visibility *</SectionLabel>
              <Select
                value={visibility}
                onChange={(value) =>
                  setVisibility(value as DietPlanVisibility)
                }
                options={VISIBILITY_OPTIONS}
                placeholder="Select visibility"
              />
            </div>
          </div>

          {/* Coach group (only for coach_group visibility) */}
          {visibility === "coach_group" && (
            <div>
              <SectionLabel>Coach Group ID *</SectionLabel>
              <Input
                value={coachGroup}
                onChange={(e) => setCoachGroup(e.target.value)}
                placeholder="Coach group identifier"
                className="w-full"
              />
            </div>
          )}

          {/* Calorie target + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel>Daily Calorie Target *</SectionLabel>
              <Input
                type="number"
                min={0}
                value={dailyCalorieTarget}
                onChange={(e) => setDailyCalorieTarget(e.target.value)}
                placeholder="e.g. 3000"
                className="w-full"
              />
            </div>
            <div>
              <SectionLabel>Duration (days) *</SectionLabel>
              <Input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="e.g. 30"
                className="w-full"
              />
            </div>
          </div>

          {/* Macros */}
          <div>
            <SectionLabel>Macros (g) — optional</SectionLabel>
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                min={0}
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Protein"
                className="w-full"
              />
              <Input
                type="number"
                min={0}
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="Carbs"
                className="w-full"
              />
              <Input
                type="number"
                min={0}
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="Fat"
                className="w-full"
              />
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <SectionLabel>Restrictions</SectionLabel>
            <div className="flex items-center gap-2">
              <Input
                value={restrictionInput}
                onChange={(e) => setRestrictionInput(e.target.value)}
                onKeyDown={onRestrictionKeyDown}
                placeholder="e.g. vegan, gluten-free — press Enter to add"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRestriction}
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>
            {restrictions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {restrictions.map((restriction) => (
                  <span
                    key={restriction}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#5850DE] bg-[#E8E6FC] pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span className="truncate max-w-[200px]">
                      {restriction}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRestriction(restriction)}
                      aria-label={`Remove ${restriction}`}
                      className="p-0.5 rounded-full hover:bg-[#5850DE]/20 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <SectionLabel>Pricing</SectionLabel>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${
                  isFree
                    ? "bg-[#5850DE] text-white border-[#5850DE]"
                    : "bg-white text-[#60646C] border-[#E0E1E6] hover:border-[#5850DE] hover:text-[#5850DE]"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${
                  !isFree
                    ? "bg-[#5850DE] text-white border-[#5850DE]"
                    : "bg-white text-[#60646C] border-[#E0E1E6] hover:border-[#5850DE] hover:text-[#5850DE]"
                }`}
              >
                Paid
              </button>
            </div>
            {!isFree && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <SectionLabel>Price *</SectionLabel>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 14.99"
                    className="w-full"
                  />
                </div>
                <div>
                  <SectionLabel>Currency</SectionLabel>
                  <Select
                    value={currency}
                    onChange={(value) =>
                      setCurrency(value as DietPlanCurrency)
                    }
                    options={CURRENCY_OPTIONS}
                    placeholder="Select currency"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cover image */}
          <div>
            <SectionLabel>
              Cover Image{image ? " — 1 selected" : ""}
            </SectionLabel>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E0E1E6] rounded-xl text-sm font-medium text-[#60646C] cursor-pointer hover:border-[#5850DE] hover:text-[#5850DE] transition-colors w-fit">
              <ImageIcon size={16} />
              {image ? "Change image" : "Replace image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </label>
            {image && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#5850DE] bg-[#E8E6FC] pl-2.5 pr-1.5 py-1 rounded-full max-w-[240px]">
                  <span className="truncate">{image.name}</span>
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    aria-label={`Remove ${image.name}`}
                    className="p-0.5 rounded-full hover:bg-[#5850DE]/20 transition-colors shrink-0"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E0E1E6] flex gap-3 shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={updateDietPlan.isPending || !isValid}
            className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
          >
            {updateDietPlan.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UtensilsCrossed size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={updateDietPlan.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
