import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Users,
  AtSign,
  Mail,
  CalendarClock,
  Clock,
  Globe,
  FileText,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Tag,
} from "lucide-react";
import { Badge, Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import {
  usePsychologistPatient,
  usePatientSessions,
  usePatientRecentMood,
} from "~/hooks/useAuthApi";
import type {
  TherapySession,
  TranscriptionStatus,
  PatientMoodEntry,
} from "~/lib/auth/types";
import type { PractitionerPortal } from "~/lib/portal";

const PAGE_SIZE = 10;

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

// Mood is a 0–100 score. Map it to a visual mood band.
const getMoodDisplay = (mood: number) => {
  if (mood >= 80) {
    return {
      label: "Great",
      emoji: "😄",
      accent: "#16A34A",
      bg: "#E3F6EA",
      track: "#BBE9CB",
    };
  }
  if (mood >= 60) {
    return {
      label: "Good",
      emoji: "🙂",
      accent: "#248FEC",
      bg: "#E1F0FD",
      track: "#BBDDF8",
    };
  }
  if (mood >= 40) {
    return {
      label: "Okay",
      emoji: "😐",
      accent: "#EAB308",
      bg: "#FEF6DC",
      track: "#F6E4A6",
    };
  }
  if (mood >= 20) {
    return {
      label: "Low",
      emoji: "🙁",
      accent: "#EA580C",
      bg: "#FDEDE3",
      track: "#F8CFB4",
    };
  }
  return {
    label: "Very low",
    emoji: "😢",
    accent: "#DC2626",
    bg: "#FDE7E7",
    track: "#F6BCBC",
  };
};

const formatTag = (tag: string) =>
  tag
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function PractitionerPatientDetailPage({
  portal,
}: {
  portal: PractitionerPortal;
}) {
  const user = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const patientId = id ?? "";

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const {
    data: patient,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePsychologistPatient(patientId);

  const {
    data: sessionsResponse,
    isLoading: sessionsLoading,
    isError: sessionsError,
    isFetching: sessionsFetching,
    refetch: refetchSessions,
  } = usePatientSessions(portal.apiRole, patientId, {
    page,
    limit: PAGE_SIZE,
    order,
  });

  const {
    data: recentMood,
    isLoading: moodLoading,
    isError: moodError,
  } = usePatientRecentMood(portal.apiRole, patientId);

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

  const fullName = patient
    ? `${patient.firstName} ${patient.lastName}`.trim()
    : "";

  const sessions = sessionsResponse?.results ?? [];
  const total = sessionsResponse?.total ?? 0;
  const pages = sessionsResponse?.pages ?? 1;

  const handleOrderToggle = () => {
    setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  return (
    <RoleGuard allowedRoles={portal.allowedRoles}>
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
                onClick={() => navigate(`${portal.basePath}/patients`)}
                className="flex items-center gap-2 text-sm font-semibold text-[#60646C] hover:text-[#5850DE] transition-colors mb-4"
              >
                <ArrowLeft size={16} />
                Back to Patients
              </button>

              {/* Loading */}
              {isLoading && (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-12">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">
                      Loading patient...
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {!isLoading && isError && (
                <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                    Couldn't load patient
                  </h3>
                  <p className="text-[#60646C] text-sm mb-4">
                    Something went wrong while fetching this patient.
                  </p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              )}

              {/* Content */}
              {!isLoading && !isError && patient && (
                <div className="space-y-6">
                  {/* Header card */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center text-2xl font-bold shrink-0">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-2xl font-extrabold text-[#1B173A] break-words">
                          {fullName || "—"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-[#60646C]">
                          <AtSign size={14} className="text-[#8E8E93]" />
                          {patient.username}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent mood */}
                  <RecentMoodCard
                    mood={recentMood}
                    isLoading={moodLoading}
                    isError={moodError}
                  />

                  {/* Details */}
                  <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#1B173A] mb-4">
                      Contact Information
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <dt className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest mb-1">
                          First Name
                        </dt>
                        <dd className="text-sm font-medium text-[#1B173A]">
                          {patient.firstName || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest mb-1">
                          Last Name
                        </dt>
                        <dd className="text-sm font-medium text-[#1B173A]">
                          {patient.lastName || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest mb-1">
                          Username
                        </dt>
                        <dd className="text-sm font-medium text-[#1B173A]">
                          {patient.username || "—"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest mb-1">
                          Email{patient.email.length > 1 ? "s" : ""}
                        </dt>
                        <dd className="flex flex-col gap-1.5">
                          {patient.email.length > 0 ? (
                            patient.email.map((email) => (
                              <a
                                key={email}
                                href={`mailto:${email}`}
                                className="flex items-center gap-2 text-sm font-medium text-[#5850DE] hover:underline"
                              >
                                <Mail size={14} className="text-[#8E8E93]" />
                                {email}
                              </a>
                            ))
                          ) : (
                            <span className="text-sm text-[#8E8E93] italic">
                              No email on file.
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
                        <CalendarClock size={18} className="text-[#5850DE]" />
                        Sessions
                        <span className="text-sm font-medium text-[#8E8E93]">
                          ({total})
                        </span>
                      </h3>

                      <button
                        onClick={handleOrderToggle}
                        className="flex items-center gap-2 px-4 py-2 border border-[#E0E1E6] rounded-xl text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:text-[#5850DE] hover:bg-[#F0F0F3] transition-all duration-200 shadow-sm hover:shadow-md bg-white whitespace-nowrap"
                      >
                        {order === "desc" ? "↓ Newest first" : "↑ Oldest first"}
                      </button>
                    </div>

                    <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                      {/* Loading overlay */}
                      {sessionsLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-600 font-medium">
                              Loading sessions...
                            </span>
                          </div>
                        </div>
                      )}

                      <table className="w-full text-left">
                        <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                          <tr>
                            <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                              Session
                            </th>
                            <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                              Date &amp; Time
                            </th>
                            <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                              Language
                            </th>
                            <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                              Transcript
                            </th>
                            <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                              Summary
                            </th>
                            <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E1E6]">
                          {sessions.map((session: TherapySession) => {
                            const { date, time } = formatDateTime(
                              session.sessionDate,
                            );
                            return (
                              <tr
                                key={session.id}
                                className="hover:bg-gray-50 transition"
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                                      {session.title.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-[#1B173A]">
                                      {session.title}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                  <div className="flex items-center gap-2 text-[#60646C] font-medium">
                                    <Clock
                                      size={14}
                                      className="text-[#8E8E93]"
                                    />
                                    {date} · {time}
                                  </div>
                                </td>
                                <td className="p-4 hidden lg:table-cell">
                                  <div className="flex items-center gap-2 text-[#60646C] font-medium uppercase">
                                    <Globe
                                      size={14}
                                      className="text-[#248FEC]"
                                    />
                                    {session.language}
                                  </div>
                                </td>
                                <td className="p-4 hidden lg:table-cell">
                                  <Badge
                                    variant={statusVariant(
                                      session.transcriptionStatus,
                                    )}
                                    className="text-xs"
                                  >
                                    <FileText size={12} />
                                    {formatStatus(session.transcriptionStatus)}
                                  </Badge>
                                </td>
                                <td className="p-4 hidden lg:table-cell">
                                  <Badge
                                    variant={statusVariant(
                                      session.summaryStatus,
                                    )}
                                    className="text-xs"
                                  >
                                    <Sparkles size={12} />
                                    {formatStatus(session.summaryStatus)}
                                  </Badge>
                                </td>
                                <td className="p-4 text-right">
                                  <Button
                                    variant="ghost"
                                    className="px-2"
                                    title="View Session"
                                    onClick={() =>
                                      navigate(
                                        `${portal.basePath}/sessions/${session.id}`,
                                      )
                                    }
                                  >
                                    <Eye size={18} />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {!sessionsLoading && sessionsError && (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <CalendarClock
                              size={24}
                              className="text-red-400"
                            />
                          </div>
                          <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                            Couldn't load sessions
                          </h3>
                          <p className="text-[#60646C] text-sm mb-4">
                            Something went wrong while fetching sessions.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => refetchSessions()}
                          >
                            Try again
                          </Button>
                        </div>
                      )}

                      {!sessionsLoading &&
                        !sessionsError &&
                        sessions.length === 0 && (
                          <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                              <CalendarClock
                                size={24}
                                className="text-[#8E8E93]"
                              />
                            </div>
                            <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                              No Sessions Found
                            </h3>
                            <p className="text-[#60646C] text-sm">
                              This patient doesn't have any recorded sessions
                              yet.
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                      <div className="bg-white rounded-xl border border-[#E0E1E6] p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#60646C]">
                            Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                            {Math.min(page * PAGE_SIZE, total)} of {total}{" "}
                            results
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                              }
                              disabled={page === 1 || sessionsFetching}
                              className="flex items-center gap-1"
                            >
                              <ChevronLeft size={16} />
                              Previous
                            </Button>
                            <span className="text-sm font-semibold text-[#1B173A] px-2">
                              Page {page} of {pages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPage((p) => Math.min(pages, p + 1))
                              }
                              disabled={page === pages || sessionsFetching}
                              className="flex items-center gap-1"
                            >
                              Next
                              <ChevronRight size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function RecentMoodCard({
  mood,
  isLoading,
  isError,
}: {
  mood: PatientMoodEntry | null | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-sm">Loading recent mood...</span>
        </div>
      </div>
    );
  }

  // A missing recent mood is an expected state (e.g. 404) — show a soft empty state.
  if (isError || !mood) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2 mb-1">
          <HeartPulse size={18} className="text-[#5850DE]" />
          Recent Mood
        </h3>
        <p className="text-sm text-[#8E8E93] italic">
          No mood entries recorded yet.
        </p>
      </div>
    );
  }

  const display = getMoodDisplay(mood.mood);
  const { date, time } = formatDateTime(mood.createdAt);
  const tags = [
    ...(Array.isArray(mood.tags) ? mood.tags : []),
    ...(Array.isArray(mood.specificMoodTags) ? mood.specificMoodTags : []),
  ];

  return (
    <div
      className="rounded-[24px] border shadow-sm p-6 overflow-hidden"
      style={{ backgroundColor: display.bg, borderColor: display.track }}
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
          <HeartPulse size={18} style={{ color: display.accent }} />
          Recent Mood
        </h3>
        <span className="text-xs font-semibold text-[#60646C] flex items-center gap-1">
          <Clock size={12} className="text-[#8E8E93]" />
          {date} · {time}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div
          className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-4xl shrink-0 shadow-sm"
          aria-hidden
        >
          {display.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-extrabold"
              style={{ color: display.accent }}
            >
              {mood.mood}
            </span>
            <span className="text-sm font-medium text-[#60646C]">/ 100</span>
            <span
              className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: display.accent }}
            >
              {display.label}
            </span>
          </div>

          {/* Mood meter */}
          <div
            className="mt-3 h-2.5 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: display.track }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(0, Math.min(100, mood.mood))}%`,
                backgroundColor: display.accent,
              }}
            />
          </div>
        </div>
      </div>

      {mood.description && (
        <p className="mt-5 text-sm font-medium text-[#1B173A] bg-white/70 rounded-xl p-4 leading-relaxed">
          "{mood.description}"
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-[#60646C] border"
              style={{ borderColor: display.track }}
            >
              <Tag size={11} style={{ color: display.accent }} />
              {formatTag(tag)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
