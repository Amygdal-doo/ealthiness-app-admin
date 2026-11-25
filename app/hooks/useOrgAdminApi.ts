import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientTokens } from "~/lib/auth/client-cookies";
import { apiClient } from "~/lib/services/api";
import type {
  Gym,
  GymOverview,
  GymPayload,
  HospitalPatient,
  WeeklyTotals,
} from "~/lib/portals/types";

/* Gym admin, hospital staff and company admin portals + super admin gyms. */

const hasToken = () => !!clientTokens.get();

/* --------------------------------- gyms --------------------------------- */

/** GET /v1/gym — super admins: all; gym admins and trainers: their own. */
export function useGyms() {
  return useQuery({
    queryKey: ["gyms"],
    queryFn: async () => {
      const res = await apiClient.get<Gym[]>("/v1/gym");
      return Array.isArray(res) ? res : [];
    },
    enabled: hasToken(),
  });
}

export function useGymOverview(id: string | null | undefined) {
  return useQuery({
    queryKey: ["gym-overview", id],
    queryFn: () => apiClient.get<GymOverview>(`/v1/gym/${id}/overview`),
    enabled: hasToken() && !!id,
  });
}

export function useSaveGym() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: GymPayload }) =>
      id ? apiClient.put<Gym>(`/v1/gym/${id}`, data) : apiClient.post<Gym>("/v1/gym", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });
}

export function useDeleteGym() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/gym/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });
}

export function useInviteGymAdmin() {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      apiClient.post<{ message: string }>(`/v1/gym/${id}/admins/invite`, { email: email.trim() }),
  });
}

export function useRemoveGymPerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, membershipId }: { gymId: string; membershipId: string }) =>
      apiClient.delete(`/v1/gym/${gymId}/people/${membershipId}`),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["gym-overview", v.gymId] }),
  });
}

/* ------------------------------- hospitals ------------------------------- */

export function useHospitalPatients(hospitalId: string | null | undefined) {
  return useQuery({
    queryKey: ["hospital-patients", hospitalId],
    queryFn: async () => {
      const res = await apiClient.get<HospitalPatient[]>(
        `/v1/care/hospitals/${hospitalId}/patients`,
      );
      return Array.isArray(res) ? res : [];
    },
    enabled: hasToken() && !!hospitalId,
  });
}

/* ------------------------------- companies ------------------------------- */

export function useCompanyWellbeing(companyId: string | null | undefined) {
  return useQuery({
    queryKey: ["company-wellbeing", companyId],
    queryFn: () => apiClient.get<WeeklyTotals>(`/v1/organisation/${companyId}/wellbeing`),
    enabled: hasToken() && !!companyId,
  });
}

export function useSetEmailDomains() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, domains }: { companyId: string; domains: string[] }) =>
      apiClient.put(`/v1/company/${companyId}/email-domains`, { domains }),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["company", v.companyId] }),
  });
}
