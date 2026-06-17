import React from "react";
import { useNavigate, Link } from "react-router";
import type { Route } from "./+types/psychologist";
import {
  Brain,
  Users,
  CalendarClock,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Overview - Ealthiness Psychologist Portal" },
    {
      name: "description",
      content: "Your psychology practice overview on the Ealthiness platform",
    },
  ];
}

// TODO: Replace with real psychologist dashboard API once available.
const STATS = [
  {
    id: "patients",
    label: "Active Patients",
    value: "18",
    icon: Users,
    accent: "text-[#5850DE]",
    bg: "bg-[#E8E6FC]",
  },
  {
    id: "sessions-week",
    label: "Sessions This Week",
    value: "12",
    icon: CalendarClock,
    accent: "text-[#248FEC]",
    bg: "bg-[#E1F0FD]",
  },
  {
    id: "hours",
    label: "Hours Logged",
    value: "24h",
    icon: Clock,
    accent: "text-[#16A34A]",
    bg: "bg-[#E3F6EA]",
  },
  {
    id: "completion",
    label: "Completion Rate",
    value: "96%",
    icon: TrendingUp,
    accent: "text-[#EA580C]",
    bg: "bg-[#FDEDE3]",
  },
];

const UPCOMING_SESSIONS = [
  {
    id: "s-1",
    patient: "Emily Carter",
    time: "Today, 14:00",
    type: "Individual · Video",
  },
  {
    id: "s-2",
    patient: "James Wilson",
    time: "Today, 15:30",
    type: "Individual · In-person",
  },
  {
    id: "s-3",
    patient: "Sofia Martinez",
    time: "Tomorrow, 10:00",
    type: "Follow-up · Video",
  },
];

export default function PsychologistOverviewPage() {
  const user = useUser();
  const navigate = useNavigate();

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
    <RoleGuard allowedRoles={["PSYCHOLOGIST", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col">
          <Navbar user={user} onLogout={() => navigate("/")} />

          <div className="flex-1 p-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <Brain size={20} />
                  </div>
                  Welcome back, {user.firstName}
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  Here's an overview of your practice today.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.id}
                      className="bg-white rounded-2xl border border-[#E0E1E6] p-5 shadow-sm"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.accent} flex items-center justify-center mb-4`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="text-2xl font-extrabold text-[#1B173A]">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-[#60646C] mt-1">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upcoming sessions */}
              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-[#E0E1E6]">
                  <h3 className="text-lg font-bold text-[#1B173A]">
                    Upcoming Sessions
                  </h3>
                  <Link
                    to="/psychologist/sessions"
                    className="text-sm font-bold text-[#5850DE] hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-[#E0E1E6]">
                  {UPCOMING_SESSIONS.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-5 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold">
                          {session.patient.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#1B173A] leading-tight">
                            {session.patient}
                          </div>
                          <div className="text-xs text-[#8E8E93] font-medium">
                            {session.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#60646C]">
                        {session.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
