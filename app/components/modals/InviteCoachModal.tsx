import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Dumbbell,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button, Input, Textarea } from "~/components/ui";
import { useUsers, useAssignCoachRole } from "~/hooks/useAuthApi";
import { getApiErrorMessage } from "~/lib/services/api";
import type { ApiUser } from "~/lib/auth/types";

interface InviteCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 10;

export const InviteCoachModal: React.FC<InviteCoachModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [yearsInput, setYearsInput] = useState("");
  const [predictedUsersInput, setPredictedUsersInput] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const assignMutation = useAssignCoachRole();

  // Only fetch users with the USER role, and only while the modal is open.
  const {
    data: usersResponse,
    isLoading,
    isFetching,
  } = useUsers(
    {
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearchTerm || undefined,
      orderBy: "lastName",
      type: "ascending",
      onlyRole: "USER",
    },
    { enabled: isOpen },
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      assignMutation.reset();
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setCurrentPage(1);
      setSelectedUser(null);
      setYearsInput("");
      setPredictedUsersInput("");
      setShortBio("");
      setIsDropdownOpen(false);
      setErrorMessage("");
    }
  }, [isOpen]);

  const yearsOfexperience = Number(yearsInput);
  const predictedNumberOfUsers = Number(predictedUsersInput);
  const isYearsValid =
    yearsInput.trim() !== "" &&
    Number.isInteger(yearsOfexperience) &&
    yearsOfexperience >= 0;
  const isPredictedUsersValid =
    predictedUsersInput.trim() !== "" &&
    Number.isInteger(predictedNumberOfUsers) &&
    predictedNumberOfUsers >= 0;
  const isBioValid = shortBio.trim() !== "";
  const isFormValid =
    !!selectedUser && isYearsValid && isPredictedUsersValid && isBioValid;

  const handleInvite = async () => {
    if (!isFormValid || !selectedUser) return;

    setErrorMessage("");

    try {
      await assignMutation.mutateAsync({
        userId: selectedUser.id,
        yearsOfexperience,
        predictedNumberOfUsers,
        shortBio: shortBio.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Failed to invite coach:", error);
      setErrorMessage(
        getApiErrorMessage(error, "Failed to invite coach. Please try again."),
      );
    }
  };

  const users = usersResponse?.results ?? [];
  const totalPages = usersResponse?.pages ?? 1;

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
              <Dumbbell size={20} />
            </div>
            Invite Coach
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full justify-between bg-white border border-[#E0E1E6] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:bg-white focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="truncate">
                  {selectedUser
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : "Choose a user"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[#8E8E93] transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E1E6] rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-[#E0E1E6]">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]"
                      />
                      <Input
                        type="text"
                        placeholder="Search by name, username, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full text-sm"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-56 overflow-y-auto py-1">
                    {isLoading || isFetching ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-[#5850DE] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : users.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-[#8E8E93]">
                        No users found.
                      </div>
                    ) : (
                      users.map((candidate) => {
                        const isSelected = selectedUser?.id === candidate.id;
                        return (
                          <button
                            key={candidate.id}
                            onClick={() => {
                              setSelectedUser(candidate);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-[#F0F0F3] transition-colors flex items-center justify-between gap-3 ${
                              isSelected ? "bg-[#F0F0F3]" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <span
                                className={`block text-sm font-semibold truncate ${
                                  isSelected
                                    ? "text-[#5850DE]"
                                    : "text-[#1B173A]"
                                }`}
                              >
                                {candidate.firstName} {candidate.lastName}
                              </span>
                              <span className="block text-xs text-[#8E8E93] truncate">
                                {candidate.email[0] ?? candidate.username}
                              </span>
                            </div>
                            {isSelected && (
                              <Check
                                size={16}
                                className="text-[#5850DE] shrink-0"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-[#E0E1E6]">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1 || isFetching}
                        className="flex items-center gap-1 text-xs font-semibold text-[#60646C] hover:text-[#5850DE] disabled:opacity-40 disabled:hover:text-[#60646C] transition-colors"
                      >
                        <ChevronLeft size={14} />
                        Prev
                      </button>
                      <span className="text-xs font-medium text-[#8E8E93]">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages || isFetching}
                        className="flex items-center gap-1 text-xs font-semibold text-[#60646C] hover:text-[#5850DE] disabled:opacity-40 disabled:hover:text-[#60646C] transition-colors"
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={yearsInput}
                onChange={(e) => setYearsInput(e.target.value)}
                placeholder="e.g. 5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Predicted Users
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={predictedUsersInput}
                onChange={(e) => setPredictedUsersInput(e.target.value)}
                placeholder="e.g. 100"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Bio
            </label>
            <Textarea
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="e.g. Certified strength coach."
              rows={3}
              className="w-full"
            />
          </div>

          {selectedUser && isFormValid && (
            <div className="p-3 bg-[#F8F9FB] border border-[#E0E1E6] rounded-lg text-sm text-[#60646C]">
              <p>
                <strong className="text-[#1B173A]">
                  {selectedUser.firstName} {selectedUser.lastName}
                </strong>{" "}
                will be invited as a coach with{" "}
                <strong>{yearsOfexperience}</strong> years of experience.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleInvite}
              disabled={assignMutation.isPending || !isFormValid}
              className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
            >
              {assignMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Inviting...
                </>
              ) : (
                <>
                  <Dumbbell size={16} className="mr-2" />
                  Invite Coach
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={assignMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
