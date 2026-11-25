import { useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import { useDecideRequest, useMembershipRequests } from "~/hooks/usePortalApi";
import { formatDate, fullName, requestsFor } from "~/lib/portals/format";
import type { MembershipRequest, OrgType, ReviewDecision } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";
import { EmptyState, Notice, Panel, Spinner, dangerBtn, inputClass, primaryBtn, secondaryBtn, tdClass, thClass } from "./PortalPage";
import { Field, PortalModal } from "./PortalModal";

/* Join and leave requests for one organisation, with approve/reject + note.
 * GET /v1/membership/requests, POST /v1/membership/:id/decide */

export function RequestsPanel({ orgType, org }: { orgType: OrgType; org: string | null }) {
  const { data, isLoading, isError, error } = useMembershipRequests();
  const decide = useDecideRequest();
  const [target, setTarget] = useState<{ req: MembershipRequest; decision: ReviewDecision } | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const rows = requestsFor(data, orgType, org);

  const submit = async () => {
    if (!target) return;
    try {
      await decide.mutateAsync({ id: target.req._id, decision: target.decision, note });
      setMessage(`${target.decision === "approve" ? "Approved" : "Rejected"} ${fullName(target.req.user)}'s ${target.req.kind} request.`);
      setTarget(null);
      setNote("");
    } catch {
      /* shown in the modal */
    }
  };

  return (
    <Panel title={`Join & leave requests${rows.length ? ` (${rows.length})` : ""}`} icon={Inbox}>
      <div className="p-4 md:p-5 pb-0">
        {message && <Notice tone="success">{message}</Notice>}
        {isError && <Notice tone="error">{getApiErrorMessage(error, "Couldn't load requests.")}</Notice>}
      </div>
      {isLoading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState icon={Inbox} title="No waiting requests" text="People asking to join or leave will appear here. Leave requests are approved automatically after 14 days." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FB] border-y border-[#E0E1E6]">
              <tr>
                <th className={thClass}>Person</th>
                <th className={thClass}>Request</th>
                <th className={`${thClass} hidden md:table-cell`}>Requested</th>
                <th className={`${thClass} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E1E6]">
              {rows.map((r) => (
                <tr key={r._id} className="align-top">
                  <td className={tdClass}>
                    <span className="font-bold text-[#1B173A] block">{fullName(r.user)}</span>
                    <span className="text-xs text-[#8E8E93] break-all">{r.user.email ?? "—"}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="capitalize">{r.kind}</span> as {r.role}
                    {r.reason && <span className="block text-xs text-[#8E8E93] mt-1">"{r.reason}"</span>}
                    {r.kind === "leave" && r.autoApproveAt && (
                      <span className="block text-xs text-[#8E8E93]">Auto-approves {formatDate(r.autoApproveAt)}</span>
                    )}
                  </td>
                  <td className={`${tdClass} hidden md:table-cell whitespace-nowrap`}>{formatDate(r.requestedAt)}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className={primaryBtn} onClick={() => setTarget({ req: r, decision: "approve" })}>
                        <Check size={14} /> Approve
                      </button>
                      <button className={dangerBtn} onClick={() => setTarget({ req: r, decision: "reject" })}>
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

      <PortalModal
        open={!!target}
        busy={decide.isPending}
        title={target?.decision === "approve" ? "Approve request" : "Reject request"}
        onClose={() => setTarget(null)}
        footer={
          <>
            <button className={secondaryBtn} onClick={() => setTarget(null)} disabled={decide.isPending}>Cancel</button>
            <button className={target?.decision === "approve" ? primaryBtn : dangerBtn} onClick={submit} disabled={decide.isPending}>
              {decide.isPending ? "Saving..." : target?.decision === "approve" ? "Approve" : "Reject"}
            </button>
          </>
        }
      >
        {target && (
          <p className="text-sm text-[#60646C]">
            {fullName(target.req.user)} asked to {target.req.kind} {target.req.orgName ?? "this organisation"} as {target.req.role}.
          </p>
        )}
        <Field label="Note (optional)" hint="Shown to the person, e.g. why a request was rejected.">
          <textarea className={inputClass} rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {decide.isError && <Notice tone="error">{getApiErrorMessage(decide.error, "Couldn't save the decision.")}</Notice>}
      </PortalModal>
    </Panel>
  );
}
