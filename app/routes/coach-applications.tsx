import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/coach-applications";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  X,
} from "lucide-react";
import { Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import {
  ReviewCoachApplicationModal,
  type CoachApplicationDecision,
} from "~/components/modals/ReviewCoachApplicationModal";
import { useUser } from "~/hooks/useAuth";
import { useCoachApplications } from "~/hooks/useAuthApi";
import { getApiErrorMessage } from "~/lib/services/api";
import type { ApiCoachApplication } from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coach Applications - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Review pending coach applications on the Ealthiness platform",
    },
  ];
}

const PAGE_SIZE = 10;

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const formatNumber = (value?: number) =>
  typeof value === "number" ? value : "—";

const thClass =
  "p-3 md:p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest";

export default function CoachApplicationsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<ApiCoachApplication | null>(null);
  const [decision, setDecision] = useState<CoachApplicationDecision | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: applicationsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCoachApplications({ page: currentPage, limit: PAGE_SIZE });

  const totalPages = applicationsResponse?.pages ?? 1;

  // After an action empties the last page, step back to a page that exists.
  useEffect(() => {
    if (applicationsResponse && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [applicationsResponse, totalPages, currentPage]);

  // Auto-hide the success banner
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const openReview = (
    application: ApiCoachApplication,
    nextDecision: CoachApplicationDecision,
  ) => {
    setSuccessMessage("");
    setSelected(application);
    setDecision(nextDecision);
  };

  const closeReview = () => {
    setSelected(null);
    setDecision(null);
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

  const applications = applicationsResponse?.results ?? [];

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex flex-col md:flex-row">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            user={user}
            onLogout={() => navigate("/")}
            onRefresh={handleRefresh}
            refreshing={refreshing || isFetching}
          />

          <div className="flex-1 p-4 md:p-6 min-w-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <ClipboardCheck size={20} />
                  </div>
                  Coach Applications
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  {applicationsResponse?.total || 0} pending applications
                  (oldest first)
                </p>
              </div>

              {successMessage && (
                <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              {isError && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    {getApiErrorMessage(
                      error,
                      "Failed to load coach applications.",
                    )}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        Loading applications...
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                      <tr>
                        <th className={thClass}>Applicant</th>
                        <th className={`${thClass} hidden md:table-cell`}>
                          Experience
                        </th>
                        <th className={`${thClass} hidden md:table-cell`}>
                          Expected Trainees
                        </th>
                        <th className={`${thClass} hidden lg:table-cell`}>Bio</th>
                        <th className={`${thClass} hidden md:table-cell`}>
                          Applied
                        </th>
                        <th className={`${thClass} text-right`}>Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E1E6]">
                      {applications.map((application) => (
                        <tr key={application._id} className="align-top">
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                                {application.firstName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#1B173A] leading-tight block">
                                  {application.firstName} {application.lastName}
                                </span>
                                <span className="text-xs text-[#8E8E93] font-medium">
                                  {application.email[0] ?? application.username}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 font-medium text-[#60646C] hidden md:table-cell">
                            {formatNumber(
                              application.coachInfo?.yearsOfexperience,
                            )}{" "}
                            yrs
                          </td>
                          <td className="p-3 md:p-4 font-medium text-[#60646C] hidden md:table-cell">
                            {formatNumber(
                              application.coachInfo?.predictedNumberOfUsers,
                            )}
                          </td>
                          <td className="p-3 md:p-4 text-sm text-[#60646C] hidden lg:table-cell max-w-sm">
                            <p className="whitespace-pre-line break-words">
                              {application.coachInfo?.shortBio?.trim() || "—"}
                            </p>
                          </td>
                          <td className="p-3 md:p-4 font-medium text-[#60646C] hidden md:table-cell whitespace-nowrap">
                            {formatDate(application.updatedAt)}
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openReview(application, "approve")}
                                className="bg-[#5850DE] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#4A42C7] transition inline-flex items-center gap-1"
                              >
                                <Check size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => openReview(application, "reject")}
                                className="bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-red-400 hover:text-red-500 transition inline-flex items-center gap-1"
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {applications.length === 0 && !isLoading && !isError && (
                  <div className="p-5 md:p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <ClipboardCheck size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Pending Applications
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      New "become a coach" requests will appear here for
                      review.
                    </p>
                  </div>
                )}
              </div>

              {applicationsResponse && totalPages > 1 && (
                <div className="bg-white rounded-xl border border-[#E0E1E6] mt-6 p-4 shadow-sm flex items-center justify-between">
                  <span className="text-sm text-[#60646C]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isFetching}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages || isFetching}
                      className="flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReviewCoachApplicationModal
        application={selected}
        decision={decision}
        onClose={closeReview}
        onSuccess={(message) => {
          closeReview();
          setSuccessMessage(message);
        }}
      />
    </RoleGuard>
  );
}
