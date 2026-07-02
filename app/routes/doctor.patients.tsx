import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/doctor.patients";
import { Users, AtSign, Search } from "lucide-react";
import { Input } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import type { ApiPatient } from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patients - Ealthiness Doctor Portal" },
    {
      name: "description",
      content: "Manage your patients on the Ealthiness platform",
    },
  ];
}

// TODO: Replace with real doctor patients API once available.
const DUMMY_PATIENTS: ApiPatient[] = [
  {
    id: "pat-1",
    username: "j.doe",
    firstName: "John",
    lastName: "Doe",
    email: ["john.doe@example.com"],
  },
  {
    id: "pat-2",
    username: "m.smith",
    firstName: "Mary",
    lastName: "Smith",
    email: ["mary.smith@example.com"],
  },
  {
    id: "pat-3",
    username: "a.khan",
    firstName: "Ahmed",
    lastName: "Khan",
    email: ["ahmed.khan@example.com"],
  },
  {
    id: "pat-4",
    username: "l.garcia",
    firstName: "Lucia",
    lastName: "Garcia",
    email: ["lucia.garcia@example.com"],
  },
  {
    id: "pat-5",
    username: "t.nguyen",
    firstName: "Thu",
    lastName: "Nguyen",
    email: ["thu.nguyen@example.com"],
  },
];

export default function DoctorPatientsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to mirror the server-side pattern.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const visiblePatients = useMemo(() => {
    if (!debouncedSearchTerm) return DUMMY_PATIENTS;
    return DUMMY_PATIENTS.filter((patient) => {
      const haystack =
        `${patient.firstName} ${patient.lastName} ${patient.username} ${patient.email.join(" ")}`.toLowerCase();
      return haystack.includes(debouncedSearchTerm);
    });
  }, [debouncedSearchTerm]);

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

  const total = visiblePatients.length;

  return (
    <RoleGuard allowedRoles={["DOCTOR", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col">
          <Navbar user={user} onLogout={() => navigate("/")} />

          <div className="flex-1 p-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  Patients
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  {total} patient{total === 1 ? "" : "s"} total
                </p>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl border border-[#E0E1E6] p-4 mb-6 shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]"
                  />
                  <Input
                    type="text"
                    placeholder="Search by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                        Patient
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Username
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {visiblePatients.map((patient) => {
                      const fullName =
                        `${patient.firstName} ${patient.lastName}`.trim();
                      const primaryEmail = patient.email[0] ?? "—";
                      return (
                        <tr
                          key={patient.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                                {fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#1B173A] leading-tight block">
                                  {fullName}
                                </span>
                                <span className="text-xs text-[#8E8E93] font-medium md:hidden">
                                  {primaryEmail}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 font-medium text-[#60646C]">
                              <AtSign size={14} className="text-[#8E8E93]" />
                              {patient.username}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-[#60646C] hidden lg:table-cell">
                            {primaryEmail}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {visiblePatients.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Patients Found
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      {searchTerm
                        ? "Try adjusting your search."
                        : "You don't have any patients yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
