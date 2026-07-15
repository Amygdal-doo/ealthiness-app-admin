import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/coach.$id";
import {
  ArrowLeft,
  Dumbbell,
  Mail,
  Globe,
  Star,
  MessageSquare,
  Users,
  UsersRound,
  BadgeDollarSign,
  Award,
  Target,
  FileText,
  Trash2,
  Building2,
} from "lucide-react";
import { Card, Button, Badge } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { ConnectCoachCompanyModal } from "~/components/modals/ConnectCoachCompanyModal";
import { useUser } from "~/hooks/useAuth";
import { useCoachDetails, useRemoveCoachRole } from "~/hooks/useAuthApi";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coach Details - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "View coach details on the Ealthiness platform",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return { coachId: params.id };
}

export default function CoachDetailPage({ loaderData }: Route.ComponentProps) {
  const params = useParams();
  const coachId = loaderData.coachId || params.id || "";

  const user = useUser();
  const navigate = useNavigate();

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isConnectCompanyOpen, setIsConnectCompanyOpen] = useState(false);

  const removeCoachRoleMutation = useRemoveCoachRole();

  const {
    data: coach,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useCoachDetails(coachId, {
    // Stop fetching once the coach role is being (or has been) removed, so the
    // cache removal in useRemoveCoachRole doesn't trigger a refetch of the
    // removed coach before we navigate away.
    enabled:
      !removeCoachRoleMutation.isPending && !removeCoachRoleMutation.isSuccess,
  });

  const handleConfirmRemove = () => {
    removeCoachRoleMutation.mutate(coachId, {
      onSuccess: () => {
        setIsRemoveModalOpen(false);
        navigate("/coaches");
      },
    });
  };

  const isRemoving =
    removeCoachRoleMutation.isPending || removeCoachRoleMutation.isSuccess;

  if (!user || isLoading || (isRemoving && !coach)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">
            {!user ? "Loading..." : "Loading coach details..."}
          </span>
        </div>
      </div>
    );
  }

  if (isError || !coach) {
    return (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
          <AppSidebar user={user} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Coach Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The coach you're looking for could not be found.
              </p>
              <Link to="/coaches" className="text-blue-500 hover:underline">
                Back to Coaches
              </Link>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const price = `${coach.price.toFixed(2)} ${coach.currency.toUpperCase()}`;
  const companyEngagements = coach.companyEngagements ?? [];

  const formatBillingInterval = (interval: string) =>
    interval
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-12">
              <Link
                to="/coaches"
                className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
              >
                <ArrowLeft size={18} />
                Back to Coaches
              </Link>

              {/* Hero banner */}
              <div className="bg-[#1B173A] rounded-[32px] p-8 text-white shadow-2xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 border border-[#38383A]">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#5850DE]/40 to-transparent"></div>

                <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] flex items-center justify-center shadow-[0_0_40px_rgba(88,80,222,0.5)] border-4 border-[#1B173A]">
                  <Dumbbell size={48} />
                </div>

                <div className="relative z-10 text-center md:text-left flex-1">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h2 className="text-4xl font-extrabold">
                      {coach.firstName} {coach.lastName}
                    </h2>
                    <button
                      onClick={() => setIsRemoveModalOpen(true)}
                      className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                      title="Remove coach role"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-[#8E8E93] font-medium mb-6 text-lg">
                    @{coach.username} • {coach.country?.name ?? "—"}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Rating
                      </p>
                      <p className="font-bold text-xl flex items-center gap-1">
                        <Star size={16} className="text-[#FFB900]" />
                        {coach.rating}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Reviews
                      </p>
                      <p className="font-bold text-xl">{coach.reviews}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Price
                      </p>
                      <p className="font-bold text-xl">{price}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Trainees
                      </p>
                      <p className="font-bold text-xl">{coach.traineesCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Groups
                      </p>
                      <p className="font-bold text-xl">{coach.groupsCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact information */}
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-extrabold text-[#1B173A] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      Contact Information
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConnectCompanyOpen(true)}
                    >
                      <Building2 size={16} className="mr-2" />
                      Connect to Company
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <Mail className="text-[#5850DE]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Email
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">
                        {coach.email[0] ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <Globe className="text-[#4DAB46]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Country
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">
                        {coach.country?.name ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <BadgeDollarSign className="text-[#FFB900]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Price
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">{price}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <Users className="text-[#5850DE]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Trainees
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">
                        {coach.traineesCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <UsersRound className="text-[#248FEC]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Groups
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">
                        {coach.groupsCount}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Coach profile */}
                <Card className="p-8">
                  <h3 className="text-xl font-extrabold text-[#1B173A] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E5F6E4] text-[#4DAB46] flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    Coach Profile
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <Award className="text-[#FFB900]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Years of Experience
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">
                        {coach.coachInfo?.yearsOfexperience ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3">
                        <Users className="text-[#5850DE]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Predicted Users
                        </span>
                      </div>
                      <span className="font-bold text-[#1B173A]">
                        {coach.coachInfo?.predictedNumberOfUsers ?? "—"}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-[#248FEC]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Short Bio
                        </span>
                      </div>
                      <p className="text-sm text-[#60646C] leading-relaxed">
                        {coach.coachInfo?.shortBio || "No bio provided yet."}
                      </p>
                    </div>

                    <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="text-[#4DAB46]" size={20} />
                        <span className="font-medium text-[#1B173A]">
                          Future Goals
                        </span>
                      </div>
                      <p className="text-sm text-[#60646C] leading-relaxed">
                        {coach.futureGoals || "No future goals provided yet."}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Company engagements */}
              <Card className="p-8 mt-8">
                <h3 className="text-xl font-extrabold text-[#1B173A] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  Company Engagements
                  <span className="text-sm font-semibold text-[#8E8E93]">
                    ({companyEngagements.length})
                  </span>
                </h3>

                {companyEngagements.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <Building2 size={24} className="text-[#8E8E93]" />
                    </div>
                    <h4 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Company Engagements
                    </h4>
                    <p className="text-[#60646C] text-sm">
                      This coach is not connected to any company yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companyEngagements.map((engagement) => (
                      <div
                        key={engagement.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {engagement.company.logo?.url ? (
                            <img
                              src={engagement.company.logo.url}
                              alt={engagement.company.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                              {engagement.company.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-[#1B173A] leading-tight block truncate">
                              {engagement.company.name}
                            </span>
                            <span className="text-xs text-[#8E8E93] font-medium truncate block">
                              {engagement.company.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                          <div>
                            <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                              Price
                            </p>
                            <p className="font-bold text-sm text-[#1B173A]">
                              {engagement.price.toFixed(2)}{" "}
                              {engagement.currency.toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                              Billing
                            </p>
                            <p className="font-bold text-sm text-[#1B173A]">
                              {formatBillingInterval(engagement.billingInterval)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                              Accepted
                            </p>
                            <p className="font-bold text-sm text-[#1B173A]">
                              {engagement.acceptedAt
                                ? new Date(
                                    engagement.acceptedAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              engagement.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs capitalize"
                          >
                            {engagement.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ConnectCoachCompanyModal
        isOpen={isConnectCompanyOpen}
        onClose={() => setIsConnectCompanyOpen(false)}
        coachId={coachId}
        coachName={`${coach.firstName} ${coach.lastName}`}
      />

      <ConfirmDeleteModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
        isDeleting={removeCoachRoleMutation.isPending}
        title="Remove Coach"
        confirmLabel="Remove Coach"
        description={
          <>
            Are you sure you want to remove the coach role from{" "}
            <span className="font-semibold text-[#1B173A]">
              {coach.firstName} {coach.lastName}
            </span>
            ? They will no longer appear in the coaches list.
          </>
        }
      />
    </RoleGuard>
  );
}
