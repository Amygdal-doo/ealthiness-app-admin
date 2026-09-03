import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/coaches";
import {
  Dumbbell,
  Star,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  UserPlus,
} from "lucide-react";
import { Input, Button } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { InviteCoachModal } from "~/components/modals/InviteCoachModal";
import { useUser } from "~/hooks/useAuth";
import { useCoaches } from "~/hooks/useAuthApi";
import type { ApiCoach } from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coaches - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage coaches across the Ealthiness platform",
    },
  ];
}

const PAGE_SIZE = 10;

const formatPrice = (coach: ApiCoach) =>
  `${coach.price.toFixed(2)} ${coach.currency.toUpperCase()}`;

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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
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

  // Search, ordering and pagination are all handled server-side.
  const {
    data: coachesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useCoaches({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearchTerm,
    orderBy,
    type: sortType,
  });

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
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

  const visibleCoaches = coachesResponse?.results ?? [];
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
            refreshing={refreshing || isFetching}
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
                    Total {coachesResponse?.total || 0} coaches found (
                    {visibleCoaches.length} on this page)
                  </p>
                </div>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-[#5850DE] hover:bg-[#4A42C7] text-white font-bold rounded-xl px-4 py-2.5 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Invite Coach
                </Button>
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
                        Username
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Rating
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Reviews
                      </th>
                      <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                        Price
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
                        onClick={() => navigate(`/coaches/${coach.id}`)}
                        className="hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                              {coach.firstName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-[#1B173A] leading-tight block">
                                {coach.firstName} {coach.lastName}
                              </span>
                              <span className="text-xs text-[#8E8E93] font-medium">
                                {coach.email[0] ?? "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden lg:table-cell">
                          {coach.username}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 font-medium text-[#60646C]">
                            <Star size={14} className="text-[#FFB900]" />
                            {coach.rating}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 font-medium text-[#60646C]">
                            <MessageSquare size={14} className="text-[#248FEC]" />
                            {coach.reviews}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                          {formatPrice(coach)}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/coaches/${coach.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#5850DE] hover:text-[#5850DE] transition inline-block"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {visibleCoaches.length === 0 && !isLoading && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                      <Dumbbell size={24} className="text-[#8E8E93]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                      No Coaches Found
                    </h3>
                    <p className="text-[#60646C] text-sm">
                      {searchTerm
                        ? "No coaches match your search criteria."
                        : "There are no coaches in your management scope yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {coachesResponse && coachesResponse.pages > 1 && (
                <div className="bg-white rounded-xl border border-[#E0E1E6] mt-6 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#60646C]">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                        {Math.min(currentPage * PAGE_SIZE, coachesResponse.total)}{" "}
                        of {coachesResponse.total} results
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
                          const totalPages = coachesResponse.pages;
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
                            Math.min(coachesResponse.pages, currentPage + 1),
                          )
                        }
                        disabled={
                          currentPage === coachesResponse.pages || isLoading
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

      <InviteCoachModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </RoleGuard>
  );
}
