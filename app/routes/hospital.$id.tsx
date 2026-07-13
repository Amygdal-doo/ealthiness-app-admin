import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/hospital.$id";
import {
  ArrowLeft,
  Hospital,
  Mail,
  MapPin,
  Globe,
  Stethoscope,
  Brain,
  CalendarDays,
  Edit,
  Save,
  X,
  Trash2,
  UserPlus,
  UserMinus,
  Star,
} from "lucide-react";
import { Card, Button, Input, Select } from "~/components/ui";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { InviteHospitalDoctorModal } from "~/components/modals/InviteHospitalDoctorModal";
import { InviteHospitalPsychologistModal } from "~/components/modals/InviteHospitalPsychologistModal";
import { useUser } from "~/hooks/useAuth";
import {
  useHospitalDetails,
  useHospitalDoctors,
  useHospitalPsychologists,
  useCountryDetails,
  useCountries,
  useUpdateHospital,
  useDeleteHospital,
  useRemoveDoctorFromHospital,
  useRemovePsychologistFromHospital,
} from "~/hooks/useAuthApi";
import type {
  ApiHospitalDoctor,
  ApiHospitalPsychologist,
} from "~/lib/auth/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hospital Details - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "View hospital details on the Ealthiness platform",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return { hospitalId: params.id };
}

export default function HospitalDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const params = useParams();
  const hospitalId = loaderData.hospitalId || params.id || "";

  const user = useUser();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    address: "",
    countryId: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteDoctorOpen, setIsInviteDoctorOpen] = useState(false);
  const [doctorToRemove, setDoctorToRemove] =
    useState<ApiHospitalDoctor | null>(null);
  const [isInvitePsychologistOpen, setIsInvitePsychologistOpen] =
    useState(false);
  const [psychologistToRemove, setPsychologistToRemove] =
    useState<ApiHospitalPsychologist | null>(null);

  const updateHospitalMutation = useUpdateHospital();
  const deleteHospitalMutation = useDeleteHospital();
  const removeDoctorMutation = useRemoveDoctorFromHospital();
  const removePsychologistMutation = useRemovePsychologistFromHospital();

  const {
    data: hospital,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useHospitalDetails(hospitalId, {
    // Stop fetching once the hospital is being (or has been) deleted, so the
    // cache removal in useDeleteHospital doesn't trigger a refetch of the
    // deleted hospital before we navigate away.
    enabled:
      !deleteHospitalMutation.isPending && !deleteHospitalMutation.isSuccess,
  });

  // Resolve the country name from the hospital's countryId.
  const { data: country } = useCountryDetails(hospital?.countryId ?? "");

  // Doctors and psychologists assigned to this hospital. Disabled during
  // deletion for the same reason as the details query.
  const { data: hospitalDoctors, isLoading: doctorsLoading } =
    useHospitalDoctors(hospitalId, {
      enabled:
        !deleteHospitalMutation.isPending && !deleteHospitalMutation.isSuccess,
    });

  const { data: hospitalPsychologists, isLoading: psychologistsLoading } =
    useHospitalPsychologists(hospitalId, {
      enabled:
        !deleteHospitalMutation.isPending && !deleteHospitalMutation.isSuccess,
    });

  // Countries for the edit form dropdown.
  const { data: countriesResponse, isLoading: countriesLoading } = useCountries(
    {
      limit: 1000, // Get all countries
    },
  );

  const countryOptions = useMemo(
    () =>
      (countriesResponse?.results ?? [])
        .map((c) => ({ value: c.id, label: c.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countriesResponse],
  );

  // Initialize form when hospital data loads
  useEffect(() => {
    if (hospital) {
      setEditForm({
        name: hospital.name,
        email: hospital.email,
        address: hospital.address,
        countryId: hospital.countryId,
      });
    }
  }, [hospital]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMessage("");
    if (hospital) {
      setEditForm({
        name: hospital.name,
        email: hospital.email,
        address: hospital.address,
        countryId: hospital.countryId,
      });
    }
  };

  const handleSave = async () => {
    if (!hospital) return;

    const updateData: {
      name?: string;
      email?: string;
      address?: string;
      countryId?: string;
    } = {};

    // Only include fields that have changed
    if (editForm.name.trim() !== hospital.name)
      updateData.name = editForm.name.trim();
    if (editForm.email.trim() !== hospital.email)
      updateData.email = editForm.email.trim();
    if (editForm.address.trim() !== hospital.address)
      updateData.address = editForm.address.trim();
    if (editForm.countryId !== hospital.countryId)
      updateData.countryId = editForm.countryId;

    setErrorMessage("");

    try {
      // Only make request if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateHospitalMutation.mutateAsync({
          hospitalId,
          data: updateData,
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update hospital:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update hospital. Please try again.",
      );
    }
  };

  const handleConfirmDelete = () => {
    deleteHospitalMutation.mutate(hospitalId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate("/hospitals");
      },
    });
  };

  const handleConfirmRemoveDoctor = () => {
    if (!doctorToRemove) return;
    removeDoctorMutation.mutate(
      { hospitalId, doctorId: doctorToRemove._id },
      {
        onSuccess: () => setDoctorToRemove(null),
      },
    );
  };

  const handleConfirmRemovePsychologist = () => {
    if (!psychologistToRemove) return;
    removePsychologistMutation.mutate(
      { hospitalId, psychologistId: psychologistToRemove._id },
      {
        onSuccess: () => setPsychologistToRemove(null),
      },
    );
  };

  const isEditFormValid =
    !!editForm.name.trim() &&
    !!editForm.email.trim() &&
    !!editForm.address.trim() &&
    !!editForm.countryId;

  const isDeleting =
    deleteHospitalMutation.isPending || deleteHospitalMutation.isSuccess;

  if (!user || isLoading || (isDeleting && !hospital)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">
            {!user ? "Loading..." : "Loading hospital details..."}
          </span>
        </div>
      </div>
    );
  }

  if (isError || !hospital) {
    return (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
          <AppSidebar user={user} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Hospital Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The hospital you're looking for could not be found.
              </p>
              <Link to="/hospitals" className="text-blue-500 hover:underline">
                Back to Hospitals
              </Link>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

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
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 pb-12">
              <Link
                to="/hospitals"
                className="mb-6 flex items-center text-[#5850DE] font-bold hover:bg-[#F0F0F3] px-4 py-2 rounded-xl transition w-fit gap-2"
              >
                <ArrowLeft size={18} />
                Back to Hospitals
              </Link>

              {/* Hero banner */}
              <div className="bg-[#1B173A] rounded-[32px] p-8 text-white shadow-2xl mb-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 border border-[#38383A]">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#5850DE]/40 to-transparent"></div>

                <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] flex items-center justify-center shadow-[0_0_40px_rgba(88,80,222,0.5)] border-4 border-[#1B173A]">
                  <Hospital size={48} />
                </div>

                <div className="relative z-10 text-center md:text-left flex-1">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h2 className="text-4xl font-extrabold">{hospital.name}</h2>
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit hospital"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="Delete hospital"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[#8E8E93] font-medium mb-6 text-lg">
                    {country?.name ?? "—"} • Created{" "}
                    {new Date(hospital.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Doctors
                      </p>
                      <p className="font-bold text-xl">
                        {hospital.doctors.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold">
                        Psychologists
                      </p>
                      <p className="font-bold text-xl">
                        {hospital.psychologists.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact information / Edit form */}
                <Card className="p-8">
                  <h3 className="text-xl font-extrabold text-[#1B173A] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                      {isEditing ? <Edit size={20} /> : <Mail size={20} />}
                    </div>
                    {isEditing
                      ? "Edit Hospital Information"
                      : "Contact Information"}
                  </h3>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                          Name
                        </label>
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter hospital name"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Enter hospital email address"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                          Address
                        </label>
                        <Input
                          value={editForm.address}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Enter hospital address"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                          Country
                        </label>
                        <Select
                          value={editForm.countryId || undefined}
                          onChange={(value) =>
                            setEditForm((prev) => ({
                              ...prev,
                              countryId: value,
                            }))
                          }
                          options={countryOptions}
                          placeholder={
                            countriesLoading
                              ? "Loading countries..."
                              : "Select a country"
                          }
                          disabled={countriesLoading}
                        />
                      </div>

                      {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">{errorMessage}</p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-[#E0E1E6]">
                        <Button
                          onClick={handleSave}
                          disabled={
                            updateHospitalMutation.isPending || !isEditFormValid
                          }
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Save size={16} className="mr-2" />
                          {updateHospitalMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          disabled={updateHospitalMutation.isPending}
                          className="flex-1"
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                        <div className="flex items-center gap-3">
                          <Mail className="text-[#5850DE]" size={20} />
                          <span className="font-medium text-[#1B173A]">
                            Email
                          </span>
                        </div>
                        <span className="font-bold text-[#1B173A]">
                          {hospital.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                        <div className="flex items-center gap-3">
                          <MapPin className="text-[#248FEC]" size={20} />
                          <span className="font-medium text-[#1B173A]">
                            Address
                          </span>
                        </div>
                        <span className="font-bold text-[#1B173A] text-right">
                          {hospital.address}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                        <div className="flex items-center gap-3">
                          <Globe className="text-[#4DAB46]" size={20} />
                          <span className="font-medium text-[#1B173A]">
                            Country
                          </span>
                        </div>
                        <span className="font-bold text-[#1B173A]">
                          {country?.name ?? "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="text-[#FFB900]" size={20} />
                          <span className="font-medium text-[#1B173A]">
                            Last Updated
                          </span>
                        </div>
                        <span className="font-bold text-[#1B173A]">
                          {new Date(hospital.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Staff */}
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-extrabold text-[#1B173A] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E5F6E4] text-[#4DAB46] flex items-center justify-center">
                        <Stethoscope size={20} />
                      </div>
                      Staff
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInviteDoctorOpen(true)}
                      >
                        <UserPlus size={16} className="mr-2" />
                        Invite Doctor
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInvitePsychologistOpen(true)}
                      >
                        <UserPlus size={16} className="mr-2" />
                        Invite Psychologist
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Doctors */}
                    <div>
                      <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Stethoscope size={14} className="text-[#5850DE]" />
                        Doctors ({hospitalDoctors?.length ?? 0})
                      </p>

                      {doctorsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-5 h-5 border-2 border-[#5850DE] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : !hospitalDoctors || hospitalDoctors.length === 0 ? (
                        <p className="text-sm text-[#60646C] p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                          No doctors have been added to this hospital yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {hospitalDoctors.map((doctor) => (
                            <div
                              key={doctor._id}
                              className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold shrink-0">
                                  {doctor.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-[#1B173A] leading-tight block truncate">
                                    {doctor.firstName} {doctor.lastName}
                                  </span>
                                  <span className="text-xs text-[#8E8E93] font-medium block truncate">
                                    {doctor.email[0] ?? "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1 font-medium text-[#60646C]">
                                  <Star size={14} className="text-[#FFB900]" />
                                  {doctor.rating}
                                </div>
                                <button
                                  onClick={() => setDoctorToRemove(doctor)}
                                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove doctor from hospital"
                                >
                                  <UserMinus size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Psychologists */}
                    <div>
                      <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Brain size={14} className="text-[#248FEC]" />
                        Psychologists ({hospitalPsychologists?.length ?? 0})
                      </p>

                      {psychologistsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-5 h-5 border-2 border-[#5850DE] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : !hospitalPsychologists ||
                        hospitalPsychologists.length === 0 ? (
                        <p className="text-sm text-[#60646C] p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                          No psychologists have been added to this hospital
                          yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {hospitalPsychologists.map((psychologist) => (
                            <div
                              key={psychologist._id}
                              className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#248FEC] flex items-center justify-center font-bold shrink-0">
                                  {psychologist.firstName
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-[#1B173A] leading-tight block truncate">
                                    {psychologist.firstName}{" "}
                                    {psychologist.lastName}
                                  </span>
                                  <span className="text-xs text-[#8E8E93] font-medium block truncate">
                                    {psychologist.email[0] ?? "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1 font-medium text-[#60646C]">
                                  <Star size={14} className="text-[#FFB900]" />
                                  {psychologist.rating}
                                </div>
                                <button
                                  onClick={() =>
                                    setPsychologistToRemove(psychologist)
                                  }
                                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove psychologist from hospital"
                                >
                                  <UserMinus size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteHospitalDoctorModal
        isOpen={isInviteDoctorOpen}
        onClose={() => setIsInviteDoctorOpen(false)}
        hospitalId={hospitalId}
        hospitalName={hospital.name}
      />

      <InviteHospitalPsychologistModal
        isOpen={isInvitePsychologistOpen}
        onClose={() => setIsInvitePsychologistOpen(false)}
        hospitalId={hospitalId}
        hospitalName={hospital.name}
      />

      <ConfirmDeleteModal
        isOpen={psychologistToRemove !== null}
        onClose={() => setPsychologistToRemove(null)}
        onConfirm={handleConfirmRemovePsychologist}
        isDeleting={removePsychologistMutation.isPending}
        title="Remove Psychologist"
        confirmLabel="Remove Psychologist"
        description={
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-[#1B173A]">
              {psychologistToRemove?.firstName}{" "}
              {psychologistToRemove?.lastName}
            </span>{" "}
            from <strong>{hospital.name}</strong>?
          </>
        }
      />

      <ConfirmDeleteModal
        isOpen={doctorToRemove !== null}
        onClose={() => setDoctorToRemove(null)}
        onConfirm={handleConfirmRemoveDoctor}
        isDeleting={removeDoctorMutation.isPending}
        title="Remove Doctor"
        confirmLabel="Remove Doctor"
        description={
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-[#1B173A]">
              {doctorToRemove?.firstName} {doctorToRemove?.lastName}
            </span>{" "}
            from <strong>{hospital.name}</strong>?
          </>
        }
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteHospitalMutation.isPending}
        title="Delete Hospital"
        confirmLabel="Delete Hospital"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#1B173A]">
              {hospital.name}
            </span>
            ? This action cannot be undone.
          </>
        }
      />
    </RoleGuard>
  );
}
