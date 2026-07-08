import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Brain,
  X,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button, Input } from "~/components/ui";
import { useUser } from "~/hooks/useAuth";
import {
  usePsychologists,
  useCompanyPsychologists,
  useInvitePsychologistToCompany,
} from "~/hooks/useAuthApi";
import { getApiErrorMessage } from "~/lib/services/api";
import type { ApiPsychologist } from "~/lib/auth/types";

interface InviteCompanyPsychologistModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
}

const PAGE_SIZE = 10;

export const InviteCompanyPsychologistModal: React.FC<
  InviteCompanyPsychologistModalProps
> = ({ isOpen, onClose, companyId, companyName }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] =
    useState<ApiPsychologist | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const inviteMutation = useInvitePsychologistToCompany();

  // Company admins use the company-scoped endpoint; super admins use the
  // admin endpoint (super-admin-only). Only fetch while the modal is open.
  const user = useUser();
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN";

  const adminPsychologistsQuery = usePsychologists(
    {
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearchTerm,
      orderBy: "lastName",
      type: "ascending",
    },
    { enabled: isOpen && !isCompanyAdmin },
  );

  const companyPsychologistsQuery = useCompanyPsychologists(
    companyId,
    {
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearchTerm,
    },
    { enabled: isOpen && isCompanyAdmin },
  );

  // Search and pagination are handled server-side.
  const {
    data: psychologistsResponse,
    isLoading,
    isFetching,
  } = isCompanyAdmin ? companyPsychologistsQuery : adminPsychologistsQuery;

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
      inviteMutation.reset();
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setCurrentPage(1);
      setSelectedPsychologist(null);
      setIsDropdownOpen(false);
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleInvite = async () => {
    if (!selectedPsychologist) return;

    setErrorMessage("");

    try {
      await inviteMutation.mutateAsync({
        companyId,
        psychologistId: selectedPsychologist.id,
        asCompanyAdmin: isCompanyAdmin,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to invite psychologist to company:", error);
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Failed to send invitation. Please try again.",
        ),
      );
    }
  };

  const getPsychologistName = (psychologist: ApiPsychologist) =>
    `${psychologist.firstName} ${psychologist.lastName}`;

  const getPsychologistEmail = (psychologist: ApiPsychologist) =>
    psychologist.email?.[0] ?? "—";

  const psychologists = psychologistsResponse?.results ?? [];
  const totalPages = psychologistsResponse?.pages ?? 1;

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
              <Brain size={20} />
            </div>
            Invite Psychologist
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Psychologist
            </label>
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full justify-between bg-white border border-[#E0E1E6] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1B173A] hover:border-[#5850DE] hover:bg-white focus:border-[#5850DE] focus:ring-2 focus:ring-[#5850DE]/10 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="truncate">
                  {selectedPsychologist
                    ? getPsychologistName(selectedPsychologist)
                    : "Choose a psychologist"}
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
                    ) : psychologists.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-[#8E8E93]">
                        No psychologists found.
                      </div>
                    ) : (
                      psychologists.map((psychologist) => {
                        const isSelected =
                          selectedPsychologist?.id === psychologist.id;
                        return (
                          <button
                            key={psychologist.id}
                            onClick={() => {
                              setSelectedPsychologist(psychologist);
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
                                {getPsychologistName(psychologist)}
                              </span>
                              <span className="block text-xs text-[#8E8E93] truncate">
                                {getPsychologistEmail(psychologist)}
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

          {selectedPsychologist && (
            <div className="p-3 bg-[#F8F9FB] border border-[#E0E1E6] rounded-lg text-sm text-[#60646C]">
              <p>
                <strong className="text-[#1B173A]">
                  {getPsychologistName(selectedPsychologist)}
                </strong>{" "}
                will be invited to <strong>{companyName}</strong>.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {inviteMutation.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Invitation sent successfully!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !selectedPsychologist}
              className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
            >
              {inviteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Brain size={16} className="mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={inviteMutation.isPending}
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
