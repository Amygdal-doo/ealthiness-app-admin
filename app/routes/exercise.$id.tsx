import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, Link } from "react-router";
import type { Route } from "./+types/exercise.$id";
import {
  ArrowLeft,
  Dumbbell,
  Layers,
  Wrench,
  Zap,
  Target,
  Loader2,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useExercise, useDeleteExercise } from "~/hooks/useAuthApi";
import { LEVEL_STYLE, type ExerciseLevel } from "~/lib/exercises/exercise";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Exercise Details - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "View detailed information about an exercise",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return { exerciseId: params.id };
}

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

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-[#8E8E93] mt-0.5">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-[#8E8E93] uppercase">{label}</p>
      <p className="text-sm text-[#1B173A] capitalize break-words">{value}</p>
    </div>
  </div>
);

export default function ExerciseDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const params = useParams();
  const exerciseId = loaderData?.exerciseId || params.id || "";

  const user = useUser();
  const navigate = useNavigate();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const deleteExercise = useDeleteExercise();

  const {
    data: exercise,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useExercise(isDeleted ? "" : exerciseId);

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await deleteExercise.mutateAsync(exerciseId);
      // Disable the detail query before navigating so it never refetches the
      // now-deleted exercise (which would 404).
      setIsDeleted(true);
      setIsDeleteOpen(false);
      navigate("/exercises");
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete exercise. Please try again.",
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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
              <Link
                to="/exercises"
                className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
              >
                <ArrowLeft size={18} />
                Back to Exercises
              </Link>

              {isLoading ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-12">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Loader2 size={20} className="animate-spin text-[#5850DE]" />
                    <span className="font-medium">Loading exercise...</span>
                  </div>
                </div>
              ) : isError || !exercise ? (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                    <Dumbbell size={24} className="text-[#8E8E93]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#1B173A] mb-2">
                    Exercise Not Found
                  </h2>
                  <p className="text-[#60646C] text-sm mb-4">
                    The exercise you're looking for could not be found.
                  </p>
                  <Link
                    to="/exercises"
                    className="text-[#5850DE] hover:underline font-semibold"
                  >
                    Back to Exercises
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center shrink-0">
                        <Dumbbell size={28} />
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-2xl font-extrabold text-[#1B173A] break-words">
                          {exercise.name}
                        </h1>
                        <span
                          className={`inline-block mt-1.5 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            LEVEL_STYLE[exercise.level as ExerciseLevel] ??
                            "bg-[#F0F0F3] text-[#60646C]"
                          }`}
                        >
                          {exercise.level}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDeleteError("");
                        setIsDeleteOpen(true);
                      }}
                      className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                  {deleteError && !isDeleteOpen && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{deleteError}</p>
                    </div>
                  )}

                  {/* Media */}
                  {exercise.images.length > 0 && (
                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                      <h3 className="text-[11px] font-bold text-[#8E8E93] uppercase mb-3">
                        Images
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {exercise.images.map((image) => (
                          <img
                            key={image.url}
                            src={image.url}
                            alt={image.name}
                            className="h-48 rounded-xl border border-[#E0E1E6] object-cover shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {exercise.videos.length > 0 && (
                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                      <h3 className="text-[11px] font-bold text-[#8E8E93] uppercase mb-3">
                        Videos
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {exercise.videos.map((video) => (
                          <video
                            key={video.url}
                            src={video.url}
                            controls
                            className="w-full rounded-xl border border-[#E0E1E6] bg-black"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {exercise.category && (
                        <DetailRow
                          icon={<Layers size={14} />}
                          label="Category"
                          value={exercise.category}
                        />
                      )}
                      {exercise.equipment && (
                        <DetailRow
                          icon={<Wrench size={14} />}
                          label="Equipment"
                          value={exercise.equipment}
                        />
                      )}
                      {exercise.force && (
                        <DetailRow
                          icon={<Zap size={14} />}
                          label="Force"
                          value={exercise.force}
                        />
                      )}
                      {exercise.mechanic && (
                        <DetailRow
                          icon={<Target size={14} />}
                          label="Mechanic"
                          value={exercise.mechanic}
                        />
                      )}
                    </div>
                  </div>

                  {/* Muscles */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6 space-y-4">
                    {exercise.primaryMuscles.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-[#8E8E93] uppercase">
                          Primary muscles
                        </p>
                        <MuscleChips muscles={exercise.primaryMuscles} />
                      </div>
                    )}
                    {exercise.secondaryMuscles.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-[#8E8E93] uppercase">
                          Secondary muscles
                        </p>
                        <MuscleChips muscles={exercise.secondaryMuscles} />
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  {exercise.instructions.length > 0 && (
                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                      <p className="text-[11px] font-bold text-[#8E8E93] uppercase mb-3">
                        Instructions
                      </p>
                      <ol className="space-y-2">
                        {exercise.instructions.map((step, index) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm text-[#1B173A]"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#E8E6FC] text-[#5850DE] text-xs font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDeleteOpen &&
        exercise &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  Delete Exercise
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  aria-label="Close"
                  disabled={deleteExercise.isPending}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-[#60646C]">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#1B173A]">{exercise.name}</strong>?
                  This action cannot be undone.
                </p>

                {deleteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{deleteError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleDelete}
                    disabled={deleteExercise.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {deleteExercise.isPending ? (
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
                    disabled={deleteExercise.isPending}
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
