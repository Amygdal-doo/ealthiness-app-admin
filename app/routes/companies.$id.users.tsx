import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useParams } from "react-router";
import type { Route } from "./+types/companies.$id.users";
import {
  Users,
  User,
  UserCheck,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  Trash2,
  Filter,
} from "lucide-react";
import { Badge, Input, Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import {
  useCompanyUsers,
  useCompanyDetails,
  useRemoveCompanyAdmin,
} from "~/hooks/useAuthApi";
import type {
  ApiUser,
  UsersQueryParams,
  CompanyUserType,
} from "~/lib/auth/types";

// Local type for company users with restricted orderBy options
interface CompanyUsersQueryParams extends Omit<UsersQueryParams, "orderBy"> {
  orderBy?: "firstName" | "lastName" | "email" | undefined;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Company Users - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage users in the company",
    },
  ];
}

export async function loader({ params }: { params: { id: string } }) {
  return { companyId: params.id };
}

export default function CompanyUsersPage({
  loaderData,
}: {
  loaderData: { companyId: string };
}) {
  const { companyId } = loaderData;
  const params = useParams();
  const actualCompanyId = companyId || params.id || "";

  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<
    "firstName" | "lastName" | "email" | ""
  >("");
  const [sortType, setSortType] = useState<"ascending" | "descending">(
    "ascending",
  );
  const [userType, setUserType] = useState<CompanyUserType>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserTypeDropdownOpen, setIsUserTypeDropdownOpen] = useState(false);
  const [removeAdminConfirmation, setRemoveAdminConfirmation] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userTypeDropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "", label: "None" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "email", label: "Email" },
  ];

  const userTypeOptions: { value: CompanyUserType; label: string }[] = [
    { value: "all", label: "All Users" },
    { value: "admins", label: "Admins Only" },
    { value: "employees", label: "Employees Only" },
    { value: "coaches", label: "Coaches Only" },
    { value: "psychologists", label: "Psychologists Only" },
    { value: "doctors", label: "Doctors Only" },
  ];

  // Fetch company details for the company name
  const { data: apiCompany, isLoading: isLoadingCompany } =
    useCompanyDetails(actualCompanyId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        userTypeDropdownRef.current &&
        !userTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserTypeDropdownOpen(false);
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

  // Fetch company users with React Query
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useCompanyUsers(actualCompanyId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
    orderBy: orderBy || undefined,
    type: sortType,
    userType: userType,
  } as UsersQueryParams);

  // Remove company admin role mutation
  const removeAdminMutation = useRemoveCompanyAdmin();

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleRemoveAdmin = (userId: string, userName: string) => {
    setRemoveAdminConfirmation({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleConfirmRemoveAdmin = async () => {
    try {
      await removeAdminMutation.mutateAsync({
        companyId: actualCompanyId,
        userId: removeAdminConfirmation.userId,
      });
      setRemoveAdminConfirmation({ isOpen: false, userId: "", userName: "" });
      // Refetch the current page data
      refetch();
    } catch (error) {
      console.error("Failed to remove admin role:", error);
      // Error is already logged in the mutation
    }
  };

  const handleCancelRemoveAdmin = () => {
    setRemoveAdminConfirmation({ isOpen: false, userId: "", userName: "" });
  };

  if (!user || isLoadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">
            {!user ? "Loading..." : "Loading company details..."}
          </span>
        </div>
      </div>
    );
  }

  // Transform API users to display format
  const transformUser = (apiUser: ApiUser) => ({
    id: apiUser.id,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    roles: apiUser.roles, // Show all roles
    joined: new Date(apiUser.createdAt).toLocaleDateString(),
    status: "Active", // API doesn't provide status, defaulting to Active
    weight: apiUser.weight ? `${apiUser.weight}kg` : "N/A",
    height: apiUser.height ? `${apiUser.height}cm` : "N/A",
    username: apiUser.username,
    email: apiUser.email[0],
    gender: apiUser.gender, // Include gender for icon display
  });

  const visibleUsers = usersResponse?.results?.map(transformUser) || [];
  const companyName = apiCompany?.name || "Company";

  // Handle error state
  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <RoleGuard
      allowedRoles={[
        "SUPER_ADMIN",
        "COUNTRY_ADMIN",
        "REGIONAL_ADMIN",
        "COMPANY_ADMIN",
      ]}
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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link
                to={`/companies/${actualCompanyId}`}
                className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
              >
                <ArrowLeft size={18} />
                Back to {companyName}
              </Link>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    Users in {companyName}
                  </h2>
                  <p className="text-[#60646C] text-sm font-medium mt-1">
                    Total {usersResponse?.total || 0} users found (
                    {visibleUsers.length} on this page)
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-xl border border-[#E0E1E6] p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* Search Input */}
                  <div className="relative flex-1">
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

                  {/* User Type Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#60646C] whitespace-nowrap">
                      Filter by:
                    </span>
                    <div className="relative" ref={userTypeDropdownRef}>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setIsUserTypeDropdownOpen(!isUserTypeDropdownOpen)
                        }
                        className="justify-between min-w-[140px] bg-white border border-[#E0E1E6] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:bg-white focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Filter size={16} className="mr-2" />
                        {
                          userTypeOptions.find(
                            (option) => option.value === userType,
                          )?.label
                        }
                        <ChevronDown
                          size={16}
                          className={`text-[#8E8E93] transition-transform duration-200 ${isUserTypeDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </Button>

                      {isUserTypeDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E1E6] rounded-xl shadow-lg z-50 py-1">
                          {userTypeOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setUserType(option.value);
                                setCurrentPage(1);
                                setIsUserTypeDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[#F0F0F3] transition-colors flex items-center justify-between ${
                                userType === option.value
                                  ? "text-[#5850DE] bg-[#F0F0F3]"
                                  : "text-[#1B173A]"
                              }`}
                            >
                              {option.label}
                              {userType === option.value && (
                                <Check size={16} className="text-[#5850DE]" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order By Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#60646C] whitespace-nowrap">
                      Sort by:
                    </span>
                    <div className="relative" ref={dropdownRef}>
                      <Button
                        variant="outline"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="justify-between min-w-[140px] bg-white border border-[#E0E1E6] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:bg-white focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {
                          sortOptions.find((option) => option.value === orderBy)
                            ?.label
                        }
                        <ChevronDown
                          size={16}
                          className={`text-[#8E8E93] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </Button>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E1E6] rounded-xl shadow-lg z-50 py-1">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setOrderBy(option.value as typeof orderBy);
                                setCurrentPage(1);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-[#F0F0F3] transition-colors flex items-center justify-between ${
                                orderBy === option.value
                                  ? "text-[#5850DE] bg-[#F0F0F3]"
                                  : "text-[#1B173A]"
                              }`}
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
                  </div>

                  {/* Sort Direction */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSortType(
                          sortType === "ascending" ? "descending" : "ascending",
                        );
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#E0E1E6] rounded-xl text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:text-[#5850DE] hover:bg-[#F0F0F3] focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white min-w-[80px] justify-center"
                    >
                      {sortType === "ascending" ? "� A-Z" : "� Z-A"}
                    </button>
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
                        Loading users...
                      </span>
                    </div>
                  </div>
                )}

                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                        User
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                        Roles
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Height
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Weight
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Joined
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {visibleUsers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1B173A] leading-tight">
                                  {customer.name}
                                </span>
                                {/* Gender icon */}
                                {customer.gender === "male" ? (
                                  <User size={14} className="text-blue-500" />
                                ) : customer.gender === "female" ? (
                                  <UserCheck
                                    size={14}
                                    className="text-pink-500"
                                  />
                                ) : null}
                              </div>
                              <span className="text-xs text-[#8E8E93] font-medium">
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            {customer.roles.map((role, index) => (
                              <div key={index}>
                                <Badge
                                  variant={
                                    role === "SUPER_ADMIN"
                                      ? "destructive"
                                      : role.includes("ADMIN")
                                        ? "secondary"
                                        : "default"
                                  }
                                  className="text-xs"
                                >
                                  {role.replace("_", " ")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {customer.height}
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {customer.weight}
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {customer.joined}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {customer.roles.includes("COMPANY_ADMIN") && (
                              <button
                                onClick={() =>
                                  handleRemoveAdmin(customer.id, customer.name)
                                }
                                className="p-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-colors"
                                title="Remove admin role"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            <Link
                              to={`/customers/${customer.id}`}
                              className="bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#5850DE] hover:text-[#5850DE] transition inline-block"
                            >
                              View Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {visibleUsers.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Users Found
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      {searchTerm
                        ? "No users match your search criteria."
                        : "There are no users in this company yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {usersResponse && usersResponse.pages > 1 && (
                <div className="bg-white rounded-xl border border-[#E0E1E6] mt-6 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#60646C]">
                        Showing {(currentPage - 1) * 10 + 1} to{" "}
                        {Math.min(currentPage * 10, usersResponse.total)} of{" "}
                        {usersResponse.total} results
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1 || isLoading}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const totalPages = usersResponse.pages;
                          const current = currentPage;
                          let pages = [];

                          if (totalPages <= 7) {
                            // Show all pages if 7 or fewer
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            // Show truncated pagination
                            if (current <= 4) {
                              pages = [1, 2, 3, 4, 5, "...", totalPages];
                            } else if (current >= totalPages - 3) {
                              pages = [
                                1,
                                "...",
                                totalPages - 4,
                                totalPages - 3,
                                totalPages - 2,
                                totalPages - 1,
                                totalPages,
                              ];
                            } else {
                              pages = [
                                1,
                                "...",
                                current - 1,
                                current,
                                current + 1,
                                "...",
                                totalPages,
                              ];
                            }
                          }

                          return pages.map((page, index) => {
                            if (page === "...") {
                              return (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2 py-1 text-[#8E8E93]"
                                >
                                  ...
                                </span>
                              );
                            }

                            const pageNum = page as number;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                disabled={isLoading}
                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                  pageNum === current
                                    ? "bg-[#5850DE] text-white"
                                    : "text-[#60646C] hover:text-[#5850DE] hover:bg-[#F0F0F3]"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Next Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(
                            Math.min(usersResponse.pages, currentPage + 1),
                          )
                        }
                        disabled={
                          currentPage === usersResponse.pages || isLoading
                        }
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

        {/* Remove Admin Role Confirmation Modal */}
        {removeAdminConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold text-orange-600 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Trash2 size={20} />
                  </div>
                  Remove Admin Role
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to remove the company admin role from{" "}
                  <strong>{removeAdminConfirmation.userName}</strong>? This will
                  revoke their administrative privileges for this company.
                </p>

                {removeAdminMutation.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      Failed to remove admin role. Please try again.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleConfirmRemoveAdmin}
                    disabled={removeAdminMutation.isPending}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {removeAdminMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-2" />
                        Remove Role
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelRemoveAdmin}
                    variant="outline"
                    disabled={removeAdminMutation.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
