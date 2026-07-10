import React from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/doctor";
import {
  Stethoscope,
  Users,
  CalendarClock,
  Clock,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useDoctorDashboardOverview } from "~/hooks/useAuthApi";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Overview - Ealthiness Doctor Portal" },
    {
      name: "description",
      content: "Your medical practice overview on the Ealthiness platform",
    },
  ];
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block rounded-md bg-black/10 animate-pulse ${className}`}
  />
);

export default function DoctorOverviewPage() {
  const user = useUser();
  const navigate = useNavigate();

  const {
    data: overview,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useDoctorDashboardOverview();

  const completionRate = overview?.therapyPlanCompletionRate ?? null;
  // BE returns a 0–1 ratio; render as a whole percentage.
  const completionPercent =
    completionRate === null ? null : Math.round(completionRate * 100);

  const sessionStats = [
    {
      id: "sessions-today",
      label: "Today",
      value: overview?.sessionsToday ?? 0,
      icon: Clock,
      accent: "text-[#16A34A]",
      bg: "bg-[#E3F6EA]",
    },
    {
      id: "sessions-week",
      label: "This Week",
      value: overview?.sessionsThisWeek ?? 0,
      icon: CalendarClock,
      accent: "text-[#248FEC]",
      bg: "bg-[#E1F0FD]",
    },
    {
      id: "sessions-month",
      label: "This Month",
      value: overview?.sessionsThisMonth ?? 0,
      icon: CalendarDays,
      accent: "text-[#7C3AED]",
      bg: "bg-[#F0E9FE]",
    },
  ];

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

  return (
    <RoleGuard allowedRoles={["DOCTOR", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col">
          <Navbar user={user} onLogout={() => navigate("/")} />

          <div className="flex-1 p-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <Stethoscope size={20} />
                  </div>
                  Welcome back, {user.firstName}
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  Here's an overview of your practice today.
                </p>
              </div>

              {isOverviewError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-sm font-medium text-red-500">
                  Couldn't load your practice overview. Please try refreshing.
                </div>
              )}

              {/* Featured cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Active patients */}
                <div className="relative overflow-hidden rounded-[24px] p-6 bg-gradient-to-br from-[#5850DE] to-[#8B7CF6] text-white shadow-sm">
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute -right-10 top-10 w-24 h-24 rounded-full bg-white/5" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-8">
                      <Users size={24} />
                    </div>
                    <div className="text-4xl font-extrabold leading-none">
                      {isOverviewLoading ? (
                        <Skeleton className="h-9 w-16 bg-white/30" />
                      ) : (
                        (overview?.activePatients ?? 0)
                      )}
                    </div>
                    <div className="text-sm font-medium text-white/80 mt-2">
                      Active Patients
                    </div>
                  </div>
                </div>

                {/* Therapy plan completion */}
                <div className="lg:col-span-2 rounded-[24px] p-6 bg-white border border-[#E0E1E6] shadow-sm flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#60646C] uppercase tracking-widest">
                      Therapy Plan Completion
                    </h3>
                    <div className="w-10 h-10 rounded-xl bg-[#FDEDE3] text-[#EA580C] flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                  </div>

                  <div className="mt-auto pt-8">
                    <div className="text-4xl font-extrabold text-[#1B173A] leading-none">
                      {isOverviewLoading ? (
                        <Skeleton className="h-9 w-20" />
                      ) : completionPercent === null ? (
                        <span className="text-[#8E8E93]">—</span>
                      ) : (
                        `${completionPercent}%`
                      )}
                    </div>

                    <div className="mt-4 h-2.5 w-full rounded-full bg-[#F0F0F3] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] transition-all duration-500"
                        style={{
                          width: `${completionPercent ?? 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-[#8E8E93] mt-2">
                      {completionPercent === null
                        ? "No completion data available yet."
                        : "Average completion across active therapy plans."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sessions breakdown */}
              <div className="rounded-[24px] bg-white border border-[#E0E1E6] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#E0E1E6]">
                  <h3 className="text-lg font-bold text-[#1B173A] flex items-center gap-2">
                    <CalendarClock size={18} className="text-[#5850DE]" />
                    Sessions
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E0E1E6]">
                  {sessionStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.id} className="p-6">
                        <div
                          className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.accent} flex items-center justify-center mb-4`}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="text-3xl font-extrabold text-[#1B173A] leading-none">
                          {isOverviewLoading ? (
                            <Skeleton className="h-8 w-12" />
                          ) : (
                            stat.value
                          )}
                        </div>
                        <div className="text-sm font-medium text-[#60646C] mt-1.5">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
