import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, AtSign, Search, Eye } from "lucide-react";
import { Input, Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { usePsychologistPatients } from "~/hooks/useAuthApi";
import type { ApiPatient, PatientScope } from "~/lib/auth/types";
import type { PractitionerPortal } from "~/lib/portal";

const PAGE_LIMIT = 1000;

const SCOPE_FILTERS: { value: PatientScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "direct", label: "Direct" },
  { value: "company", label: "Company" },
];

export default function PractitionerPatientsPage({
  portal,
}: {
  portal: PractitionerPortal;
}) {
  const user = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [scope, setScope] = useState<PatientScope>("all");

  // Debounce search term to avoid firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: patientsResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = usePsychologistPatients({
    page: 1,
    limit: PAGE_LIMIT,
    scope,
    search: debouncedSearchTerm || undefined,
  });

  // Search and scope are both handled server-side.
  const visiblePatients = patientsResponse?.results ?? [];

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

  const total = patientsResponse?.total ?? 0;

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
                    <Users size={20} />
                  </div>
                  Patients
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  {total} patient{total === 1 ? "" : "s"} total
                </p>
              </div>

              {/* Search and scope filters */}
              <div className="bg-white rounded-xl border border-[#E0E1E6] p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
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

                  <div className="flex items-center gap-2 flex-wrap">
                    {SCOPE_FILTERS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setScope(option.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                          scope === option.value
                            ? "bg-[#5850DE] text-white border-[#5850DE]"
                            : "bg-white text-[#60646C] border-[#E0E1E6] hover:border-[#5850DE] hover:text-[#5850DE]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        Loading patients...
                      </span>
                    </div>
                  </div>
                )}

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
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {visiblePatients.map((patient: ApiPatient) => {
                      const fullName =
                        `${patient.firstName} ${patient.lastName}`.trim();
                      const primaryEmail = patient.email[0] ?? "—";
                      return (
                        <tr
                          key={patient.id}
                          onClick={() =>
                            navigate(`${portal.basePath}/patients/${patient.id}`)
                          }
                          className="hover:bg-gray-50 transition cursor-pointer"
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
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              className="px-2"
                              title="View Patient"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `${portal.basePath}/patients/${patient.id}`,
                                );
                              }}
                            >
                              <Eye size={18} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!isLoading && isError && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      Couldn't load patients
                    </h3>
                    <p className="text-[#60646C] text-sm mb-4">
                      Something went wrong while fetching your patients.
                    </p>
                    <Button variant="outline" onClick={() => refetch()}>
                      Try again
                    </Button>
                  </div>
                )}

                {!isLoading && !isError && visiblePatients.length === 0 && (
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
                        : "You don't have any patients in this scope yet."}
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
