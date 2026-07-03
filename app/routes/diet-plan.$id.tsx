import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import type { Route } from "./+types/diet-plan.$id";
import {
  ArrowLeft,
  UtensilsCrossed,
  Flame,
  CalendarDays,
  Globe,
  Lock,
  User as UserIcon,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
  Plus,
  Pencil,
} from "lucide-react";
import { Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import {
  useDietPlan,
  useDeleteDietPlan,
  useDeleteDietPlanMeal,
} from "~/hooks/useAuthApi";
import { AddMealModal } from "~/components/modals/AddMealModal";
import { EditMealModal } from "~/components/modals/EditMealModal";
import { EditDietPlanModal } from "~/components/modals/EditDietPlanModal";
import {
  DIET_PLAN_GOAL_LABELS,
  DIET_PLAN_GOAL_STYLE,
  DIET_PLAN_STATUS_STYLE,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
  MEAL_TYPE_STYLE,
  type DietPlanDetail,
  type DietPlanMeal,
} from "~/lib/diet-plans/diet-plan";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Diet Plan Details - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "View detailed information about a diet plan",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return { dietPlanId: params.id };
}

const formatPrice = (plan: DietPlanDetail) => {
  if (plan.isFree || plan.price === 0) return "Free";
  const currency = plan.currency?.toUpperCase() ?? "";
  return `${plan.price.toFixed(2)} ${currency}`.trim();
};

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

const MetaChip: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <span className="flex items-center gap-1.5 text-xs font-medium text-[#60646C] bg-[#F8F9FB] border border-[#E0E1E6] px-2.5 py-1 rounded-full capitalize">
    {icon}
    {label}
  </span>
);

const MacroStat: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex-1 text-center bg-[#F8F9FB] rounded-xl py-3">
    <p className="text-[11px] font-bold text-[#8E8E93] uppercase">{label}</p>
    <p className="text-base font-bold text-[#1B173A]">{value}</p>
  </div>
);

const MealCard: React.FC<{
  meal: DietPlanMeal;
  onEdit: (meal: DietPlanMeal) => void;
  onDelete: (meal: DietPlanMeal) => void;
}> = ({ meal, onEdit, onDelete }) => (
  <div className="bg-white rounded-[18px] border border-[#E0E1E6] shadow-sm overflow-hidden">
    {meal.image?.url && (
      <img
        src={meal.image.url}
        alt={meal.title}
        loading="lazy"
        className="w-full h-40 object-cover border-b border-[#F0F0F3]"
      />
    )}
    <div className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className={`inline-block text-[11px] font-bold uppercase px-2 py-0.5 rounded-full mb-1.5 ${
              MEAL_TYPE_STYLE[meal.mealType] ?? "bg-[#F0F0F3] text-[#60646C]"
            }`}
          >
            {MEAL_TYPE_LABELS[meal.mealType] ?? meal.mealType}
          </span>
          <h4 className="text-sm font-bold text-[#1B173A] leading-snug">
            {meal.title}
          </h4>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#8E8E93]">
            <Flame size={12} />
            {meal.calories} kcal
          </span>
          <button
            type="button"
            onClick={() => onEdit(meal)}
            aria-label={`Edit ${meal.title}`}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#5850DE] hover:bg-[#E8E6FC] transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal)}
            aria-label={`Delete ${meal.title}`}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-xs text-[#60646C] leading-relaxed">
        {meal.description}
      </p>

      <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-[#8E8E93]">
        <span>P {meal.protein}g</span>
        <span>C {meal.carbs}g</span>
        <span>F {meal.fat}g</span>
      </div>

      {meal.ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {meal.ingredients.map((ingredient) => (
            <span
              key={ingredient}
              className="text-[11px] font-medium text-[#5850DE] bg-[#E8E6FC] px-2 py-0.5 rounded-full"
            >
              {ingredient}
            </span>
          ))}
        </div>
      )}

      {meal.foodItems.length > 0 && (
        <div className="border-t border-[#F0F0F3] pt-2.5 space-y-1.5">
          {meal.foodItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#1B173A] truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-[#8E8E93]">{item.quantity}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-[#60646C]">
                {item.calories} kcal · P{item.protein}/C{item.carbs}/F{item.fat}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function DietPlanDetailPage() {
  const user = useUser();
  const navigate = useNavigate();
  const params = useParams();
  const dietPlanId = params.id ?? "";

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<DietPlanMeal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<DietPlanMeal | null>(null);
  const [deleteMealError, setDeleteMealError] = useState("");
  const deleteDietPlan = useDeleteDietPlan();
  const deleteMeal = useDeleteDietPlanMeal();

  const { data, isLoading, isError, refetch, isFetching } = useDietPlan(
    isDeleted ? "" : dietPlanId,
  );

  const plan = data?.plan;
  const meals = data?.meals ?? [];

  // Group meals by day, ordering meals within a day by meal type then order.
  const days = useMemo(() => {
    const byDay = new Map<number, DietPlanMeal[]>();
    for (const meal of meals) {
      const list = byDay.get(meal.dayNumber) ?? [];
      list.push(meal);
      byDay.set(meal.dayNumber, list);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([dayNumber, dayMeals]) => ({
        dayNumber,
        meals: dayMeals.sort((a, b) => {
          const typeDiff =
            MEAL_TYPE_ORDER.indexOf(a.mealType) -
            MEAL_TYPE_ORDER.indexOf(b.mealType);
          return typeDiff !== 0 ? typeDiff : a.order - b.order;
        }),
      }));
  }, [meals]);

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteDietPlan.mutateAsync(dietPlanId);
      // Disable the detail query before navigating so it never refetches the
      // now-deleted plan (which would 404).
      setIsDeleted(true);
      setIsDeleteOpen(false);
      navigate("/diet-plans");
    } catch (error) {
      console.error("Failed to delete diet plan:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete diet plan. Please try again.",
      );
    }
  };

  const handleDeleteMeal = async () => {
    if (!deletingMeal) return;
    setDeleteMealError("");
    try {
      await deleteMeal.mutateAsync({ dietPlanId, mealId: deletingMeal.id });
      setDeletingMeal(null);
    } catch (error) {
      console.error("Failed to delete meal:", error);
      setDeleteMealError(
        error instanceof Error
          ? error.message
          : "Failed to delete meal. Please try again.",
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col">
          <Navbar
            user={user}
            onLogout={() => navigate("/")}
            onRefresh={() => refetch()}
            refreshing={isFetching}
          />

          <div className="flex-1 p-6">
            <button
              onClick={() => navigate("/diet-plans")}
              className="flex items-center gap-2 text-sm font-semibold text-[#60646C] hover:text-[#5850DE] transition-colors mb-5"
            >
              <ArrowLeft size={16} />
              Back to Diet Plans
            </button>

            {isLoading ? (
              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-12">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 size={20} className="animate-spin text-[#5850DE]" />
                  <span className="font-medium">Loading diet plan...</span>
                </div>
              </div>
            ) : isError || !plan ? (
              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                <p className="text-[#60646C] text-sm mb-4">
                  Something went wrong while fetching this diet plan.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Overview card */}
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center shrink-0">
                        <UtensilsCrossed size={22} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-2xl font-extrabold text-[#1B173A] leading-tight">
                          {plan.title}
                        </h2>
                        <p className="text-[#60646C] text-sm font-medium mt-1">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          DIET_PLAN_STATUS_STYLE[plan.status] ??
                          "bg-[#F0F0F3] text-[#60646C]"
                        }`}
                      >
                        {plan.status}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditPlanOpen(true)}
                      >
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeleteError("");
                          setIsDeleteOpen(true);
                        }}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {deleteError && !isDeleteOpen && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{deleteError}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        DIET_PLAN_GOAL_STYLE[plan.goal] ??
                        "bg-[#F0F0F3] text-[#60646C]"
                      }`}
                    >
                      {DIET_PLAN_GOAL_LABELS[plan.goal] ?? plan.goal}
                    </span>
                    <MetaChip
                      icon={<Flame size={12} />}
                      label={`${plan.dailyCalorieTarget} kcal / day`}
                    />
                    <MetaChip
                      icon={<CalendarDays size={12} />}
                      label={`${plan.durationDays} days`}
                    />
                    <MetaChip
                      icon={
                        plan.visibility === "public" ? (
                          <Globe size={12} />
                        ) : (
                          <Lock size={12} />
                        )
                      }
                      label={plan.visibility}
                    />
                    <MetaChip
                      icon={<UserIcon size={12} />}
                      label={`${plan.creator.firstName} ${plan.creator.lastName}`}
                    />
                  </div>

                  {plan.restrictions && plan.restrictions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {plan.restrictions.map((restriction) => (
                        <span
                          key={restriction}
                          className="text-[11px] font-semibold text-[#5850DE] bg-[#E8E6FC] px-2 py-0.5 rounded-full"
                        >
                          {restriction}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-5">
                    <MacroStat
                      label="Protein"
                      value={`${plan.macros?.protein ?? 0}g`}
                    />
                    <MacroStat
                      label="Carbs"
                      value={`${plan.macros?.carbs ?? 0}g`}
                    />
                    <MacroStat
                      label="Fat"
                      value={`${plan.macros?.fat ?? 0}g`}
                    />
                    <MacroStat label="Price" value={formatPrice(plan)} />
                  </div>
                </div>

                {/* Meal plan by day */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1B173A]">
                      Meal Plan
                      <span className="text-sm font-medium text-[#8E8E93] ml-2">
                        {meals.length} meals across {days.length} days
                      </span>
                    </h3>
                    <Button onClick={() => setIsAddMealOpen(true)}>
                      <Plus size={18} className="mr-2" />
                      Add Meal
                    </Button>
                  </div>

                  {days.length === 0 ? (
                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                      <p className="text-[#60646C] text-sm">
                        No meals have been added to this plan yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {days.map((day) => (
                        <div key={day.dayNumber}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1B173A] text-white flex items-center justify-center text-xs font-bold">
                              {day.dayNumber}
                            </div>
                            <span className="text-sm font-bold text-[#1B173A]">
                              Day {day.dayNumber}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {day.meals.map((meal) => (
                              <MealCard
                                key={meal.id}
                                meal={meal}
                                onEdit={setEditingMeal}
                                onDelete={(target) => {
                                  setDeleteMealError("");
                                  setDeletingMeal(target);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        dietPlanId={dietPlanId}
        defaultDayNumber={days.length > 0 ? days[days.length - 1].dayNumber : 1}
      />

      {plan && (
        <EditDietPlanModal
          isOpen={isEditPlanOpen}
          onClose={() => setIsEditPlanOpen(false)}
          plan={plan}
        />
      )}

      {editingMeal && (
        <EditMealModal
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          dietPlanId={dietPlanId}
          meal={editingMeal}
        />
      )}

      {deletingMeal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  Delete Meal
                </h3>
                <button
                  type="button"
                  onClick={() => setDeletingMeal(null)}
                  aria-label="Close"
                  disabled={deleteMeal.isPending}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-[#60646C]">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#1B173A]">
                    {deletingMeal.title}
                  </strong>{" "}
                  from day {deletingMeal.dayNumber}? This action cannot be
                  undone.
                </p>

                {deleteMealError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{deleteMealError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleDeleteMeal}
                    disabled={deleteMeal.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {deleteMeal.isPending ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setDeletingMeal(null)}
                    variant="outline"
                    disabled={deleteMeal.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {isDeleteOpen &&
        plan &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  Delete Diet Plan
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  aria-label="Close"
                  disabled={deleteDietPlan.isPending}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-[#60646C]">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#1B173A]">{plan.title}</strong>? This
                  action cannot be undone.
                </p>

                {deleteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{deleteError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleDelete}
                    disabled={deleteDietPlan.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {deleteDietPlan.isPending ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsDeleteOpen(false)}
                    variant="outline"
                    disabled={deleteDietPlan.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </RoleGuard>
  );
}
