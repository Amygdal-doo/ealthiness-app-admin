import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/exercises";
import {
  Dumbbell,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Wrench,
  Plus,
} from "lucide-react";
import { Input, Button, Select } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useExercises } from "~/hooks/useAuthApi";
import { CreateExerciseModal } from "~/components/modals/CreateExerciseModal";
import {
  EXERCISE_LEVELS,
  EXERCISE_BODY_PARTS,
  LEVEL_STYLE,
  type Exercise,
  type ExerciseLevel,
  type ExerciseBodyPart,
} from "~/lib/exercises/exercise";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Exercises - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Browse the exercise catalog on the Ealthiness platform",
    },
  ];
}

const PAGE_SIZE = 12;
const ALL = "all";

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const LEVEL_OPTIONS = [
  { value: ALL, label: "All levels" },
  ...EXERCISE_LEVELS.map((level) => ({ value: level, label: titleCase(level) })),
];

const BODY_PART_OPTIONS = [
  { value: ALL, label: "All body parts" },
  ...EXERCISE_BODY_PARTS.map((part) => ({ value: part, label: part })),
];

/* -------------------------------------------------------------------------- */
/*  Exercise card                                                             */
/* -------------------------------------------------------------------------- */

const MuscleChips: React.FC<{ muscles: string[] }> = ({ muscles }) => (
  <div className="flex flex-wrap gap-1.5">
    {muscles.map((muscle) => (
      <span
        key={muscle}
        className="text-[11px] font-semibold text-[#5850DE] bg-[#E8E6FC] px-2 py-0.5 rounded-full capitalize"
      >
        {muscle}
      </span>
    ))}
  </div>
);

const ExerciseCard: React.FC<{
  exercise: Exercise;
  onClick: () => void;
}> = ({ exercise, onClick }) => {
  const image = exercise.images[0]?.url;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white rounded-[20px] border border-[#E0E1E6] shadow-sm overflow-hidden hover:border-[#5850DE] hover:shadow-md transition-all"
    >
      <div className="h-40 bg-[#F0F0F3] flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Dumbbell size={32} className="text-[#C7C7CC]" />
        )}
      </div>
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#1B173A] leading-snug line-clamp-2">
            {exercise.name}
          </h3>
          <span
            className={`shrink-0 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
              LEVEL_STYLE[exercise.level] ?? "bg-[#F0F0F3] text-[#60646C]"
            }`}
          >
            {exercise.level}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8E8E93] font-medium">
          {exercise.category && (
            <span className="flex items-center gap-1 capitalize">
              <Layers size={12} />
              {exercise.category}
            </span>
          )}
          {exercise.equipment && (
            <span className="flex items-center gap-1 capitalize">
              <Wrench size={12} />
              {exercise.equipment}
            </span>
          )}
        </div>

        {exercise.primaryMuscles.length > 0 && (
          <MuscleChips muscles={exercise.primaryMuscles} />
        )}
      </div>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ExercisesPage() {
  const user = useUser();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [level, setLevel] = useState<ExerciseLevel | undefined>();
  const [bodyPart, setBodyPart] = useState<ExerciseBodyPart | undefined>();
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Debounce the search box; reset to the first page when the query settles.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch, isFetching } = useExercises({
    page,
    limit: PAGE_SIZE,
    name: debouncedSearch || undefined,
    level,
    body_part: bodyPart,
  });

  const exercises = data?.results ?? [];
  const totalPages = data?.pages ?? 1;

  const onLevelChange = (value: string) => {
    setLevel(value === ALL ? undefined : (value as ExerciseLevel));
    setPage(1);
  };
  const onBodyPartChange = (value: string) => {
    setBodyPart(value === ALL ? undefined : (value as ExerciseBodyPart));
    setPage(1);
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
                      <Dumbbell size={20} />
                    </div>
                    Exercises
                  </h2>
                  <p className="text-[#60646C] text-sm font-medium mt-1">
                    {data
                      ? `${data.total} exercises found (${exercises.length} on this page)`
                      : "Browse the exercise catalog"}
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create Exercise
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
                      placeholder="Search by exercise name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-44">
                      <Select
                        value={level ?? ALL}
                        onChange={onLevelChange}
                        options={LEVEL_OPTIONS}
                      />
                    </div>
                    <div className="w-44">
                      <Select
                        value={bodyPart ?? ALL}
                        onChange={onBodyPartChange}
                        options={BODY_PART_OPTIONS}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* States */}
              {isLoading ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-12">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Loader2 size={20} className="animate-spin text-[#5850DE]" />
                    <span className="font-medium">Loading exercises...</span>
                  </div>
                </div>
              ) : isError ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <p className="text-[#60646C] text-sm mb-4">
                    Something went wrong while fetching exercises.
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              ) : exercises.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                    <Dumbbell size={24} className="text-[#8E8E93]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                    No Exercises Found
                  </h3>
                  <p className="text-[#60646C] text-sm">
                    {searchTerm || level || bodyPart
                      ? "No exercises match the current filters."
                      : "There are no exercises in the catalog yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {exercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onClick={() => navigate(`/exercises/${exercise.id}`)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !isError && totalPages > 1 && (
                <div className="bg-white rounded-xl border border-[#E0E1E6] mt-6 p-4 shadow-sm flex items-center justify-between">
                  <span className="text-sm text-[#60646C]">
                    Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(page * PAGE_SIZE, data?.total ?? 0)} of{" "}
                    {data?.total ?? 0} results
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || isFetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-[#60646C] px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || isFetching}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateExerciseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </RoleGuard>
  );
}
