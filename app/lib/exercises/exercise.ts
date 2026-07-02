/* -------------------------------------------------------------------------- */
/*  Exercise catalog (GET /v2/exercise/pagination)                            */
/* -------------------------------------------------------------------------- */

export interface ExerciseImage {
  name: string;
  extension: string;
  createdAt: string;
  url: string;
}

export interface ExerciseVideo {
  name: string;
  extension: string;
  createdAt: string;
  url: string;
}

export type ExerciseLevel = "beginner" | "intermediate" | "expert";

/** Body-part filter values accepted by the `body_part` query param. */
export type ExerciseBodyPart =
  | "Arms"
  | "Legs"
  | "Back"
  | "Shoulders"
  | "Abs"
  | "Chest"
  | "Neck";

/** A single exercise as returned by the pagination endpoint. */
export interface Exercise {
  id: string;
  name: string;
  level: ExerciseLevel;
  instructions: string[];
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string | null;
  images: ExerciseImage[];
  videos: ExerciseVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: Exercise[];
}

export interface ExercisesQueryParams {
  page?: number;
  limit?: number;
  /** Free-text search matched against the exercise name. */
  name?: string;
  level?: ExerciseLevel;
  body_part?: ExerciseBodyPart;
}

/* -------------------------------------------------------------------------- */
/*  Filter option lists (shared by the view)                                  */
/* -------------------------------------------------------------------------- */

export const EXERCISE_LEVELS: ExerciseLevel[] = [
  "beginner",
  "intermediate",
  "expert",
];

export const EXERCISE_BODY_PARTS: ExerciseBodyPart[] = [
  "Arms",
  "Legs",
  "Back",
  "Shoulders",
  "Abs",
  "Chest",
  "Neck",
];

export const LEVEL_STYLE: Record<ExerciseLevel, string> = {
  beginner: "bg-[#E6F6EC] text-[#1A7F45]",
  intermediate: "bg-[#FFF4E5] text-[#B25E09]",
  expert: "bg-red-50 text-red-500",
};

/* -------------------------------------------------------------------------- */
/*  Exercise creation (POST /v1/exercise)                                     */
/* -------------------------------------------------------------------------- */

export const EXERCISE_CATEGORIES = [
  "strength",
  "powerlifting",
  "stretching",
  "cardio",
  "olympic weightlifting",
  "plyometrics",
  "strongman",
] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const EXERCISE_FORCES = ["pull", "push", "static"] as const;
export type ExerciseForce = (typeof EXERCISE_FORCES)[number];

export const EXERCISE_MECHANICS = ["isolation", "compound"] as const;
export type ExerciseMechanic = (typeof EXERCISE_MECHANICS)[number];

export const EXERCISE_LEVEL_OPTIONS = [
  "beginner",
  "intermediate",
  "expert",
] as const;
export type ExerciseCreateLevel = (typeof EXERCISE_LEVEL_OPTIONS)[number];

export const EXERCISE_EQUIPMENT = [
  "dumbbell",
  "barbell",
  "kettlebells",
  "exercise ball",
  "machine",
  "cable",
  "foam roll",
  "bands",
  "e-z curl bar",
  "medicine ball",
  "body only",
  "other",
] as const;
export type ExerciseEquipment = (typeof EXERCISE_EQUIPMENT)[number];

export const EXERCISE_MUSCLES = [
  "forearms",
  "calves",
  "abdominals",
  "lats",
  "biceps",
  "traps",
  "middle back",
  "shoulders",
  "hamstrings",
  "quadriceps",
  "chest",
  "abductors",
  "glutes",
  "triceps",
  "adductors",
  "neck",
  "lower back",
] as const;
export type ExerciseMuscle = (typeof EXERCISE_MUSCLES)[number];

/** Payload accepted by POST /v1/exercise (sent as multipart/form-data). */
export interface CreateExercisePayload {
  name: string;
  force: ExerciseForce;
  category: ExerciseCategory;
  instructions: string[];
  mechanic: ExerciseMechanic;
  primaryMuscles: ExerciseMuscle[];
  secondaryMuscles: ExerciseMuscle[];
  equipment: ExerciseEquipment;
  level: ExerciseCreateLevel;
  images: File[];
  videos: File[];
}

/**
 * Payload accepted by PUT /v1/exercise/:id. Images and videos are not editable
 * through this route, so they are omitted.
 */
export type UpdateExercisePayload = Omit<
  CreateExercisePayload,
  "images" | "videos"
>;
