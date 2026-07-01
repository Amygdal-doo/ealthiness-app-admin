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
