import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import {
  Users,
  User,
  UserCheck,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Badge, Input, Button } from "~/components/ui";
import { useRegionUsers } from "~/hooks/useAuthApi";
import type { ApiUser, UsersQueryParams } from "~/lib/auth/types";

interface RegionUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionId: string;
  regionName: string;
}

export const RegionUsersModal: React.FC<RegionUsersModalProps> = ({
  isOpen,
  onClose,
  regionId,
  regionName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<
    "firstName" | "lastName" | "email" | "username" | "birthdate"
  >("lastName");
  const [sortType, setSortType] = useState<"ascending" | "descending">(
    "ascending",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "username", label: "Username" },
    { value: "email", label: "Email" },
    { value: "birthdate", label: "Date Created" },
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

  // Reset search and pagination when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Fetch region users with React Query
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useRegionUsers(regionId, {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
    orderBy: orderBy,
    type: sortType,
  });

  // Transform API users to display format
  const transformUser = (apiUser: ApiUser) => ({
    id: apiUser._id,
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

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E0E1E6]">
          <h3 className="text-xl font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
              <Users size={20} />
            </div>
            Users in {regionName}
            <span className="text-sm font-normal text-gray-600">
              ({usersResponse?.total || 0} total)
            </span>
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-[#E0E1E6]">
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
                {sortType === "ascending" ? "↑ A-Z" : "↓ Z-A"}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-hidden relative">
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

          <div className="overflow-auto h-full">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6] sticky top-0">
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
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1B173A] leading-tight">
                              {user.name}
                            </span>
                            {/* Gender icon */}
                            {user.gender === "male" ? (
                              <User size={14} className="text-blue-500" />
                            ) : user.gender === "female" ? (
                              <UserCheck
                                size={14}
                                className="text-pink-500"
                              />
                            ) : null}
                          </div>
                          <span className="text-xs text-[#8E8E93] font-medium">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="space-y-1">
                        {user.roles.map((role, index) => (
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
                      {user.height}
                    </td>
                    <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                      {user.weight}
                    </td>
                    <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                      {user.joined}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/customers/${user.id}`}
                        onClick={handleClose}
                        className="bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#5850DE] hover:text-[#5850DE] transition inline-block"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleUsers.length === 0 && !isLoading && (
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
                    : "There are no users in this region yet."}
                </p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <X size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  Error Loading Users
                </h3>
                <p className="text-[#60646C] text-sm mb-4">
                  Failed to load users for this region.
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {usersResponse && usersResponse.pages > 1 && (
          <div className="p-6 border-t border-[#E0E1E6]">
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
    </div>,
    document.body
  );
};