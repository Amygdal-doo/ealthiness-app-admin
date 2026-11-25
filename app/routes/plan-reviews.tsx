import { useState } from "react";
import { Link } from "react-router";
import { Check, ClipboardList, Eye, X } from "lucide-react";
import type { Route } from "./+types/plan-reviews";
import { Field, PortalModal } from "~/components/portal/PortalModal";
import { EmptyState, Notice, Panel, PortalPage, Spinner, dangerBtn, inputClass, primaryBtn, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { useDecidePlanReview, usePlanReviews } from "~/hooks/useTrainerApi";
import { formatDate, fullName } from "~/lib/portals/format";
import type { PlanForReview, ReviewDecision } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Plan Reviews - Ealthiness Admin Portal" }];
}

const trainer = (p: PlanForReview) => (typeof p.creator === "object" ? fullName(p.creator) : "Trainer");
const price = (p: PlanForReview) =>
  p.isFree || !p.price ? "Free" : `${p.price.toFixed(2)} ${(p.currency ?? "").toUpperCase()}`;

/* Super admin queue of trainer plans waiting to go on sale (oldest first).
 * GET /v1/plan-reviews, POST /v1/plan-reviews/:id { decision, note } */
export default function PlanReviewsPage() {
  const { data = [], isLoading, isError, error } = usePlanReviews();
  const decide = useDecidePlanReview();
  const [target, setTarget] = useState<{ plan: PlanForReview; decision: ReviewDecision } | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!target) return;
    if (target.decision === "reject" && !note.trim()) return;
    try {
      await decide.mutateAsync({ id: target.plan._id, decision: target.decision, note });
      setMessage(`“${target.plan.title}” ${target.decision === "approve" ? "approved and on sale" : "rejected"}.`);
      setTarget(null);
      setNote("");
    } catch {
      /* shown in modal */
    }
  };

  return (
    <PortalPage
      allowedRoles={["SUPER_ADMIN"]}
      icon={ClipboardList}
      title="Plan reviews"
      subtitle="Trainer plans for sale wait here until you approve them. A rejection note is shown to the trainer."
    >
      {message && <Notice tone="success">{message}</Notice>}
      {isError && <Notice tone="error">{getApiErrorMessage(error, "Couldn't load the review queue.")}</Notice>}

      <Panel>
        {isLoading ? (
          <Spinner label="Loading plans..." />
        ) : data.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nothing to review" text="Plans trainers submit for sale appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                <tr>
                  <th className={thClass}>Plan</th>
                  <th className={`${thClass} hidden md:table-cell`}>Trainer</th>
                  <th className={`${thClass} hidden sm:table-cell`}>Price</th>
                  <th className={`${thClass} hidden lg:table-cell`}>Submitted</th>
                  <th className={`${thClass} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E1E6]">
                {data.map((p) => (
                  <tr key={p._id} className="align-top">
                    <td className={tdClass}>
                      <span className="font-bold text-[#1B173A] block">{p.title}</span>
                      <span className="text-xs text-[#8E8E93]">
                        {p.durationDays ?? "?"} days · {p.dailyCalorieTarget ?? "?"} kcal
                      </span>
                      {p.description && <p className="text-xs text-[#60646C] mt-1 max-w-md line-clamp-2">{p.description}</p>}
                    </td>
                    <td className={`${tdClass} hidden md:table-cell`}>{trainer(p)}</td>
                    <td className={`${tdClass} hidden sm:table-cell whitespace-nowrap`}>{price(p)}</td>
                    <td className={`${tdClass} hidden lg:table-cell whitespace-nowrap`}>{formatDate(p.updatedAt)}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link to={`/diet-plans/${p._id}`} className={secondaryBtn}><Eye size={14} /> Open</Link>
                        <button className={primaryBtn} onClick={() => setTarget({ plan: p, decision: "approve" })}>
                          <Check size={14} /> Approve
                        </button>
                        <button className={dangerBtn} onClick={() => setTarget({ plan: p, decision: "reject" })}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <PortalModal
        open={!!target}
        busy={decide.isPending}
        title={target?.decision === "approve" ? "Approve plan" : "Reject plan"}
        onClose={() => setTarget(null)}
        footer={
          <>
            <button className={secondaryBtn} onClick={() => setTarget(null)} disabled={decide.isPending}>Cancel</button>
            <button
              className={target?.decision === "approve" ? primaryBtn : dangerBtn}
              onClick={submit}
              disabled={decide.isPending || (target?.decision === "reject" && !note.trim())}
            >
              {decide.isPending ? "Saving..." : target?.decision === "approve" ? "Approve" : "Reject"}
            </button>
          </>
        }
      >
        {target && (
          <p className="text-sm text-[#60646C]">
            “{target.plan.title}” by {trainer(target.plan)} · {price(target.plan)}
          </p>
        )}
        <Field
          label={target?.decision === "reject" ? "Reason (required)" : "Note (optional)"}
          hint="The trainer sees this note."
        >
          <textarea className={inputClass} rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {decide.isError && <Notice tone="error">{getApiErrorMessage(decide.error, "Couldn't save the review.")}</Notice>}
      </PortalModal>
    </PortalPage>
  );
}
