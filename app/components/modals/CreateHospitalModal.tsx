import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Hospital, X, Plus } from "lucide-react";
import { Button, Input, Select } from "~/components/ui";
import { useCreateHospital, useCountries } from "~/hooks/useAuthApi";

interface CreateHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateHospitalModal: React.FC<CreateHospitalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [countryId, setCountryId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const createHospitalMutation = useCreateHospital();
  const { data: countriesResponse, isLoading: countriesLoading } = useCountries(
    {
      limit: 1000, // Get all countries
    },
  );

  const countryOptions = useMemo(
    () =>
      (countriesResponse?.results ?? [])
        .map((country) => ({ value: country.id, label: country.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countriesResponse],
  );

  const isValid =
    !!name.trim() && !!email.trim() && !!address.trim() && !!countryId;

  const handleClose = () => {
    setName("");
    setEmail("");
    setAddress("");
    setCountryId("");
    setErrorMessage("");
    onClose();
  };

  const handleCreate = async () => {
    if (!isValid) return;

    setErrorMessage("");

    try {
      await createHospitalMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        countryId,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create hospital:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create hospital. Please try again.",
      );
    }
  };

  // Reset mutation state when modal opens
  useEffect(() => {
    if (isOpen) {
      createHospitalMutation.reset();
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-[#1B173A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center">
              <Hospital size={20} />
            </div>
            Create Hospital
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
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hospital name"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter hospital email address"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter hospital address"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <Select
              value={countryId || undefined}
              onChange={setCountryId}
              options={countryOptions}
              placeholder={
                countriesLoading ? "Loading countries..." : "Select a country"
              }
              disabled={countriesLoading}
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              disabled={createHospitalMutation.isPending || !isValid}
              className="flex-1 bg-[#5850DE] hover:bg-[#4A42C7]"
            >
              {createHospitalMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Hospital
                </>
              )}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={createHospitalMutation.isPending}
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
