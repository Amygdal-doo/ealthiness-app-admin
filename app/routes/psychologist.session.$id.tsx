import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Route } from "./+types/psychologist.session.$id";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Globe,
  FileText,
  Sparkles,
  Headphones,
  Download,
  NotebookPen,
  Pencil,
  Plus,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { Badge, Button, Textarea } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { useUser } from "~/hooks/useAuth";
import {
  usePsychologistSession,
  useUpdateSessionNotes,
  useDeleteSession,
} from "~/hooks/useAuthApi";
import type { TranscriptionStatus } from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Session Details - Ealthiness Psychologist Portal" },
    {
      name: "description",
      content: "View therapy session details on the Ealthiness platform",
    },
  ];
}

const statusVariant = (
  status: TranscriptionStatus,
): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatStatus = (status: TranscriptionStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function PsychologistSessionDetailPage() {
  const user = useUser();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: session,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePsychologistSession(id ?? "");

  const updateNotes = useUpdateSessionNotes();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const existingNotes = session?.doctorNotes?.trim() ?? "";
  const hasNotes = existingNotes.length > 0;

  // Seed the draft from the latest server value when entering edit mode.
  useEffect(() => {
    if (isEditingNotes) {
      setNotesDraft(session?.doctorNotes ?? "");
    }
  }, [isEditingNotes, session?.doctorNotes]);

  const handleSaveNotes = () => {
    if (!id) return;
    const trimmed = notesDraft.trim();
    if (!trimmed) return;
    updateNotes.mutate(
      { sessionId: id, doctorNotes: trimmed },
      {
        onSuccess: () => setIsEditingNotes(false),
      },
    );
  };

  const deleteSession = useDeleteSession();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (!id) return;
    deleteSession.mutate(id, {
      onSuccess: () => navigate("/psychologist/sessions"),
    });
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

  const sessionDateTime = session
    ? formatDateTime(session.sessionDate)
    : null;

  return (
    <RoleGuard allowedRoles={["PSYCHOLOGIST", "SUPER_ADMIN"]}>
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
              {/* Back button */}
              <button
                onClick={() => navigate("/psychologist/sessions")}
                className="flex items-center gap-2 text-sm font-semibold text-[#60646C] hover:text-[#5850DE] transition-colors mb-4"
              >
                <ArrowLeft size={16} />
                Back to Sessions
              </button>

              {/* Loading */}
              {isLoading && (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-12">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">
                      Loading session...
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {!isLoading && isError && (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <CalendarClock size={24} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                    Couldn't load session
                  </h3>
                  <p className="text-[#60646C] text-sm mb-4">
                    Something went wrong while fetching this session.
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              )}

              {/* Content */}
              {!isLoading && !isError && session && (
                <div className="space-y-6">
                  {/* Header card */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center shrink-0">
                        <CalendarClock size={26} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-2xl font-extrabold text-[#1B173A] break-words">
                            {session.title}
                          </h2>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={deleteSession.isPending}
                            className="shrink-0 flex items-center gap-1.5 text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 size={14} />
                            {deleteSession.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-[#60646C] font-medium">
                          {sessionDateTime && (
                            <span className="flex items-center gap-2">
                              <Clock size={14} className="text-[#8E8E93]" />
                              {sessionDateTime.date} · {sessionDateTime.time}
                            </span>
                          )}
                          <span className="flex items-center gap-2 uppercase">
                            <Globe size={14} className="text-[#248FEC]" />
                            {session.language}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <Badge
                            variant={statusVariant(
                              session.transcriptionStatus,
                            )}
                            className="text-xs"
                          >
                            <FileText size={12} />
                            Transcript:{" "}
                            {formatStatus(session.transcriptionStatus)}
                          </Badge>
                          <Badge
                            variant={statusVariant(session.summaryStatus)}
                            className="text-xs"
                          >
                            <Sparkles size={12} />
                            Summary: {formatStatus(session.summaryStatus)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio */}
                  {session.audio && (
                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
                          <Headphones size={18} className="text-[#5850DE]" />
                          Audio Recording
                        </h3>
                        <a
                          href={session.audio.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-semibold text-[#5850DE] hover:underline"
                        >
                          <Download size={14} />
                          Download
                        </a>
                      </div>
                      <audio
                        controls
                        src={session.audio.url}
                        className="w-full"
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <p className="text-xs text-[#8E8E93] mt-2">
                        {session.audio.name}
                      </p>
                    </div>
                  )}

                  {/* Transcript */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2 mb-4">
                      <FileText size={18} className="text-[#5850DE]" />
                      Transcript
                    </h3>
                    {session.transcript ? (
                      <p className="text-sm text-[#1B173A] leading-relaxed whitespace-pre-wrap">
                        {session.transcript}
                      </p>
                    ) : (
                      <p className="text-sm text-[#8E8E93] italic">
                        No transcript available.
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-[#5850DE]" />
                      Summary
                    </h3>
                    {session.summary ? (
                      <p className="text-sm text-[#1B173A] leading-relaxed whitespace-pre-wrap">
                        {session.summary}
                      </p>
                    ) : (
                      <p className="text-sm text-[#8E8E93] italic">
                        No summary available.
                      </p>
                    )}
                  </div>

                  {/* Doctor Notes */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
                        <NotebookPen size={18} className="text-[#5850DE]" />
                        Doctor Notes
                      </h3>
                      {!isEditingNotes && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingNotes(true)}
                          className="flex items-center gap-1.5"
                        >
                          {hasNotes ? (
                            <>
                              <Pencil size={14} />
                              Edit
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              Add Notes
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <div className="space-y-3">
                        <Textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Write your notes about this session..."
                          rows={6}
                          className="w-full"
                          disabled={updateNotes.isPending}
                        />
                        {updateNotes.isError && (
                          <p className="text-sm text-red-500 font-medium">
                            Couldn't save notes. Please try again.
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSaveNotes}
                            disabled={
                              updateNotes.isPending || !notesDraft.trim()
                            }
                            className="flex items-center gap-1.5"
                          >
                            <Save size={14} />
                            {updateNotes.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingNotes(false)}
                            disabled={updateNotes.isPending}
                            className="flex items-center gap-1.5"
                          >
                            <X size={14} />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : hasNotes ? (
                      <p className="text-sm text-[#1B173A] leading-relaxed whitespace-pre-wrap">
                        {session.doctorNotes}
                      </p>
                    ) : (
                      <p className="text-sm text-[#8E8E93] italic">
                        No notes yet. Add your notes for this session.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteSession.isPending}
        title="Delete Session"
        confirmLabel="Delete Session"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#1B173A]">
              {session?.title}
            </span>
            ? This action cannot be undone.
          </>
        }
      />
    </RoleGuard>
  );
}
