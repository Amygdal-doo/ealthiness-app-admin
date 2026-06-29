import React, { useEffect, useRef, useState } from "react";
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
  Volume2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ClipboardList,
  Target,
  ListChecks,
  CalendarRange,
  User,
  AtSign,
  Mail,
} from "lucide-react";
import { Badge, Button } from "~/components/ui";
import TherapyPlanForm from "~/components/forms/TherapyPlanForm";
import TherapyPlanItems from "~/components/therapy/TherapyPlanItems";
import AppSidebar from "~/components/shared/AppSidebar";
import TiptapEditor from "~/components/shared/TiptapEditor";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { useUser } from "~/hooks/useAuth";
import {
  usePsychologistSession,
  useUpdateSessionNotes,
  useDeleteSession,
  useGenerateSummaryAudio,
  useTherapyPlan,
  useDeleteTherapyPlan,
} from "~/hooks/useAuthApi";
import type {
  TranscriptionStatus,
  TherapyPlan,
  TherapyPlanStatus,
  SessionClient,
} from "~/lib/auth/types";
import { TtsGrokVoice } from "~/lib/auth/types";

const VOICE_OPTIONS: { value: TtsGrokVoice; label: string }[] = [
  { value: TtsGrokVoice.EVE, label: "Eve" },
  { value: TtsGrokVoice.ARA, label: "Ara" },
  { value: TtsGrokVoice.REX, label: "Rex" },
  { value: TtsGrokVoice.SAL, label: "Sal" },
  { value: TtsGrokVoice.LEO, label: "Leo" },
];

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const PLAN_STATUS_STYLE: Record<
  TherapyPlanStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-[#F0F0F3] text-[#60646C]" },
  active: { label: "Active", className: "bg-[#E6F6EC] text-[#1A7F45]" },
  completed: { label: "Completed", className: "bg-[#E8E6FC] text-[#5850DE]" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-500" },
};

function TherapyPlanCard({
  plan,
  isLoading,
  isError,
  onRetry,
  onDelete,
  isDeleting,
}: {
  plan: TherapyPlan | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 size={18} className="animate-spin text-[#5850DE]" />
          <span className="font-medium text-sm">Loading therapy plan...</span>
        </div>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
            <ClipboardList size={18} className="text-[#5850DE]" />
            Therapy Plan
          </h3>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
        <p className="text-sm text-[#8E8E93] italic mt-2">
          Couldn't load the therapy plan for this session.
        </p>
      </div>
    );
  }

  const status = PLAN_STATUS_STYLE[plan.status] ?? {
    label: plan.status,
    className: "bg-[#F0F0F3] text-[#60646C]",
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
          <ClipboardList size={18} className="text-[#5850DE]" />
          Therapy Plan
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${status.className}`}
          >
            {status.label}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <h4 className="text-xl font-extrabold text-[#1B173A] break-words">
        {plan.title}
      </h4>

      <div className="flex items-center gap-2 mt-3 text-sm text-[#60646C] font-medium">
        <CalendarRange size={15} className="text-[#8E8E93]" />
        {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div className="rounded-2xl bg-[#F8F9FB] border border-[#E0E1E6] p-4">
          <p className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2 mb-1.5">
            <Target size={13} />
            Reason
          </p>
          <p className="text-sm text-[#1B173A] leading-relaxed whitespace-pre-wrap">
            {plan.reason}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F8F9FB] border border-[#E0E1E6] p-4">
          <p className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2 mb-1.5">
            <ListChecks size={13} />
            General Instructions
          </p>
          <p className="text-sm text-[#1B173A] leading-relaxed whitespace-pre-wrap">
            {plan.generalInstructions}
          </p>
        </div>
      </div>

      {/* Items live in the same section, below a divider */}
      <div className="mt-6 pt-6 border-t border-[#E0E1E6]">
        <TherapyPlanItems planId={plan.id} />
      </div>
    </div>
  );
}

// Doctor notes are stored as rich-text HTML. Strip tags to tell whether there
// is any actual content (an "empty" editor still yields "<p></p>").
const htmlToText = (html: string): string =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

// Strip markdown / HTML artifacts so the summary reads as clean plain text.
const cleanSummaryText = (text: string): string =>
  text
    // remove HTML / XML-like tags: <b>, </p>, <br/>, etc.
    .replace(/<\/?[^>]*>/g, "")
    // unwrap markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // drop markdown emphasis/heading/quote/code markers: ** __ * _ # > ` ~
    .replace(/[*_`~#>]+/g, "")
    // normalize bullet markers at the start of a line to "• "
    .replace(/^[ \t]*[-•]\s+/gm, "• ")
    // collapse stray repeated punctuation like ",.." or "..." -> "."
    .replace(/[,.]{2,}/g, ".")
    // collapse leftover multiple spaces
    .replace(/[ \t]{2,}/g, " ")
    // trim trailing spaces on each line
    .replace(/[ \t]+$/gm, "")
    .trim();

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

  // Accordion: transcript and summary sections are collapsed until their
  // button is clicked.
  const [openTranscript, setOpenTranscript] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);

  const updateNotes = useUpdateSessionNotes();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const existingNotes = session?.doctorNotes ?? "";
  const hasNotes = htmlToText(existingNotes).length > 0;

  // Seed the draft from the latest server value when entering edit mode.
  useEffect(() => {
    if (isEditingNotes) {
      setNotesDraft(session?.doctorNotes ?? "");
    }
  }, [isEditingNotes, session?.doctorNotes]);

  const handleSaveNotes = () => {
    if (!id) return;
    if (!htmlToText(notesDraft)) return;
    updateNotes.mutate(
      { sessionId: id, doctorNotes: notesDraft },
      {
        onSuccess: () => setIsEditingNotes(false),
      },
    );
  };

  const generateSummaryAudio = useGenerateSummaryAudio();
  const [selectedVoice, setSelectedVoice] = useState<TtsGrokVoice>(
    TtsGrokVoice.ARA,
  );

  const summaryAudioStatus = session?.summaryAudioStatus;
  // "pending" is the default state before audio has ever been requested, so only
  // an in-flight request or "processing" counts as actively generating.
  const isGeneratingAudio =
    generateSummaryAudio.isPending || summaryAudioStatus === "processing";

  // Audio generation runs asynchronously on the backend (~60s). After kicking it
  // off we re-fetch the session once after a minute to pick up the new audio.
  const audioRefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (audioRefetchTimeoutRef.current) {
        clearTimeout(audioRefetchTimeoutRef.current);
      }
    };
  }, []);

  const handleGenerateSummaryAudio = () => {
    if (!id) return;
    generateSummaryAudio.mutate(
      {
        sessionId: id,
        voice: selectedVoice,
        // Force regeneration only when an audio already exists.
        force: Boolean(session?.summaryAudio?.url),
      },
      {
        onSuccess: () => {
          if (audioRefetchTimeoutRef.current) {
            clearTimeout(audioRefetchTimeoutRef.current);
          }
          audioRefetchTimeoutRef.current = setTimeout(() => {
            refetch();
          }, 60000);
        },
      },
    );
  };

  const deleteSession = useDeleteSession();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isTherapyPlanOpen, setIsTherapyPlanOpen] = useState(false);

  const deleteTherapyPlan = useDeleteTherapyPlan();
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);
  // Remember which plan was just deleted so we stop fetching it while the
  // session refetches and its `therapyPlan` reference clears.
  const [deletedPlanId, setDeletedPlanId] = useState<string | null>(null);

  // Treat the plan as gone the moment it's deleted, even before the session
  // refetch lands — this keeps us from calling the plan GET on a deleted id.
  const planId =
    session?.therapyPlan && session.therapyPlan !== deletedPlanId
      ? session.therapyPlan
      : "";

  const {
    data: therapyPlan,
    isLoading: isPlanLoading,
    isError: isPlanError,
    refetch: refetchPlan,
  } = useTherapyPlan(planId);

  const handleConfirmDelete = () => {
    if (!id) return;
    deleteSession.mutate(id, {
      onSuccess: () => navigate("/psychologist/sessions"),
    });
  };

  const handleConfirmDeletePlan = () => {
    if (!session?.therapyPlan) return;
    const targetPlanId = session.therapyPlan;
    deleteTherapyPlan.mutate(targetPlanId, {
      onSuccess: () => {
        setDeletedPlanId(targetPlanId);
        setIsDeletePlanModalOpen(false);
        // Refresh the session so its `therapyPlan` reference clears.
        refetch();
      },
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

  const sessionDateTime = session ? formatDateTime(session.sessionDate) : null;

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
                          <div className="flex items-center gap-2 shrink-0">
                            {!planId && (
                              <Button
                                size="sm"
                                onClick={() => setIsTherapyPlanOpen(true)}
                                className="flex items-center gap-1.5"
                              >
                                <ClipboardList size={14} />
                                Create Plan
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDeleteModalOpen(true)}
                              disabled={deleteSession.isPending}
                              className="flex items-center gap-1.5 text-red-500 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 size={14} />
                              {deleteSession.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
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
                            variant={statusVariant(session.transcriptionStatus)}
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

                        {/* Patient details */}
                        <div className="mt-5 pt-5 border-t border-[#E0E1E6]">
                          <p className="text-xs font-bold text-[#8E8E93] uppercase flex items-center gap-2 mb-2.5">
                            <User size={13} />
                            Patient Details
                          </p>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#60646C] font-medium">
                            <span className="flex items-center gap-1.5 text-[#1B173A] font-bold">
                              {session.client.firstName}{" "}
                              {session.client.lastName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <AtSign size={14} className="text-[#8E8E93]" />
                              {session.client.username}
                            </span>
                            {session.client.email.map((email) => (
                              <a
                                key={email}
                                href={`mailto:${email}`}
                                className="flex items-center gap-1.5 hover:text-[#5850DE] transition-colors"
                              >
                                <Mail size={14} className="text-[#8E8E93]" />
                                {email}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Therapy Plan (with its items) */}
                  {planId && (
                    <TherapyPlanCard
                      plan={therapyPlan}
                      isLoading={isPlanLoading}
                      isError={isPlanError}
                      onRetry={() => refetchPlan()}
                      onDelete={() => setIsDeletePlanModalOpen(true)}
                      isDeleting={deleteTherapyPlan.isPending}
                    />
                  )}

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
                        <TiptapEditor
                          value={notesDraft}
                          onChange={setNotesDraft}
                          editable={!updateNotes.isPending}
                          placeholder="Write your notes about this session..."
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
                              updateNotes.isPending || !htmlToText(notesDraft)
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
                      <div
                        className="rich-text text-sm text-[#1B173A] leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: session.doctorNotes ?? "",
                        }}
                      />
                    ) : (
                      <p className="text-sm text-[#8E8E93] italic">
                        No notes yet. Add your notes for this session.
                      </p>
                    )}
                  </div>

                  {/* Transcript & Summary toggle buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setOpenTranscript((v) => !v)}
                      aria-expanded={openTranscript}
                      className={`flex items-center justify-between gap-3 rounded-[20px] border p-5 text-left transition-all shadow-sm ${
                        openTranscript
                          ? "bg-[#E8E6FC] border-[#5850DE]"
                          : "bg-white border-[#E0E1E6] hover:border-[#5850DE]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-[#E1F0FD] text-[#248FEC] flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </span>
                        <span>
                          <span className="block text-base font-bold text-[#1B173A]">
                            View Transcript
                          </span>
                          <span className="block text-xs font-medium text-[#8E8E93]">
                            {formatStatus(session.transcriptionStatus)}
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-[#5850DE] transition-transform duration-200 shrink-0 ${
                          openTranscript ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenSummary((v) => !v)}
                      aria-expanded={openSummary}
                      className={`flex items-center justify-between gap-3 rounded-[20px] border p-5 text-left transition-all shadow-sm ${
                        openSummary
                          ? "bg-[#E8E6FC] border-[#5850DE]"
                          : "bg-white border-[#E0E1E6] hover:border-[#5850DE]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-[#F0E9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                          <Sparkles size={18} />
                        </span>
                        <span>
                          <span className="block text-base font-bold text-[#1B173A]">
                            View Summary
                          </span>
                          <span className="block text-xs font-medium text-[#8E8E93]">
                            {formatStatus(session.summaryStatus)}
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-[#5850DE] transition-transform duration-200 shrink-0 ${
                          openSummary ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Transcript panel */}
                  {openTranscript && (
                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  )}

                  {/* Summary panel */}
                  {openSummary && (
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-[#5850DE]" />
                      Summary
                    </h3>
                    {session.summary ? (
                      <p
                        className="text-sm text-[#1B173A] leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: session.summary.replace(
                            /\*\*(.+?)\*\*/g,
                            "<strong>$1</strong>",
                          ),
                        }}
                      />
                    ) : (
                      <p className="text-sm text-[#8E8E93] italic">
                        No summary available.
                      </p>
                    )}

                    {/* Summary Audio */}
                    {session.summaryStatus === "completed" && (
                      <div className="mt-6 pt-6 border-t border-[#E0E1E6]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold text-[#1B173A] flex items-center gap-2">
                            <Volume2 size={16} className="text-[#5850DE]" />
                            Summary Audio
                          </h4>
                          {session.summaryAudio?.url && (
                            <a
                              href={session.summaryAudio.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-semibold text-[#5850DE] hover:underline"
                            >
                              <Download size={14} />
                              Download
                            </a>
                          )}
                        </div>

                        {/* Existing audio player */}
                        {session.summaryAudio?.url && (
                          <audio
                            controls
                            src={session.summaryAudio.url}
                            className="w-full mb-2"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        )}

                        {/* Last generated timestamp */}
                        {session.summaryAudioUpdatedAt && (
                          <p className="text-xs text-[#8E8E93] mb-4">
                            Last generated:{" "}
                            {formatDateTime(session.summaryAudioUpdatedAt).date}{" "}
                            ·{" "}
                            {formatDateTime(session.summaryAudioUpdatedAt).time}
                          </p>
                        )}

                        {/* Voice selection */}
                        <p className="text-xs font-semibold text-[#60646C] mb-2">
                          Select a voice
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {VOICE_OPTIONS.map((voice) => {
                            const isActive = selectedVoice === voice.value;
                            return (
                              <button
                                key={voice.value}
                                type="button"
                                onClick={() => setSelectedVoice(voice.value)}
                                disabled={isGeneratingAudio}
                                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isActive
                                    ? "bg-[#5850DE] text-white border-[#5850DE]"
                                    : "bg-white text-[#60646C] border-[#E0E1E6] hover:border-[#5850DE] hover:text-[#5850DE]"
                                }`}
                              >
                                {voice.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Button
                            onClick={handleGenerateSummaryAudio}
                            disabled={isGeneratingAudio}
                            className="flex items-center gap-1.5"
                          >
                            {isGeneratingAudio ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Volume2 size={14} />
                                {session.summaryAudio?.url
                                  ? "Regenerate Audio"
                                  : "Generate Summary Audio"}
                              </>
                            )}
                          </Button>

                          {summaryAudioStatus === "processing" && (
                            <span className="text-xs text-[#60646C] font-medium">
                              Audio is being generated, this may take a
                              moment...
                            </span>
                          )}
                        </div>

                        {(generateSummaryAudio.isError ||
                          summaryAudioStatus === "failed" ||
                          session.summaryAudioError) && (
                          <p className="mt-3 text-sm text-red-500 font-medium flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            {session.summaryAudioError ||
                              "Couldn't generate summary audio. Please try again."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Therapy plan creation modal */}
      {isTherapyPlanOpen && session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <TherapyPlanForm
            patientId={session.client.id}
            sessionId={session.id}
            onCancel={() => setIsTherapyPlanOpen(false)}
            onSuccess={() => setIsTherapyPlanOpen(false)}
          />
        </div>
      )}

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

      <ConfirmDeleteModal
        isOpen={isDeletePlanModalOpen}
        onClose={() => setIsDeletePlanModalOpen(false)}
        onConfirm={handleConfirmDeletePlan}
        isDeleting={deleteTherapyPlan.isPending}
        title="Delete Therapy Plan"
        confirmLabel="Delete Plan"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#1B173A]">
              {therapyPlan?.title ?? "this therapy plan"}
            </span>
            ? Its items will be removed too. This action cannot be undone.
          </>
        }
      />
    </RoleGuard>
  );
}
