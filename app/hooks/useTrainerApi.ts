import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientTokens } from "~/lib/auth/client-cookies";
import { apiClient } from "~/lib/services/api";
import type {
  CareWorkspace,
  Earnings,
  PayoutStatus,
  PlanForReview,
  ReviewDecision,
} from "~/lib/portals/types";

/* Trainer (COACH) portal + super admin plan reviews. */

const hasToken = () => !!clientTokens.get();

/** GET /v1/care/workspace — clients by section (coach, psychologist, doctor). */
export function useCareWorkspace(enabled = true) {
  return useQuery({
    queryKey: ["care-workspace"],
    queryFn: () => apiClient.get<CareWorkspace>("/v1/care/workspace"),
    enabled: hasToken() && enabled,
    staleTime: 60_000,
  });
}

export function usePayoutStatus() {
  return useQuery({
    queryKey: ["trainer-payouts", "status"],
    queryFn: () => apiClient.get<PayoutStatus>("/v1/trainer-payouts/status"),
    enabled: hasToken(),
  });
}

export function useEarnings() {
  return useQuery({
    queryKey: ["trainer-payouts", "earnings"],
    queryFn: () => apiClient.get<Earnings>("/v1/trainer-payouts/earnings"),
    enabled: hasToken(),
  });
}

/** POST onboarding/dashboard → { url } to open (Stripe-hosted). */
export function usePayoutLink() {
  return useMutation({
    mutationFn: (kind: "onboarding" | "dashboard") =>
      apiClient.post<{ url: string }>(`/v1/trainer-payouts/${kind}`),
  });
}

export function useGiftPlan() {
  return useMutation({
    mutationFn: ({ planId, client }: { planId: string; client: string }) =>
      apiClient.post<{ gifted: boolean; already: boolean }>(
        `/v1/trainer-plans/${planId}/gift`,
        { client },
      ),
  });
}

/** Sends a plan for review by making it public (the backend sets review=pending). */
export function useSubmitPlanForReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      apiClient.put(`/v1/diet-plan/${planId}`, { visibility: "public" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diet-plans"] }),
  });
}

export function usePlanReviews() {
  return useQuery({
    queryKey: ["plan-reviews"],
    queryFn: async () => {
      const res = await apiClient.get<PlanForReview[]>("/v1/plan-reviews");
      return Array.isArray(res) ? res : [];
    },
    enabled: hasToken(),
  });
}

export function useDecidePlanReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, note }: { id: string; decision: ReviewDecision; note?: string }) =>
      apiClient.post(`/v1/plan-reviews/${id}`, { decision, note: note?.trim() || undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plan-reviews"] }),
  });
}
