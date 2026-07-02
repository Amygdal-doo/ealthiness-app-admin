import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dumbbell,
  X,
  Plus,
  Trash2,
  ImageIcon,
  Video,
  Loader2,
} from "lucide-react";
import { Button, Input, Textarea, Select } from "~/components/ui";
import { useCreateExercise } from "~/hooks/useAuthApi";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_FORCES,
  EXERCISE_MECHANICS,
  EXERCISE_EQUIPMENT,
  EXERCISE_LEVEL_OPTIONS,
  EXERCISE_MUSCLES,
  type ExerciseCategory,
  type ExerciseForce,
  type ExerciseMechanic,
  type ExerciseEquipment,
  type ExerciseCreateLevel,
  type ExerciseMuscle,
} from "~/lib/exercises/exercise";

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const titleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toOptions = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({ value, label: titleCase(value) }));

const CATEGORY_OPTIONS = toOptions(EXERCISE_CATEGORIES);
const FORCE_OPTIONS = toOptions(EXERCISE_FORCES);
const MECHANIC_OPTIONS = toOptions(EXERCISE_MECHANICS);
const EQUIPMENT_OPTIONS = toOptions(EXERCISE_EQUIPMENT);
const LEVEL_OPTIONS = toOptions(EXERCISE_LEVEL_OPTIONS);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <label className="block text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

const MuscleSelector: React.FC<{
  selected: ExerciseMuscle[];
  onToggle: (muscle: ExerciseMuscle) => void;
}> = ({ selected, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {EXERCISE_MUSCLES.map((muscle) => {
      const isActive = selected.includes(muscle);
      return (
        <button
          key={muscle}
          type="button"
          onClick={() => onToggle(muscle)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors border ${
            isActive
              ? "bg-[#5850DE] text-white border-[#5850DE]"
              : "bg-white text-[#60646C] border-[#E0E1E6] hover:border-[#5850DE] hover:text-[#5850DE]"
          }`}
        >
          {muscle}
        </button>
      );
    })}
  </div>
);

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createExercise = useCreateExercise();

  const [name, setName] = useState("");
  const [force, setForce] = useState<ExerciseForce | "">("");
  const [category, setCategory] = useState<ExerciseCategory | "">("");
  const [mechanic, setMechanic] = useState<ExerciseMechanic | "">("");
  const [equipment, setEquipment] = useState<ExerciseEquipment | "">("");
  const [level, setLevel] = useState<ExerciseCreateLevel | "">("");
  const [instructions, setInstructions] = useState<string[]>(["", ""]);
  const [primaryMuscles, setPrimaryMuscles] = useState<ExerciseMuscle[]>([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState<ExerciseMuscle[]>(
    [],
  );
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setName("");
    setForce("");
    setCategory("");
    setMechanic("");
    setEquipment("");
    setLevel("");
    setInstructions(["", ""]);
    setPrimaryMuscles([]);
    setSecondaryMuscles([]);
    setImages([]);
    setVideos([]);
    setErrorMessage("");
  };

  useEffect(() => {
    if (isOpen) {
      createExercise.reset();
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const toggleMuscle = (
    muscle: ExerciseMuscle,
    list: ExerciseMuscle[],
    setter: React.Dispatch<React.SetStateAction<ExerciseMuscle[]>>,
  ) => {
    setter(
      list.includes(muscle)
        ? list.filter((m) => m !== muscle)
        : [...list, muscle],
    );
  };

  const updateInstruction = (index: number, value: string) => {
    setInstructions((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const addInstruction = () => setInstructions((prev) => [...prev, ""]);

  const removeInstruction = (index: number) => {
    setInstructions((prev) =>
      prev.length <= 2 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const appendFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File[]>>,
  ) => {
    const picked = event.target.files ? Array.from(event.target.files) : [];
    if (picked.length > 0) {
      setter((prev) => {
        const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
        const additions = picked.filter(
          (f) => !existing.has(`${f.name}-${f.size}`),
        );
        return [...prev, ...additions];
      });
    }
    // Reset so re-selecting the same file still fires onChange.
    event.target.value = "";
  };

  const removeFile = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<File[]>>,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const cleanedInstructions = instructions
    .map((step) => step.trim())
    .filter(Boolean);

  const isValid =
    name.trim() &&
    force &&
    category &&
    mechanic &&
    equipment &&
    level &&
    cleanedInstructions.length >= 2 &&
    primaryMuscles.length >= 2 &&
    secondaryMuscles.length >= 2 &&
    images.length >= 1;

  const handleSubmit = async () => {
    if (!isValid) {
      setErrorMessage(
        "Please complete all required fields: add at least two instructions, two primary muscles, two secondary muscles, and one image.",
      );
      return;
    }
    setErrorMessage("");

    try {
      await createExercise.mutateAsync({
        name: name.trim(),
        force: force as ExerciseForce,
        category: category as ExerciseCategory,
        mechanic: mechanic as ExerciseMechanic,
        equipment: equipment as ExerciseEquipment,
        level: level as ExerciseCreateLevel,
        instructions: cleanedInstructions,
        primaryMuscles,
        secondaryMuscles,
        images,
        videos,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create exercise:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create exercise. Please try again.",
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
              <Dumbbell size={20} />
            </div>
            Create Exercise
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
          {/* Name */}
          <div>
            <SectionLabel>Name *</SectionLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Barbell Bench Press"
              className="w-full"
            />
          </div>

          {/* Force + Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SectionLabel>Force *</SectionLabel>
              <Select
                value={force}
                onChange={(value) => setForce(value as ExerciseForce)}
                options={FORCE_OPTIONS}
                placeholder="Select force"
              />
            </div>
            <div>
              <SectionLabel>Level *</SectionLabel>
              <Select
                value={level}
                onChange={(value) => setLevel(value as ExerciseCreateLevel)}
                options={LEVEL_OPTIONS}
                placeholder="Select level"
              />
            </div>
          </div>

          {/* Category + Mechanic + Equipment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <SectionLabel>Category *</SectionLabel>
              <Select
                value={category}
                onChange={(value) => setCategory(value as ExerciseCategory)}
                options={CATEGORY_OPTIONS}
                placeholder="Select"
              />
            </div>
            <div>
              <SectionLabel>Mechanic *</SectionLabel>
              <Select
                value={mechanic}
                onChange={(value) => setMechanic(value as ExerciseMechanic)}
                options={MECHANIC_OPTIONS}
                placeholder="Select"
              />
            </div>
            <div>
              <SectionLabel>Equipment *</SectionLabel>
              <Select
                value={equipment}
                onChange={(value) => setEquipment(value as ExerciseEquipment)}
                options={EQUIPMENT_OPTIONS}
                placeholder="Select"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <SectionLabel>Instructions * (at least 2)</SectionLabel>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="w-6 h-8 flex items-center justify-center text-xs font-bold text-[#5850DE] shrink-0">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    aria-label="Remove step"
                    className="p-2 mt-0.5 text-[#8E8E93] hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInstruction}
              className="mt-2"
            >
              <Plus size={14} className="mr-1" />
              Add step
            </Button>
          </div>

          {/* Primary muscles */}
          <div>
            <SectionLabel>Primary Muscles * (at least 2)</SectionLabel>
            <MuscleSelector
              selected={primaryMuscles}
              onToggle={(muscle) =>
                toggleMuscle(muscle, primaryMuscles, setPrimaryMuscles)
              }
            />
          </div>

          {/* Secondary muscles */}
          <div>
            <SectionLabel>Secondary Muscles * (at least 2)</SectionLabel>
            <MuscleSelector
              selected={secondaryMuscles}
              onToggle={(muscle) =>
                toggleMuscle(muscle, secondaryMuscles, setSecondaryMuscles)
              }
            />
          </div>

          {/* Images */}
          <div>
            <SectionLabel>
              Images * (at least 1)
              {images.length > 0 ? ` — ${images.length} selected` : ""}
            </SectionLabel>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E0E1E6] rounded-xl text-sm font-medium text-[#60646C] cursor-pointer hover:border-[#5850DE] hover:text-[#5850DE] transition-colors w-fit">
              <ImageIcon size={16} />
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => appendFiles(e, setImages)}
              />
            </label>
            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((file, index) => (
                  <span
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#5850DE] bg-[#E8E6FC] pl-2.5 pr-1.5 py-1 rounded-full max-w-[220px]"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index, setImages)}
                      aria-label={`Remove ${file.name}`}
                      className="p-0.5 rounded-full hover:bg-[#5850DE]/20 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <SectionLabel>
              Videos{videos.length > 0 ? ` (${videos.length})` : ""}
            </SectionLabel>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E0E1E6] rounded-xl text-sm font-medium text-[#60646C] cursor-pointer hover:border-[#5850DE] hover:text-[#5850DE] transition-colors w-fit">
              <Video size={16} />
              Add videos
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => appendFiles(e, setVideos)}
              />
            </label>
            {videos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {videos.map((file, index) => (
                  <span
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#248FEC] bg-[#E5F1FD] pl-2.5 pr-1.5 py-1 rounded-full max-w-[220px]"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index, setVideos)}
                      aria-label={`Remove ${file.name}`}
                      className="p-0.5 rounded-full hover:bg-[#248FEC]/20 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
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
            disabled={createExercise.isPending || !isValid}
            className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
          >
            {createExercise.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Dumbbell size={16} className="mr-2" />
                Create Exercise
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={createExercise.isPending}
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
