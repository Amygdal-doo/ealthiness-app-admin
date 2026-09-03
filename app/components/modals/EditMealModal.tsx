import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UtensilsCrossed, X, Plus, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select } from "~/components/ui";
import { useUpdateDietPlanMeal } from "~/hooks/useAuthApi";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  type MealType,
  type MealFoodItem,
  type DietPlanMeal,
} from "~/lib/diet-plans/diet-plan";

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  dietPlanId: string;
  meal: DietPlanMeal;
}

const MEAL_TYPE_OPTIONS = MEAL_TYPES.map((type) => ({
  value: type,
  label: MEAL_TYPE_LABELS[type],
}));

/** A food item row while it's being edited (numbers held as strings). */
interface FoodItemDraft {
  name: string;
  quantity: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

const emptyFoodItem = (): FoodItemDraft => ({
  name: "",
  quantity: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
});

const toFoodItemDraft = (item: MealFoodItem): FoodItemDraft => ({
  name: item.name ?? "",
  quantity: item.quantity ?? "",
  calories: item.calories != null ? String(item.calories) : "",
  protein: item.protein != null ? String(item.protein) : "",
  carbs: item.carbs != null ? String(item.carbs) : "",
  fat: item.fat != null ? String(item.fat) : "",
});

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <label className="block text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

export const EditMealModal: React.FC<EditMealModalProps> = ({
  isOpen,
  onClose,
  dietPlanId,
  meal,
}) => {
  const updateMeal = useUpdateDietPlanMeal();

  const [dayNumber, setDayNumber] = useState("");
  const [mealType, setMealType] = useState<MealType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [foodItems, setFoodItems] = useState<FoodItemDraft[]>([]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [order, setOrder] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill the form from the meal every time the modal opens.
  useEffect(() => {
    if (isOpen) {
      updateMeal.reset();
      setDayNumber(meal.dayNumber != null ? String(meal.dayNumber) : "");
      setMealType(meal.mealType);
      setTitle(meal.title ?? "");
      setDescription(meal.description ?? "");
      setIngredients(meal.ingredients ?? []);
      setIngredientInput("");
      setFoodItems((meal.foodItems ?? []).map(toFoodItemDraft));
      setCalories(meal.calories != null ? String(meal.calories) : "");
      setProtein(meal.protein != null ? String(meal.protein) : "");
      setCarbs(meal.carbs != null ? String(meal.carbs) : "");
      setFat(meal.fat != null ? String(meal.fat) : "");
      setOrder(meal.order != null ? String(meal.order) : "");
      setImage(null);
      setErrorMessage("");
    }
  }, [isOpen, meal]);

  const addIngredient = () => {
    const value = ingredientInput.trim();
    if (value && !ingredients.includes(value)) {
      setIngredients((prev) => [...prev, value]);
    }
    setIngredientInput("");
  };

  const removeIngredient = (value: string) => {
    setIngredients((prev) => prev.filter((item) => item !== value));
  };

  const onIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient();
    }
  };

  const addFoodItem = () =>
    setFoodItems((prev) => [...prev, emptyFoodItem()]);

  const removeFoodItem = (index: number) =>
    setFoodItems((prev) => prev.filter((_, i) => i !== index));

  const updateFoodItem = (
    index: number,
    field: keyof FoodItemDraft,
    value: string,
  ) => {
    setFoodItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const dayNum = Number(dayNumber);

  const isValid =
    dayNumber !== "" &&
    !Number.isNaN(dayNum) &&
    dayNum >= 0 &&
    mealType &&
    title.trim();

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setErrorMessage(
        "Please complete the required fields: day number, meal type, and title.",
      );
      return;
    }

    // Every food item that's been started must have a name.
    const cleanedFoodItems: MealFoodItem[] = foodItems
      .filter(
        (item) =>
          item.name.trim() ||
          item.quantity.trim() ||
          item.calories ||
          item.protein ||
          item.carbs ||
          item.fat,
      )
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity.trim(),
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      }));

    if (cleanedFoodItems.some((item) => !item.name)) {
      setErrorMessage("Every food item needs a name.");
      return;
    }

    setErrorMessage("");

    try {
      await updateMeal.mutateAsync({
        dietPlanId,
        mealId: meal.id,
        data: {
          dayNumber: dayNum,
          mealType: mealType as MealType,
          title: title.trim(),
          description: description.trim(),
          ingredients,
          foodItems: cleanedFoodItems,
          calories: calories !== "" ? Number(calories) : undefined,
          protein: protein !== "" ? Number(protein) : undefined,
          carbs: carbs !== "" ? Number(carbs) : undefined,
          fat: fat !== "" ? Number(fat) : undefined,
          order: order !== "" ? Number(order) : undefined,
          image: image ?? undefined,
        },
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update meal:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update meal. Please try again.",
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
            Edit Meal
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
          {/* Day + Meal type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel>Day Number *</SectionLabel>
              <Input
                type="number"
                min={0}
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value)}
                placeholder="e.g. 1"
                className="w-full"
              />
            </div>
            <div>
              <SectionLabel>Meal Type *</SectionLabel>
              <Select
                value={mealType}
                onChange={(value) => setMealType(value as MealType)}
                options={MEAL_TYPE_OPTIONS}
                placeholder="Select meal type"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <SectionLabel>Title *</SectionLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chicken & Rice Power Bowl"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <SectionLabel>Description</SectionLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the meal"
              className="w-full min-h-[56px]"
            />
          </div>

          {/* Ingredients */}
          <div>
            <SectionLabel>Ingredients</SectionLabel>
            <div className="flex items-center gap-2">
              <Input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={onIngredientKeyDown}
                placeholder="e.g. chicken breast — press Enter to add"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>
            {ingredients.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#5850DE] bg-[#E8E6FC] pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    <span className="truncate max-w-[200px]">{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      aria-label={`Remove ${ingredient}`}
                      className="p-0.5 rounded-full hover:bg-[#5850DE]/20 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Food items */}
          <div>
            <SectionLabel>Food Items</SectionLabel>
            <div className="space-y-3">
              {foodItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-[#E0E1E6] rounded-xl p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#60646C]">
                      Item {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFoodItem(index)}
                      aria-label="Remove food item"
                      className="p-1 text-[#8E8E93] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateFoodItem(index, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                    <Input
                      value={item.quantity}
                      onChange={(e) =>
                        updateFoodItem(index, "quantity", e.target.value)
                      }
                      placeholder="Quantity (e.g. 150g)"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.calories}
                      onChange={(e) =>
                        updateFoodItem(index, "calories", e.target.value)
                      }
                      placeholder="Kcal"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.protein}
                      onChange={(e) =>
                        updateFoodItem(index, "protein", e.target.value)
                      }
                      placeholder="Protein"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.carbs}
                      onChange={(e) =>
                        updateFoodItem(index, "carbs", e.target.value)
                      }
                      placeholder="Carbs"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.fat}
                      onChange={(e) =>
                        updateFoodItem(index, "fat", e.target.value)
                      }
                      placeholder="Fat"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFoodItem}
              className="mt-2"
            >
              <Plus size={14} className="mr-1" />
              Add food item
            </Button>
          </div>

          {/* Meal totals */}
          <div>
            <SectionLabel>Meal Totals — optional</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] font-semibold text-[#8E8E93] mb-1">
                  Calories
                </p>
                <Input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#8E8E93] mb-1">
                  Protein
                </p>
                <Input
                  type="number"
                  min={0}
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#8E8E93] mb-1">
                  Carbs
                </p>
                <Input
                  type="number"
                  min={0}
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#8E8E93] mb-1">
                  Fat
                </p>
                <Input
                  type="number"
                  min={0}
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Order + Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel>Order</SectionLabel>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="e.g. 0"
                className="w-full"
              />
            </div>
            <div>
              <SectionLabel>Image{image ? " — 1 selected" : ""}</SectionLabel>
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#E0E1E6] rounded-xl text-sm font-medium text-[#60646C] cursor-pointer hover:border-[#5850DE] hover:text-[#5850DE] transition-colors w-fit">
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
                <div className="mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[#5850DE] bg-[#E8E6FC] pl-2.5 pr-1.5 py-1 rounded-full w-fit max-w-full">
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
            disabled={updateMeal.isPending || !isValid}
            className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
          >
            {updateMeal.isPending ? (
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
            disabled={updateMeal.isPending}
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
