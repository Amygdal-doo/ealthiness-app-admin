import { useState } from "react";
import { Copy, KeyRound, Mail, Plus, Power } from "lucide-react";
import { useCreateOrgInvite, useDeactivateOrgInvite, useOrgInvites } from "~/hooks/usePortalApi";
import { formatDate, inviteMailto, isEmail } from "~/lib/portals/format";
import type { MembershipRole, OrgInvite, OrgType } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";
import { EmptyState, Notice, Panel, Spinner, dangerBtn, inputClass, primaryBtn, secondaryBtn, tdClass, thClass } from "./PortalPage";
import { Field, PortalModal } from "./PortalModal";

/* Join codes (text + link) for an organisation, plus "send by email" which
 * opens the admin's mail app — the backend has no email endpoint for codes.
 * GET/POST /v1/org-invites, DELETE /v1/org-invites/:id */

interface JoinCodesPanelProps {
  orgType: OrgType;
  org: string | null;
  orgName: string;
  roles: { value: MembershipRole; label: string }[];
}

export function JoinCodesPanel({ orgType, org, orgName, roles }: JoinCodesPanelProps) {
  const { data, isLoading, isError, error } = useOrgInvites(orgType, org);
  const create = useCreateOrgInvite();
  const deactivate = useDeactivateOrgInvite();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<MembershipRole>(roles[0]?.value ?? "member");
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("30");
  const [maxUses, setMaxUses] = useState("");
  const [emailFor, setEmailFor] = useState<OrgInvite | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const roleLabel = (r: string) => roles.find((x) => x.value === r)?.label ?? r;

  const submit = async () => {
    if (!org) return;
    try {
      await create.mutateAsync({
        orgType,
        org,
        role,
        label: label.trim() || undefined,
        expiresInDays: Number(days) || undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
      });
      setOpen(false);
      setLabel("");
      setMaxUses("");
      setMessage("Join code created.");
    } catch {
      /* shown in modal */
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard.");
    } catch {
      setMessage(text);
    }
  };

  return (
    <Panel
      title="Join codes"
      icon={KeyRound}
      actions={
        <button className={primaryBtn} onClick={() => setOpen(true)} disabled={!org}>
          <Plus size={14} /> New code
        </button>
      }
    >
      <div className="p-4 md:p-5 pb-0">
        {message && <Notice tone="success">{message}</Notice>}
        {(isError || deactivate.isError) && (
          <Notice tone="error">{getApiErrorMessage(error ?? deactivate.error, "Couldn't load join codes.")}</Notice>
        )}
      </div>
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState icon={KeyRound} title="No active codes" text="Create a code people can type in the app or open as a link. You can email it from here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FB] border-y border-[#E0E1E6]">
              <tr>
                <th className={thClass}>Code</th>
                <th className={thClass}>Joins as</th>
                <th className={`${thClass} hidden md:table-cell`}>Uses</th>
                <th className={`${thClass} hidden md:table-cell`}>Expires</th>
                <th className={`${thClass} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E1E6]">
              {data.map((i) => (
                <tr key={i._id}>
                  <td className={tdClass}>
                    <span className="font-mono font-bold text-[#1B173A] tracking-wider">{i.displayCode}</span>
                    {i.label && <span className="block text-xs text-[#8E8E93]">{i.label}</span>}
                  </td>
                  <td className={tdClass}>{roleLabel(i.role)}</td>
                  <td className={`${tdClass} hidden md:table-cell`}>
                    {i.uses ?? 0}
                    {i.maxUses ? ` / ${i.maxUses}` : ""}
                  </td>
                  <td className={`${tdClass} hidden md:table-cell whitespace-nowrap`}>{formatDate(i.expiresAt)}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className={secondaryBtn} onClick={() => copy(i.joinLink)} title="Copy join link">
                        <Copy size={14} /> Link
                      </button>
                      <button className={secondaryBtn} onClick={() => setEmailFor(i)}>
                        <Mail size={14} /> Email
                      </button>
                      <button className={dangerBtn} onClick={() => deactivate.mutate(i._id)} disabled={deactivate.isPending} title="Switch off">
                        <Power size={14} /> Off
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
        open={open}
        title="New join code"
        busy={create.isPending}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className={secondaryBtn} onClick={() => setOpen(false)}>Cancel</button>
            <button className={primaryBtn} onClick={submit} disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create code"}
            </button>
          </>
        }
      >
        <Field label="Joins as">
          <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as MembershipRole)}>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Label (optional)" hint="Shown to staff only, e.g. “Front desk” or “Ward 3”.">
          <input className={inputClass} maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Expires in (days)">
            <input className={inputClass} type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
          <Field label="Max uses" hint="Empty = unlimited">
            <input className={inputClass} type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </Field>
        </div>
        {create.isError && <Notice tone="error">{getApiErrorMessage(create.error, "Couldn't create the code.")}</Notice>}
      </PortalModal>

      <PortalModal
        open={!!emailFor}
        title="Send code by email"
        onClose={() => setEmailFor(null)}
        footer={
          <>
            <button className={secondaryBtn} onClick={() => setEmailFor(null)}>Cancel</button>
            <a
              className={`${primaryBtn} ${isEmail(email) ? "" : "pointer-events-none opacity-50"}`}
              href={emailFor && isEmail(email) ? inviteMailto(email, orgName, emailFor) : undefined}
              onClick={() => setEmailFor(null)}
            >
              <Mail size={14} /> Open email
            </a>
          </>
        }
      >
        <p className="text-sm text-[#60646C]">
          Opens your mail app with the code <b className="font-mono">{emailFor?.displayCode}</b> and its link filled in.
        </p>
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </Field>
      </PortalModal>
    </Panel>
  );
}
