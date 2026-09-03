import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X, Plus, Trash2, Loader2 } from "lucide-react";
import { Button, Input, Textarea, Select } from "~/components/ui";
import { useUpdateExercise } from "~/hooks/useAuthApi";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_FORCES,
  EXERCISE_MECHANICS,
  EXERCISE_EQUIPMENT,
  EXERCISE_LEVEL_OPTIONS,
  EXERCISE_MUSCLES,
  type Exercise,
  type ExerciseCategory,
  type ExerciseForce,
  type ExerciseMechanic,
  type ExerciseEquipment,
  type ExerciseCreateLevel,
  type ExerciseMuscle,
} from "~/lib/exercises/exercise";

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
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

export const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  isOpen,
  onClose,
  exercise,
}) => {
  const updateExercise = useUpdateExercise();

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
  const [errorMessage, setErrorMessage] = useState("");

  // Pre-fill the form from the exercise whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      updateExercise.reset();
      setErrorMessage("");
      setName(exercise.name ?? "");
      setForce((exercise.force as ExerciseForce | null) ?? "");
      setCategory((exercise.category as ExerciseCategory | null) ?? "");
      setMechanic((exercise.mechanic as ExerciseMechanic | null) ?? "");
      setEquipment((exercise.equipment as ExerciseEquipment | null) ?? "");
      setLevel((exercise.level as ExerciseCreateLevel | null) ?? "");
      setInstructions(
        exercise.instructions.length >= 2
          ? exercise.instructions
          : [...exercise.instructions, "", ""].slice(0, 2),
      );
      setPrimaryMuscles(exercise.primaryMuscles as ExerciseMuscle[]);
      setSecondaryMuscles(exercise.secondaryMuscles as ExerciseMuscle[]);
    }
  }, [isOpen, exercise]);

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
    secondaryMuscles.length >= 2;

  const handleSubmit = async () => {
    if (!isValid) {
      setErrorMessage(
        "Please complete all required fields: add at least two instructions, two primary muscles, and two secondary muscles.",
      );
      return;
    }
    setErrorMessage("");

    try {
      await updateExercise.mutateAsync({
        exerciseId: exercise.id,
        data: {
          name: name.trim(),
          force: force as ExerciseForce,
          category: category as ExerciseCategory,
          mechanic: mechanic as ExerciseMechanic,
          equipment: equipment as ExerciseEquipment,
          level: level as ExerciseCreateLevel,
          instructions: cleanedInstructions,
          primaryMuscles,
          secondaryMuscles,
        },
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update exercise:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update exercise. Please try again.",
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
              <Pencil size={18} />
            </div>
            Edit Exercise
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

          <div className="p-3 bg-[#F8F9FB] border border-[#E0E1E6] rounded-lg">
            <p className="text-xs text-[#8E8E93]">
              Images and videos cannot be changed here.
            </p>
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
            disabled={updateExercise.isPending || !isValid}
            className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
          >
            {updateExercise.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Pencil size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={updateExercise.isPending}
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
