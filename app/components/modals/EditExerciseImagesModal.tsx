import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui";
import { useUpdateExerciseImages } from "~/hooks/useAuthApi";
import type { Exercise } from "~/lib/exercises/exercise";

interface EditExerciseImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
}

export const EditExerciseImagesModal: React.FC<
  EditExerciseImagesModalProps
> = ({ isOpen, onClose, exercise }) => {
  const updateImages = useUpdateExerciseImages();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      updateImages.reset();
      setImages([]);
      setErrorMessage("");
    }
  }, [isOpen]);

  // Build object-URL previews for the selected files and revoke them on change
  // / unmount so we don't leak blobs.
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  const appendFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files ? Array.from(event.target.files) : [];
    if (picked.length > 0) {
      setImages((prev) => {
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

  const removeFile = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (images.length < 1) {
      setErrorMessage("Please select at least one image.");
      return;
    }
    setErrorMessage("");

    try {
      await updateImages.mutateAsync({ exerciseId: exercise.id, images });
      handleClose();
    } catch (error) {
      console.error("Failed to update exercise images:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update images. Please try again.",
      );
    }
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between gap-3 shrink-0">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
            Edit Images
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
          {/* Current images */}
          {exercise.images.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#8E8E93] uppercase mb-2">
                Current images
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {exercise.images.map((image) => (
                  <img
                    key={image.url}
                    src={image.url}
                    alt={image.name}
                    className="h-24 rounded-lg border border-[#E0E1E6] object-cover shrink-0"
                  />
                ))}
              </div>
              <p className="text-xs text-[#8E8E93] mt-2">
                Uploading new images will replace the current ones.
              </p>
            </div>
          )}

          {/* New images */}
          <div>
            <p className="text-[11px] font-bold text-[#8E8E93] uppercase mb-2">
              New images{images.length > 0 ? ` (${images.length})` : ""}
            </p>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E0E1E6] rounded-xl text-sm font-medium text-[#60646C] cursor-pointer hover:border-[#5850DE] hover:text-[#5850DE] transition-colors w-fit">
              <ImageIcon size={16} />
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={appendFiles}
              />
            </label>
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="relative group"
                  >
                    <img
                      src={previews[index]}
                      alt={file.name}
                      title={file.name}
                      className="h-24 w-full rounded-lg border border-[#E0E1E6] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
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
            disabled={updateImages.isPending || images.length < 1}
            className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
          >
            {updateImages.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ImageIcon size={16} className="mr-2" />
                Save Images
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={updateImages.isPending}
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
