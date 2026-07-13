import React, { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/hospitals";
import {
  Hospital,
  MapPin,
  Mail,
  Stethoscope,
  Brain,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useHospitals } from "~/hooks/useAuthApi";
import type { ApiHospital } from "~/lib/auth/types";
import { CreateHospitalModal } from "~/components/modals/CreateHospitalModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hospitals - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage hospitals across the Ealthiness platform",
    },
  ];
}

const PAGE_SIZE = 10;

export default function HospitalsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination is handled server-side.
  const {
    data: hospitalsResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useHospitals({ page: currentPage, limit: PAGE_SIZE });

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

  const visibleHospitals = hospitalsResponse?.results ?? [];
  const total = hospitalsResponse?.total ?? 0;
  const pages = hospitalsResponse?.pages ?? 1;

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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                      <Hospital size={20} />
                    </div>
                    Hospitals
                  </h2>
                  <p className="text-[#60646C] text-sm font-medium mt-1">
                    Total {total} hospital{total === 1 ? "" : "s"} found (
                    {visibleHospitals.length} on this page)
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create Hospital
                </Button>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        Loading hospitals...
                      </span>
                    </div>
                  </div>
                )}

                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                        Hospital
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                        Address
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Doctors
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Psychologists
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {visibleHospitals.map((hospital: ApiHospital) => (
                      <tr
                        key={hospital.id}
                        onClick={() => navigate(`/hospitals/${hospital.id}`)}
                        className="hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                              {hospital.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-[#1B173A] leading-tight block">
                                {hospital.name}
                              </span>
                              <span className="text-xs text-[#8E8E93] font-medium flex items-center gap-1">
                                <Mail size={12} />
                                {hospital.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2 font-medium text-[#60646C]">
                            <MapPin size={14} className="text-[#248FEC]" />
                            {hospital.address}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 font-medium text-[#60646C]">
                            <Stethoscope size={14} className="text-[#5850DE]" />
                            {hospital.doctors.length}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 font-medium text-[#60646C]">
                            <Brain size={14} className="text-[#5850DE]" />
                            {hospital.psychologists.length}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {new Date(hospital.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!isLoading && isError && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <Hospital size={24} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      Couldn't load hospitals
                    </h3>
                    <p className="text-[#60646C] text-sm mb-4">
                      Something went wrong while fetching hospitals.
                    </p>
                    <Button variant="outline" onClick={() => refetch()}>
                      Try again
                    </Button>
                  </div>
                )}

                {!isLoading && !isError && visibleHospitals.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <Hospital size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Hospitals Found
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      There are no hospitals on the platform yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="bg-white rounded-xl border border-[#E0E1E6] mt-6 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#60646C]">
                      Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                      {Math.min(currentPage * PAGE_SIZE, total)} of {total}{" "}
                      results
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
                        Previous
                      </Button>
                      <span className="text-sm font-semibold text-[#1B173A] px-2">
                        Page {currentPage} of {pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(pages, p + 1))
                        }
                        disabled={currentPage === pages || isFetching}
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

      <CreateHospitalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </RoleGuard>
  );
}
