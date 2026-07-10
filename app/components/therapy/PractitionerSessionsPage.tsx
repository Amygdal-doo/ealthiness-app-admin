import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarClock,
  Search,
  Clock,
  Globe,
  FileText,
  Sparkles,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge, Input, Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { useUser } from "~/hooks/useAuth";
import {
  usePsychologistSessions,
  useDeleteSession,
} from "~/hooks/useAuthApi";
import type { TherapySession, TranscriptionStatus } from "~/lib/auth/types";
import type { PractitionerPortal } from "~/lib/portal";

const PAGE_SIZE = 20;

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

export default function PractitionerSessionsPage({
  portal,
}: {
  portal: PractitionerPortal;
}) {
  const user = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Debounce search term to avoid firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: sessionsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePsychologistSessions({
    page,
    limit: PAGE_SIZE,
    order,
    search: debouncedSearchTerm || undefined,
  });

  const deleteSession = useDeleteSession();
  const [sessionToDelete, setSessionToDelete] =
    useState<TherapySession | null>(null);

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return;
    deleteSession.mutate(sessionToDelete.id, {
      onSuccess: () => setSessionToDelete(null),
    });
  };

  // Search, ordering and pagination are all handled server-side.
  const visibleSessions = sessionsResponse?.results ?? [];

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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <CalendarClock size={20} />
                  </div>
                  Sessions
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  {total} session{total === 1 ? "" : "s"} recorded
                </p>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl border border-[#E0E1E6] p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="relative flex-1 w-full">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]"
                    />
                    <Input
                      type="text"
                      placeholder="Search by session title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full"
                    />
                  </div>

                  <button
                    onClick={handleOrderToggle}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[#E0E1E6] rounded-xl text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:text-[#5850DE] hover:bg-[#F0F0F3] transition-all duration-200 shadow-sm hover:shadow-md bg-white whitespace-nowrap"
                  >
                    {order === "desc" ? "↓ Newest first" : "↑ Oldest first"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                {/* Loading overlay */}
                {isLoading && (
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
                    {visibleSessions.map((session: TherapySession) => {
                      const { date, time } = formatDateTime(
                        session.sessionDate,
                      );
                      return (
                        <tr
                          key={session.id}
                          onClick={() =>
                            navigate(`${portal.basePath}/sessions/${session.id}`)
                          }
                          className="hover:bg-gray-50 transition cursor-pointer"
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
                              <Clock size={14} className="text-[#8E8E93]" />
                              {date} · {time}
                            </div>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2 text-[#60646C] font-medium uppercase">
                              <Globe size={14} className="text-[#248FEC]" />
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
                              variant={statusVariant(session.summaryStatus)}
                              className="text-xs"
                            >
                              <Sparkles size={12} />
                              {formatStatus(session.summaryStatus)}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                className="px-2"
                                title="View Session"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `${portal.basePath}/sessions/${session.id}`,
                                  );
                                }}
                              >
                                <Eye size={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                className="px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete Session"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSessionToDelete(session);
                                }}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!isLoading && isError && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <CalendarClock size={24} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      Couldn't load sessions
                    </h3>
                    <p className="text-[#60646C] text-sm mb-4">
                      Something went wrong while fetching your sessions.
                    </p>
                    <Button variant="outline" onClick={() => refetch()}>
                      Try again
                    </Button>
                  </div>
                )}

                {!isLoading && !isError && visibleSessions.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <CalendarClock size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Sessions Found
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      {searchTerm
                        ? "Try adjusting your search."
                        : "You don't have any recorded sessions yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="bg-white rounded-xl border border-[#E0E1E6] mt-6 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#60646C]">
                      Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                      {Math.min(page * PAGE_SIZE, total)} of {total} results
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isFetching}
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
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                        disabled={page === pages || isFetching}
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
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={sessionToDelete !== null}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteSession.isPending}
        title="Delete Session"
        confirmLabel="Delete Session"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#1B173A]">
              {sessionToDelete?.title}
            </span>
            ? This action cannot be undone.
          </>
        }
      />
    </RoleGuard>
  );
}
