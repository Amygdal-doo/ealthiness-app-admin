import { useState } from "react";
import { Link } from "react-router";
import { Gift, Pencil, Plus, Send, UtensilsCrossed } from "lucide-react";
import type { Route } from "./+types/trainer.plans";
import { CreateDietPlanModal } from "~/components/modals/CreateDietPlanModal";
import { GiftPlanModal } from "~/components/portal/GiftPlanModal";
import { EmptyState, Notice, Panel, PortalPage, Spinner, primaryBtn, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { useCreatedDietPlans } from "~/hooks/useAuthApi";
import { useSubmitPlanForReview } from "~/hooks/useTrainerApi";
import { TRAINER_ROLES } from "~/lib/portal";
import { canSubmitForReview, formatDate, reviewBadge, type ReviewTone } from "~/lib/portals/format";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Diet Plans - Ealthiness Trainer Portal" }];
}

const toneClass: Record<ReviewTone, string> = {
  neutral: "bg-[#F0F0F3] text-[#60646C]",
  pending: "bg-[#FEF3C7] text-[#B45309]",
  approved: "bg-[#E3F6EA] text-[#16A34A]",
  rejected: "bg-red-50 text-red-600",
};

const price = (p: { isFree: boolean; price: number; currency: string }) =>
  p.isFree || !p.price ? "Free" : `${p.price.toFixed(2)} ${p.currency?.toUpperCase() ?? ""}`;

/* Trainer's own diet plans: create (with price), edit (detail page), send for
 * review (making a plan public puts it in the super admin queue), gift.
 * GET /v1/diet-plan/me/created, POST/PUT /v1/diet-plan, POST /v1/trainer-plans/:id/gift */
export default function TrainerPlansPage() {
  const { data: plans = [], isLoading, isError, error } = useCreatedDietPlans();
  const submit = useSubmitPlanForReview();
  const [createOpen, setCreateOpen] = useState(false);
  const [giftFor, setGiftFor] = useState<{ id: string; title: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sendForReview = async (id: string, title: string) => {
    try {
      await submit.mutateAsync(id);
      setMessage(`“${title}” was sent for review. It goes on sale once a super admin approves it.`);
    } catch {
      /* shown below */
    }
  };

  return (
    <PortalPage
      allowedRoles={TRAINER_ROLES}
      icon={UtensilsCrossed}
      title="My diet plans"
      subtitle="Public plans with a price are reviewed by Ealthiness before they go on sale. You keep 70% of each sale."
      actions={
        <button className={primaryBtn} onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New plan
        </button>
      }
    >
      {message && <Notice tone="success">{message}</Notice>}
      {isError && <Notice tone="error">{getApiErrorMessage(error, "Couldn't load your plans.")}</Notice>}
      {submit.isError && <Notice tone="error">{getApiErrorMessage(submit.error, "Couldn't send the plan for review.")}</Notice>}

      <Panel>
        {isLoading ? (
          <Spinner label="Loading plans..." />
        ) : plans.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No plans yet" text="Create a plan for your group, or a public plan to sell after review." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                <tr>
                  <th className={thClass}>Plan</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} hidden md:table-cell`}>Price</th>
                  <th className={`${thClass} hidden lg:table-cell`}>Updated</th>
                  <th className={`${thClass} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E1E6]">
                {plans.map((p) => {
                  const badge = reviewBadge(p.review, p.visibility);
                  return (
                    <tr key={p.id} className="align-top">
                      <td className={tdClass}>
                        <span className="font-bold text-[#1B173A] block">{p.title}</span>
                        <span className="text-xs text-[#8E8E93]">{p.durationDays} days · {p.dailyCalorieTarget} kcal</span>
                      </td>
                      <td className={tdClass}>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${toneClass[badge.tone]}`}>{badge.label}</span>
                        {p.review === "rejected" && p.reviewNote && (
                          <span className="block text-xs text-red-600 mt-1 max-w-xs">“{p.reviewNote}”</span>
                        )}
                        {p.status === "archived" && <span className="block text-xs text-[#8E8E93] mt-1">Archived</span>}
                      </td>
                      <td className={`${tdClass} hidden md:table-cell whitespace-nowrap`}>{price(p)}</td>
                      <td className={`${tdClass} hidden lg:table-cell whitespace-nowrap`}>{formatDate(p.updatedAt)}</td>
                      <td className={tdClass}>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link to={`/diet-plans/${p.id}`} className={secondaryBtn}><Pencil size={14} /> Edit</Link>
                          {canSubmitForReview(p.review) && (
                            <button
                              className={secondaryBtn}
                              disabled={submit.isPending}
                              onClick={() => sendForReview(p.id, p.title)}
                              title={p.review === "rejected" ? "Send again after your changes" : "Make public and send for review"}
                            >
                              <Send size={14} /> {p.review === "rejected" ? "Resubmit" : "Submit"}
                            </button>
                          )}
                          {p.review !== "rejected" && (
                            <button className={secondaryBtn} onClick={() => setGiftFor({ id: p.id, title: p.title })}>
                              <Gift size={14} /> Gift
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <CreateDietPlanModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <GiftPlanModal
        plan={giftFor}
        onClose={() => setGiftFor(null)}
        onDone={(m) => {
          setGiftFor(null);
          setMessage(m);
        }}
      />
    </PortalPage>
  );
}
