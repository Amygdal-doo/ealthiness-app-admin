import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useParams } from "react-router";
import type { Route } from "./+types/region.$id.companies";
import {
  Building2,
  Plus,
  Mail,
  Edit,
  Eye,
  Search,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { Button, Card, Badge, Input } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useRegionCompanies, useRegionDetails } from "~/hooks/useAuthApi";
import type { ApiCompany } from "~/lib/auth/types";
import { InviteCompanyAdminModal } from "~/components/modals/InviteCompanyAdminModal";
import { InviteCompanyEmployeeModal } from "~/components/modals/InviteCompanyEmployeeModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Region Companies - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage companies in the region",
    },
  ];
}

export async function loader({ params }: { params: { id: string } }) {
  return { regionId: params.id };
}

export default function RegionCompaniesPage({
  loaderData,
}: {
  loaderData: { regionId: string };
}) {
  const { regionId } = loaderData;
  const params = useParams();
  const actualRegionId = regionId || params.id || "";

  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<"name" | "createdAt" | "">("name");
  const [sortType, setSortType] = useState<"ascending" | "descending">(
    "ascending",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [inviteAdminModal, setInviteAdminModal] = useState<{
    isOpen: boolean;
    companyId: string;
    companyName: string;
  }>({
    isOpen: false,
    companyId: "",
    companyName: "",
  });

  const [inviteEmployeeModal, setInviteEmployeeModal] = useState<{
    isOpen: boolean;
    companyId: string;
    companyName: string;
  }>({
    isOpen: false,
    companyId: "",
    companyName: "",
  });

  const sortOptions = [
    { value: "", label: "None" },
    { value: "name", label: "Name" },
    { value: "createdAt", label: "Date Created" },
  ];

  // Fetch region details for the region name
  const { data: apiRegion, isLoading: isLoadingRegion } =
    useRegionDetails(actualRegionId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch region companies with React Query
  const {
    data: companiesResponse,
    isLoading,
    error,
    refetch,
  } = useRegionCompanies(actualRegionId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
    orderBy: orderBy || undefined,
    type: sortType,
  });

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const handleLogout = () => {
    navigate("/");
  };

  if (!user || isLoadingRegion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">
            {!user ? "Loading..." : "Loading region details..."}
          </span>
        </div>
      </div>
    );
  }

  // Transform API companies to display format
  const transformCompany = (apiCompany: ApiCompany) => ({
    id: apiCompany._id,
    name: apiCompany.name,
    status: apiCompany.status,
    email: apiCompany.email,
    address: apiCompany.address,
    logo: apiCompany.logo,
    employees: apiCompany.employees.length,
    admins: apiCompany.admins.length,
    createdAt: new Date(apiCompany.createdAt).toLocaleDateString(),
  });

  const visibleCompanies =
    companiesResponse?.results?.map(transformCompany) || [];
  const regionName = apiRegion?.name || "Region";

  // Handle error state
  if (error) {
    console.error("Error fetching companies:", error);
  }

  const handleInviteAdmin = (companyId: string, companyName: string) => {
    setInviteAdminModal({
      isOpen: true,
      companyId,
      companyName,
    });
  };

  const handleInviteEmployee = (companyId: string, companyName: string) => {
    setInviteEmployeeModal({
      isOpen: true,
      companyId,
      companyName,
    });
  };

  const handleCloseInviteAdminModal = () => {
    setInviteAdminModal({
      isOpen: false,
      companyId: "",
      companyName: "",
    });
  };

  const handleCloseInviteEmployeeModal = () => {
    setInviteEmployeeModal({
      isOpen: false,
      companyId: "",
      companyName: "",
    });
  };

  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "REGIONAL_ADMIN"]}
    >
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col">
          <Navbar
            user={user}
            onLogout={handleLogout}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <div className="flex-1 p-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <Link
                to={`/regions/${actualRegionId}`}
                className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
              >
                <ArrowLeft size={18} />
                Back to {regionName}
              </Link>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    Companies in {regionName}
                  </h2>
                  <p className="text-[#60646C] text-sm font-medium mt-1">
                    {companiesResponse
                      ? `Total ${companiesResponse.total} companies in this region.`
                      : `Total ${visibleCompanies.length} companies in this region.`}
                  </p>
                </div>
              </div>

              <Card>
                <div className="p-6 space-y-6">
                  {/* Search and Filter Section */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]"
                      />
                      <Input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative" ref={dropdownRef}>
                        <Button
                          variant="outline"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 min-w-[140px] justify-between"
                        >
                          {sortOptions.find(
                            (option) => option.value === orderBy,
                          )?.label || "Sort by"}
                          <ChevronDown size={16} />
                        </Button>
                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#E0E1E6] rounded-lg shadow-lg z-10">
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setOrderBy(
                                    option.value as "name" | "createdAt" | "",
                                  );
                                  setCurrentPage(1);
                                  setIsDropdownOpen(false);
                                }}
                                className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-[#F8F9FB] first:rounded-t-lg last:rounded-b-lg"
                              >
                                {option.label}
                                {orderBy === option.value && (
                                  <Check size={16} className="text-[#5850DE]" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSortType(
                            sortType === "ascending"
                              ? "descending"
                              : "ascending",
                          )
                        }
                        className="px-3"
                        title={`Sort ${sortType === "ascending" ? "Descending" : "Ascending"}`}
                      >
                        {sortType === "ascending" ? "A↑" : "Z↓"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">
                          Loading companies...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                      <tr>
                        <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                          Company Name
                        </th>
                        <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                          Status
                        </th>
                        <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                          Address
                        </th>
                        <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                          Employees
                        </th>
                        <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                          Admins
                        </th>
                        <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E1E6]">
                      {visibleCompanies.length > 0 ? (
                        visibleCompanies.map((company) => (
                          <tr
                            key={company.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="p-4 font-bold text-[#1B173A] flex items-center gap-3">
                              {company.logo ? (
                                <img
                                  src={company.logo.url}
                                  alt={`${company.name} logo`}
                                  className="w-8 h-8 object-cover rounded-lg border shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const fallback =
                                      document.createElement("div");
                                    fallback.className =
                                      "w-8 h-8 rounded-lg bg-[#F0F0F3] text-[#1B173A] flex items-center justify-center";
                                    fallback.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
                                    e.currentTarget.parentNode?.replaceChild(
                                      fallback,
                                      e.currentTarget,
                                    );
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-[#F0F0F3] text-[#1B173A] flex items-center justify-center">
                                  <Building2 size={16} />
                                </div>
                              )}
                              <div>
                                <Link 
                                  to={`/companies/${company.id}`}
                                  className="hover:text-[#5850DE] transition-colors font-bold"
                                >
                                  {company.name}
                                </Link>
                                <div className="text-xs text-[#8E8E93] font-normal">
                                  {company.email}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  company.status === "active" ? "secondary" : "outline"
                                }
                              >
                                {company.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-[#60646C]">
                              {company.address || "No address"}
                            </td>
                            <td className="p-4 font-bold text-[#1B173A]">
                              {company.employees}
                            </td>
                            <td className="p-4 font-bold text-[#1B173A]">
                              {company.admins}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                {user?.role === 'SUPER_ADMIN' ? (
                                  <Button
                                    variant="ghost"
                                    className="px-2"
                                    title="Edit Company"
                                    onClick={() => navigate(`/companies/${company.id}`)}
                                  >
                                    <Edit size={18} />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    className="px-2"
                                    title="View Company"
                                    onClick={() => navigate(`/companies/${company.id}`)}
                                  >
                                    <Eye size={18} />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleInviteAdmin(company.id, company.name)
                                  }
                                >
                                  <Mail size={16} className="mr-2" /> Invite Admin
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleInviteEmployee(company.id, company.name)
                                  }
                                >
                                  <UserPlus size={16} className="mr-2" /> Invite Employee
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-[#8E8E93]"
                          >
                            {isLoading
                              ? "Loading..."
                              : error
                                ? "Error loading companies"
                                : searchTerm
                                  ? "No companies found matching your search"
                                  : "No companies found in this region"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {companiesResponse && companiesResponse.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#E0E1E6]">
                    <div className="text-sm text-[#8E8E93]">
                      Page {currentPage} of {companiesResponse.pages} (
                      {companiesResponse.total} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= companiesResponse.pages}
                        className="px-3"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Invite Company Admin Modal */}
              <InviteCompanyAdminModal
                isOpen={inviteAdminModal.isOpen}
                onClose={handleCloseInviteAdminModal}
                companyId={inviteAdminModal.companyId}
                companyName={inviteAdminModal.companyName}
              />

              {/* Invite Company Employee Modal */}
              <InviteCompanyEmployeeModal
                isOpen={inviteEmployeeModal.isOpen}
                onClose={handleCloseInviteEmployeeModal}
                companyId={inviteEmployeeModal.companyId}
                companyName={inviteEmployeeModal.companyName}
              />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}