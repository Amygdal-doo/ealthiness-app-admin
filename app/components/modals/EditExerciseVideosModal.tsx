import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Video, X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui";
import { useUpdateExerciseVideos } from "~/hooks/useAuthApi";
import type { Exercise } from "~/lib/exercises/exercise";

interface EditExerciseVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
}

export const EditExerciseVideosModal: React.FC<
  EditExerciseVideosModalProps
> = ({ isOpen, onClose, exercise }) => {
  const updateVideos = useUpdateExerciseVideos();

  const [videos, setVideos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      updateVideos.reset();
      setVideos([]);
      setErrorMessage("");
    }
  }, [isOpen]);

  // Build object-URL previews for the selected files and revoke them on change
  // / unmount so we don't leak blobs.
  useEffect(() => {
    const urls = videos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [videos]);

  const appendFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files ? Array.from(event.target.files) : [];
    if (picked.length > 0) {
      setVideos((prev) => {
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
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (videos.length < 1) {
      setErrorMessage("Please select at least one video.");
      return;
    }
    setErrorMessage("");

    try {
      await updateVideos.mutateAsync({ exerciseId: exercise.id, videos });
      handleClose();
    } catch (error) {
      console.error("Failed to update exercise videos:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update videos. Please try again.",
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
              <Video size={18} />
            </div>
            Edit Videos
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
          {/* Current videos */}
          {exercise.videos.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#8E8E93] uppercase mb-2">
                Current videos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exercise.videos.map((video) => (
                  <video
                    key={video.url}
                    src={video.url}
                    controls
                    className="w-full rounded-lg border border-[#E0E1E6] bg-black"
                  />
                ))}
              </div>
              <p className="text-xs text-[#8E8E93] mt-2">
                Uploading new videos will replace the current ones.
              </p>
            </div>
          )}

          {/* New videos */}
          <div>
            <p className="text-[11px] font-bold text-[#8E8E93] uppercase mb-2">
              New videos{videos.length > 0 ? ` (${videos.length})` : ""}
            </p>
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E0E1E6] rounded-xl text-sm font-medium text-[#60646C] cursor-pointer hover:border-[#5850DE] hover:text-[#5850DE] transition-colors w-fit">
              <Video size={16} />
              Add videos
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={appendFiles}
              />
            </label>
            {videos.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="relative"
                  >
                    <video
                      src={previews[index]}
                      controls
                      title={file.name}
                      className="w-full rounded-lg border border-[#E0E1E6] bg-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-xs text-[#8E8E93] truncate mt-1">
                      {file.name}
                    </p>
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
            disabled={updateVideos.isPending || videos.length < 1}
            className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
          >
            {updateVideos.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Video size={16} className="mr-2" />
                Save Videos
              </>
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={updateVideos.isPending}
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
