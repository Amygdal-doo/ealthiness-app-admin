import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/coaches";
import {
  Dumbbell,
  User,
  UserCheck,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Badge, Input, Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import type { ApiUser } from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coaches - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage coaches across the Ealthiness platform",
    },
  ];
}

// TODO: Replace with real coaches API once available.
const DUMMY_COACHES: ApiUser[] = [
  {
    id: "coach-1",
    firstName: "Marcus",
    lastName: "Bennett",
    username: "mbennett",
    email: ["marcus.bennett@ealthiness.com"],
    roles: ["COACH"],
    height: 185,
    weight: 88,
    gender: "male",
    createdAt: "2024-01-22T09:00:00.000Z",
    updatedAt: "2024-01-22T09:00:00.000Z",
  },
  {
    id: "coach-2",
    firstName: "Lena",
    lastName: "Petrova",
    username: "lpetrova",
    email: ["lena.petrova@ealthiness.com"],
    roles: ["COACH"],
    height: 172,
    weight: 63,
    gender: "female",
    createdAt: "2024-02-14T09:00:00.000Z",
    updatedAt: "2024-02-14T09:00:00.000Z",
  },
  {
    id: "coach-3",
    firstName: "Diego",
    lastName: "Morales",
    username: "dmorales",
    email: ["diego.morales@ealthiness.com"],
    roles: ["COACH"],
    height: 179,
    weight: 80,
    gender: "male",
    createdAt: "2024-03-10T09:00:00.000Z",
    updatedAt: "2024-03-10T09:00:00.000Z",
  },
  {
    id: "coach-4",
    firstName: "Hannah",
    lastName: "Schmidt",
    username: "hschmidt",
    email: ["hannah.schmidt@ealthiness.com"],
    roles: ["COACH"],
    height: 167,
    weight: 59,
    gender: "female",
    createdAt: "2024-04-02T09:00:00.000Z",
    updatedAt: "2024-04-02T09:00:00.000Z",
  },
  {
    id: "coach-5",
    firstName: "Tyler",
    lastName: "Brooks",
    username: "tbrooks",
    email: ["tyler.brooks@ealthiness.com"],
    roles: ["COACH"],
    height: 181,
    weight: 85,
    gender: "male",
    createdAt: "2024-04-25T09:00:00.000Z",
    updatedAt: "2024-04-25T09:00:00.000Z",
  },
  {
    id: "coach-6",
    firstName: "Nadia",
    lastName: "Hassan",
    username: "nhassan",
    email: ["nadia.hassan@ealthiness.com"],
    roles: ["COACH"],
    height: 169,
    weight: 61,
    gender: "female",
    createdAt: "2024-05-18T09:00:00.000Z",
    updatedAt: "2024-05-18T09:00:00.000Z",
  },
];

const PAGE_SIZE = 10;

export default function CoachesPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
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

  // Dummy data source — filtered/sorted/paginated client-side to mirror the
  // users API response shape used by the customers page.
  const isLoading = false;

  const filteredCoaches = DUMMY_COACHES.filter((coach) => {
    if (!debouncedSearchTerm) return true;
    const term = debouncedSearchTerm.toLowerCase();
    return (
      `${coach.firstName} ${coach.lastName}`.toLowerCase().includes(term) ||
      coach.username.toLowerCase().includes(term) ||
      coach.email[0].toLowerCase().includes(term)
    );
  });

  const sortedCoaches = [...filteredCoaches].sort((a, b) => {
    const getValue = (coach: ApiUser) =>
      orderBy === "birthdate" ? coach.createdAt : (coach[orderBy] ?? "");
    const aValue = getValue(a).toString().toLowerCase();
    const bValue = getValue(b).toString().toLowerCase();
    const comparison = aValue.localeCompare(bValue);
    return sortType === "ascending" ? comparison : -comparison;
  });

  const total = sortedCoaches.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const usersResponse = {
    limit: PAGE_SIZE,
    page: currentPage,
    pages,
    total,
    results: sortedCoaches.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    ),
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLogout = () => {
    navigate("/");
  };

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

  const visibleCoaches = usersResponse?.results?.map(transformUser) || [];
  const pageTitle = "Coaches";

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                      <Dumbbell size={20} />
                    </div>
                    {pageTitle}
                  </h2>
                  <p className="text-[#60646C] text-sm font-medium mt-1">
                    Total {usersResponse?.total || 0} users found (
                    {visibleCoaches.length} coaches on this page)
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

              <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden relative">
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        Loading coaches...
                      </span>
                    </div>
                  </div>
                )}

                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                        Coach
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
                    {visibleCoaches.map((coach) => (
                      <tr
                        key={coach.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold">
                              {coach.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1B173A] leading-tight">
                                  {coach.name}
                                </span>
                                {/* Gender icon */}
                                {coach.gender === "male" ? (
                                  <User size={14} className="text-blue-500" />
                                ) : coach.gender === "female" ? (
                                  <UserCheck
                                    size={14}
                                    className="text-pink-500"
                                  />
                                ) : null}
                              </div>
                              <span className="text-xs text-[#8E8E93] font-medium">
                                {coach.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            {coach.roles.map((role, index) => (
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
                          {coach.height}
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {coach.weight}
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {coach.joined}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/customers/${coach.id}`}
                            className="bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#5850DE] hover:text-[#5850DE] transition inline-block"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {visibleCoaches.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <Dumbbell size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Coaches Found
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      There are no coaches in your management scope yet.
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
      </div>
    </RoleGuard>
  );
}
