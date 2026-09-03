import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/diet-plans";
import {
  UtensilsCrossed,
  Search,
  Loader2,
  Flame,
  CalendarDays,
  Globe,
  Lock,
  Plus,
} from "lucide-react";
import { Input, Button, Select } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useCreatedDietPlans } from "~/hooks/useAuthApi";
import { CreateDietPlanModal } from "~/components/modals/CreateDietPlanModal";
import {
  DIET_PLAN_GOAL_LABELS,
  DIET_PLAN_GOAL_STYLE,
  DIET_PLAN_STATUS_STYLE,
  type DietPlan,
  type DietPlanGoal,
} from "~/lib/diet-plans/diet-plan";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Diet Plans - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage the diet plans you have created on the Ealthiness platform",
    },
  ];
}

const ALL = "all";

const GOAL_OPTIONS = [
  { value: ALL, label: "All goals" },
  ...(Object.keys(DIET_PLAN_GOAL_LABELS) as DietPlanGoal[]).map((goal) => ({
    value: goal,
    label: DIET_PLAN_GOAL_LABELS[goal],
  })),
];

const formatPrice = (plan: DietPlan) => {
  if (plan.isFree || plan.price === 0) return "Free";
  const currency = plan.currency?.toUpperCase() ?? "";
  return `${plan.price.toFixed(2)} ${currency}`.trim();
};

/* -------------------------------------------------------------------------- */
/*  Diet plan card                                                            */
/* -------------------------------------------------------------------------- */

const MacroPill: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="flex-1 text-center bg-[#F8F9FB] rounded-lg py-1.5">
    <p className="text-[11px] font-semibold text-[#8E8E93] uppercase">{label}</p>
    <p className="text-sm font-bold text-[#1B173A]">{value}g</p>
  </div>
);

const DietPlanCard: React.FC<{ plan: DietPlan; onClick: () => void }> = ({
  plan,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left bg-white rounded-[20px] border border-[#E0E1E6] shadow-sm overflow-hidden hover:border-[#5850DE] hover:shadow-md transition-all"
  >
    <div className="p-5 space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-[#1B173A] leading-snug line-clamp-2">
          {plan.title}
        </h3>
        <span
          className={`shrink-0 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
            DIET_PLAN_STATUS_STYLE[plan.status] ?? "bg-[#F0F0F3] text-[#60646C]"
          }`}
        >
          {plan.status}
        </span>
      </div>

      <p className="text-xs text-[#60646C] leading-relaxed line-clamp-3">
        {plan.description}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            DIET_PLAN_GOAL_STYLE[plan.goal] ?? "bg-[#F0F0F3] text-[#60646C]"
          }`}
        >
          {DIET_PLAN_GOAL_LABELS[plan.goal] ?? plan.goal}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#8E8E93]">
          <Flame size={12} />
          {plan.dailyCalorieTarget} kcal
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#8E8E93]">
          <CalendarDays size={12} />
          {plan.durationDays} days
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#8E8E93] capitalize">
          {plan.visibility === "public" ? (
            <Globe size={12} />
          ) : (
            <Lock size={12} />
          )}
          {plan.visibility}
        </span>
      </div>

      {plan.macros && (
        <div className="flex items-center gap-2">
          <MacroPill label="Protein" value={plan.macros.protein} />
          <MacroPill label="Carbs" value={plan.macros.carbs} />
          <MacroPill label="Fat" value={plan.macros.fat} />
        </div>
      )}

      {plan.restrictions && plan.restrictions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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

      <div className="flex items-center justify-between pt-1 border-t border-[#F0F0F3]">
        <span className="text-sm font-bold text-[#1B173A]">
          {formatPrice(plan)}
        </span>
      </div>
    </div>
  </button>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function DietPlansPage() {
  const user = useUser();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [goal, setGoal] = useState<DietPlanGoal | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } =
    useCreatedDietPlans();

  const plans = useMemo(() => {
    const all = data ?? [];
    const query = searchTerm.trim().toLowerCase();
    return all.filter((plan) => {
      const matchesGoal = !goal || plan.goal === goal;
      const matchesSearch =
        !query ||
        plan.title.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query);
      return matchesGoal && matchesSearch;
    });
  }, [data, searchTerm, goal]);

  const onGoalChange = (value: string) => {
    setGoal(value === ALL ? undefined : (value as DietPlanGoal));
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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                      <UtensilsCrossed size={20} />
                    </div>
                    Diet Plans
                  </h2>
                  <p className="text-[#60646C] text-sm font-medium mt-1">
                    {data
                      ? `${data.length} plans created (${plans.length} shown)`
                      : "Manage the diet plans you have created"}
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create Diet Plan
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-xl border border-[#E0E1E6] p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]"
                    />
                    <Input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 w-full"
                    />
                  </div>
                  <div className="w-44">
                    <Select
                      value={goal ?? ALL}
                      onChange={onGoalChange}
                      options={GOAL_OPTIONS}
                    />
                  </div>
                </div>
              </div>

              {/* States */}
              {isLoading ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-12">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Loader2 size={20} className="animate-spin text-[#5850DE]" />
                    <span className="font-medium">Loading diet plans...</span>
                  </div>
                </div>
              ) : isError ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <p className="text-[#60646C] text-sm mb-4">
                    Something went wrong while fetching diet plans.
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              ) : plans.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed size={24} className="text-[#8E8E93]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                    No Diet Plans Found
                  </h3>
                  <p className="text-[#60646C] text-sm">
                    {searchTerm || goal
                      ? "No diet plans match the current filters."
                      : "You haven't created any diet plans yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {plans.map((plan) => (
                    <DietPlanCard
                      key={plan.id}
                      plan={plan}
                      onClick={() => navigate(`/diet-plans/${plan.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateDietPlanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </RoleGuard>
  );
}
