import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientTokens } from "~/lib/auth/client-cookies";
import { apiClient } from "~/lib/services/api";
import type {
  CreateOrgInvitePayload,
  MembershipRequest,
  MyMembership,
  OrgInvite,
  OrgType,
  ReviewDecision,
} from "~/lib/portals/types";

/* Shared by every portal: my memberships, join/leave requests, join codes. */

const hasToken = () => !!clientTokens.get();

export function useMyMemberships() {
  return useQuery({
    queryKey: ["membership", "me"],
    queryFn: () => apiClient.get<MyMembership[]>("/v1/membership/me"),
    enabled: hasToken(),
    staleTime: 60_000,
  });
}

/** GET /v1/membership/requests — every org the signed-in person manages. */
export function useMembershipRequests() {
  return useQuery({
    queryKey: ["membership", "requests"],
    queryFn: async () => {
      const res = await apiClient.get<MembershipRequest[]>("/v1/membership/requests");
      return Array.isArray(res) ? res : [];
    },
    enabled: hasToken(),
    staleTime: 30_000,
  });
}

export function useDecideRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, note }: { id: string; decision: ReviewDecision; note?: string }) =>
      apiClient.post(`/v1/membership/${id}/decide`, { decision, note: note?.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["membership"] });
      qc.invalidateQueries({ queryKey: ["gym-overview"] });
      qc.invalidateQueries({ queryKey: ["care-workspace"] });
    },
  });
}

export function useOrgInvites(orgType: OrgType, org: string | null | undefined) {
  return useQuery({
    queryKey: ["org-invites", orgType, org],
    queryFn: async () => {
      const res = await apiClient.get<OrgInvite[]>(
        `/v1/org-invites?orgType=${orgType}&org=${org}`,
      );
      return Array.isArray(res) ? res : [];
    },
    enabled: hasToken() && !!org,
  });
}

export function useCreateOrgInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrgInvitePayload) =>
      apiClient.post<OrgInvite>("/v1/org-invites", payload),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["org-invites", v.orgType, v.org] }),
  });
}

export function useDeactivateOrgInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/org-invites/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-invites"] }),
  });
}
