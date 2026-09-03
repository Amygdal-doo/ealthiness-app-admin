/* -------------------------------------------------------------------------- */
/*  Diet plans (GET /v1/diet-plan/me/created)                                 */
/* -------------------------------------------------------------------------- */

export type DietPlanGoal =
  | "lose_weight"
  | "maintain"
  | "gain_muscle"
  | "eat_healthy"
  | "performance";

export type DietPlanVisibility = "public" | "coach_group";

export type DietPlanStatus = "active" | "archived";

export type DietPlanCurrency = "usd" | "bam" | "eur";

export interface DietPlanMacros {
  protein: number;
  carbs: number;
  fat: number;
}

/** A single diet plan created by the current super admin. */
export interface DietPlan {
  id: string;
  title: string;
  description: string;
  goal: DietPlanGoal;
  dailyCalorieTarget: number;
  macros?: DietPlanMacros;
  durationDays: number;
  restrictions?: string[];
  visibility: DietPlanVisibility;
  isFree: boolean;
  price: number;
  currency: string;
  status: DietPlanStatus;
  createdAt: string;
  updatedAt: string;
  creator: string;
}

/* -------------------------------------------------------------------------- */
/*  Diet plan detail (GET /v1/diet-plan/:id)                                  */
/* -------------------------------------------------------------------------- */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface DietPlanCreator {
  id: string;
  firstName: string;
  lastName: string;
}

/** Uploaded meal image as returned by the API. */
export interface MealImage {
  name: string;
  extension: string;
  createdAt: string;
  url: string;
}

export interface MealFoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietPlanMeal {
  id: string;
  dietPlan: string;
  dayNumber: number;
  mealType: MealType;
  title: string;
  description: string;
  ingredients: string[];
  foodItems: MealFoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  order: number;
  image?: MealImage | null;
  createdAt: string;
  updatedAt: string;
}

/** The plan portion of the detail response, where `creator` is expanded. */
export interface DietPlanDetail extends Omit<DietPlan, "creator"> {
  creator: DietPlanCreator;
}

export interface DietPlanDetailResponse {
  plan: DietPlanDetail;
  meals: DietPlanMeal[];
}

/* -------------------------------------------------------------------------- */
/*  Display helpers                                                            */
/* -------------------------------------------------------------------------- */

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const MEAL_TYPE_STYLE: Record<MealType, string> = {
  breakfast: "bg-[#FFF4E5] text-[#B25E09]",
  lunch: "bg-[#E6F6EC] text-[#1A7F45]",
  dinner: "bg-[#E8E6FC] text-[#5850DE]",
  snack: "bg-[#EAF4FE] text-[#1E6FB8]",
};

/** Order meals are displayed within a day. */
export const MEAL_TYPE_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

/** Selectable meal types (same order as they appear within a day). */
export const MEAL_TYPES: MealType[] = MEAL_TYPE_ORDER;

/* -------------------------------------------------------------------------- */
/*  Meal creation (POST /v1/diet-plan/:id/meals)                             */
/* -------------------------------------------------------------------------- */

/**
 * Payload accepted by POST /v1/diet-plan/:id/meals (sent as multipart/form-data
 * so an optional meal image can be attached).
 */
export interface CreateMealPayload {
  dayNumber: number;
  mealType: MealType;
  title: string;
  description?: string;
  ingredients?: string[];
  foodItems?: MealFoodItem[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  order?: number;
  image?: File;
}

/**
 * Payload accepted by PUT /v1/diet-plan/:id/meals/:mealId. Every field is
 * optional so the caller can send only what changed (sent as multipart/form-data
 * so the meal image can be replaced).
 */
export interface UpdateMealPayload {
  dayNumber?: number;
  mealType?: MealType;
  title?: string;
  description?: string;
  ingredients?: string[];
  foodItems?: MealFoodItem[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  order?: number;
  image?: File;
}

export const DIET_PLAN_GOAL_LABELS: Record<DietPlanGoal, string> = {
  lose_weight: "Lose Weight",
  maintain: "Maintain",
  gain_muscle: "Gain Muscle",
  eat_healthy: "Eat Healthy",
  performance: "Performance",
};

export const DIET_PLAN_GOAL_STYLE: Record<DietPlanGoal, string> = {
  lose_weight: "bg-[#FFF4E5] text-[#B25E09]",
  maintain: "bg-[#EAF4FE] text-[#1E6FB8]",
  gain_muscle: "bg-[#E8E6FC] text-[#5850DE]",
  eat_healthy: "bg-[#E6F6EC] text-[#1A7F45]",
  performance: "bg-[#FDEBF3] text-[#B02A6E]",
};

export const DIET_PLAN_STATUS_STYLE: Record<DietPlanStatus, string> = {
  active: "bg-[#E6F6EC] text-[#1A7F45]",
  archived: "bg-[#F0F0F3] text-[#60646C]",
};

export const DIET_PLAN_VISIBILITY_LABELS: Record<DietPlanVisibility, string> = {
  public: "Public",
  coach_group: "Coach Group",
};

export const DIET_PLAN_CURRENCY_LABELS: Record<DietPlanCurrency, string> = {
  usd: "USD",
  bam: "BAM",
  eur: "EUR",
};

/* -------------------------------------------------------------------------- */
/*  Diet plan creation (POST /v1/diet-plan)                                   */
/* -------------------------------------------------------------------------- */

export const DIET_PLAN_GOALS: DietPlanGoal[] = [
  "lose_weight",
  "maintain",
  "gain_muscle",
  "eat_healthy",
  "performance",
];

export const DIET_PLAN_VISIBILITIES: DietPlanVisibility[] = [
  "public",
  "coach_group",
];

export const DIET_PLAN_CURRENCIES: DietPlanCurrency[] = ["usd", "bam", "eur"];

/**
 * Payload accepted by POST /v1/diet-plan (sent as multipart/form-data so the
 * optional cover image can be attached).
 */
export interface CreateDietPlanPayload {
  title: string;
  description?: string;
  goal: DietPlanGoal;
  dailyCalorieTarget: number;
  macros?: DietPlanMacros;
  durationDays: number;
  restrictions?: string[];
  visibility: DietPlanVisibility;
  isFree?: boolean;
  price?: number;
  currency?: DietPlanCurrency;
  /** Required when visibility is "coach_group". */
  coachGroup?: string;
  image?: File;
}

/**
 * Payload accepted by PUT /v1/diet-plan/:id. Every field is optional so the
 * caller can send only what changed (sent as multipart/form-data so the cover
 * image can be replaced).
 */
export interface UpdateDietPlanPayload {
  title?: string;
  description?: string;
  goal?: DietPlanGoal;
  dailyCalorieTarget?: number;
  macros?: DietPlanMacros;
  durationDays?: number;
  restrictions?: string[];
  visibility?: DietPlanVisibility;
  isFree?: boolean;
  price?: number;
  currency?: DietPlanCurrency;
  /** Required when visibility is "coach_group". */
  coachGroup?: string;
  image?: File;
}
