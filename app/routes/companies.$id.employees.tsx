import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useParams } from "react-router";
import type { Route } from "./+types/companies.$id.employees";
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
  MoreHorizontal,
} from "lucide-react";
import { Badge, Input, Button } from "~/components/ui";
import AppSidebar from "../../src/components/shared/AppSidebar";
import Navbar from "../../src/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import {
  useCompanyEmployees,
  useCompanyDetails,
  useDeleteUser,
} from "~/hooks/useAuthApi";
import type { ApiUser } from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Company Employees - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage employees in the company",
    },
  ];
}

export async function loader({ params }: { params: { id: string } }) {
  return { companyId: params.id };
}

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: ConfirmDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium">{userName}</span>? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyEmployeesPage({
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
  const [orderBy, setOrderBy] = useState<"firstName" | "lastName" | "email">(
    "lastName",
  );
  const [sortType, setSortType] = useState<"ascending" | "descending">(
    "ascending",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "email", label: "Email" },
  ];

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

  // Fetch company employees with React Query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useCompanyEmployees(actualCompanyId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
    orderBy: orderBy,
    type: sortType,
  });
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();
  const {
    data: companyDetails,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useCompanyDetails(actualCompanyId);

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteDialog({ isOpen: true, userId, userName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.userId);
      setDeleteDialog({ isOpen: false, userId: "", userName: "" });
      // The query will automatically refetch due to invalidation in the mutation
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, userId: "", userName: "" });
  };

  if (!user || isLoading || isLoadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading company employees...</span>
        </div>
      </div>
    );
  }

  if (error || companyError) {
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                {companyError
                  ? "Company Not Found"
                  : "Failed to Load Employees"}
              </h2>
              <p className="text-gray-600 mb-4">
                {companyError
                  ? "The company you're looking for could not be found."
                  : "There was an error loading the company employees."}
              </p>
              <Link to="/companies" className="text-blue-500 hover:underline">
                Back to Companies
              </Link>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const users = data?.results || [];
  const totalPages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-12">
              <Link
                to={`/companies/${actualCompanyId}`}
                className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
              >
                <ArrowLeft size={18} />
                Back to Company Details
              </Link>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-[#1B173A] mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  {companyDetails?.name} Employees
                </h1>
                <p className="text-[#8E8E93] font-medium">
                  Manage employees for this company • {totalUsers} total
                  employees
                </p>
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

                  {/* Order By Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#60646C] whitespace-nowrap">
                      Sort by:
                    </span>
                    <div className="relative" ref={dropdownRef}>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
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
                              onClick={(e) => {
                                e.preventDefault();
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
                      onClick={(e) => {
                        e.preventDefault();
                        setSortType(
                          sortType === "ascending" ? "descending" : "ascending",
                        );
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#E0E1E6] rounded-xl text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:text-[#5850DE] hover:bg-[#F0F0F3] focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white min-w-[80px] justify-center"
                    >
                      {sortType === "ascending" ? "↑ A-Z" : "↓ Z-A"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-[#E0E1E6] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                        <th className="p-4 text-left">
                          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                            Employee
                          </span>
                        </th>
                        <th className="p-4 text-left">
                          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                            Email
                          </span>
                        </th>
                        <th className="p-4 text-left">
                          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                            Roles
                          </span>
                        </th>
                        <th className="p-4 text-left">
                          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                            Joined
                          </span>
                        </th>
                        <th className="p-4 text-right">
                          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                            Actions
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                              <Users size={24} className="text-[#8E8E93]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                              No Employees Found
                            </h3>
                            <p className="text-[#60646C] text-sm">
                              {debouncedSearchTerm
                                ? "No employees match your search criteria."
                                : "This company has no employees yet."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user._id}
                            className="bg-white hover:bg-[#F8F9FB] border-t border-[#E0E1E6] transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center font-bold text-sm">
                                  {user.firstName?.charAt(0) || "?"}
                                  {user.lastName?.charAt(0) || "?"}
                                </div>
                                <div>
                                  <h4 className="font-bold text-[#1B173A] text-sm">
                                    {user.firstName} {user.lastName}
                                  </h4>
                                  <p className="text-[#60646C] text-xs font-medium">
                                    @{user.username}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-[#60646C] text-sm">
                              {user.email?.[0] || "No email"}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {user.roles?.map((role, index) => (
                                  <Badge
                                    key={index}
                                    className={`text-xs px-2 py-1 ${
                                      role === "COMPANY_ADMIN"
                                        ? "bg-purple-100 text-purple-700"
                                        : role === "USER"
                                          ? "bg-gray-100 text-gray-700"
                                          : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {role.replace("_", " ")}
                                  </Badge>
                                )) || (
                                  <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
                                    USER
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-medium text-[#60646C] text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() =>
                                  handleDeleteClick(
                                    user._id,
                                    `${user.firstName} ${user.lastName}`,
                                  )
                                }
                                disabled={isDeleting}
                                className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                                title="Delete employee"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-6 py-4 border-t border-[#E0E1E6] flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * 10 + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * 10, totalUsers)}
                          </span>{" "}
                          of <span className="font-medium">{totalUsers}</span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>

                          {getPageNumbers().map((pageNum, index) =>
                            pageNum === "..." ? (
                              <span
                                key={index}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </span>
                            ) : (
                              <button
                                key={index}
                                onClick={() =>
                                  setCurrentPage(pageNum as number)
                                }
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === currentPage
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            ),
                          )}

                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Confirmation Dialog */}
              <ConfirmDeleteDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                userName={deleteDialog.userName}
              />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
