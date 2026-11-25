import { useEffect, useState } from "react";
import { AtSign, KeyRound, Mail, Send } from "lucide-react";
import type { Route } from "./+types/organisation.access";
import { JoinCodesPanel } from "~/components/portal/JoinCodesPanel";
import { OrgPicker } from "~/components/portal/OrgPicker";
import { Field } from "~/components/portal/PortalModal";
import { EmptyState, Notice, Panel, PortalPage, inputClass, primaryBtn } from "~/components/portal/PortalPage";
import { RequestsPanel } from "~/components/portal/RequestsPanel";
import { useInviteCompanyEmployee } from "~/hooks/useAuthApi";
import { useMyCompany } from "~/hooks/useMyCompany";
import { useSetEmailDomains } from "~/hooks/useOrgAdminApi";
import { COMPANY_ADMIN_ROLES } from "~/lib/portal";
import { isEmail, parseDomains } from "~/lib/portals/format";
import type { MembershipRole } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Invites & Requests - Ealthiness Company Portal" }];
}

const EMPLOYEE_ROLE: { value: MembershipRole; label: string }[] = [{ value: "employee", label: "Employee" }];

/* Company admin: invite by email (POST /v1/company/:id/invite?email=), join
 * codes (/v1/org-invites, orgType=company), join/leave requests, and work
 * email domains (PUT /v1/company/:id/email-domains). */
export default function OrganisationAccessPage() {
  const { orgs, companyId, companyName, setCompanyId, details } = useMyCompany();
  const invite = useInviteCompanyEmployee();
  const setDomains = useSetEmailDomains();
  const [email, setEmail] = useState("");
  const [domains, setDomainsText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDomainsText((details.data?.emailDomains ?? []).join(", "));
  }, [details.data?.emailDomains]);

  const sendInvite = async () => {
    if (!companyId || !isEmail(email)) return;
    try {
      await invite.mutateAsync({ companyId, email: email.trim() });
      setMessage(`Invite sent to ${email.trim()}.`);
      setEmail("");
    } catch {
      /* shown below */
    }
  };

  const saveDomains = async () => {
    if (!companyId) return;
    try {
      const list = parseDomains(domains);
      await setDomains.mutateAsync({ companyId, domains: list });
      setDomainsText(list.join(", "));
      setMessage(list.length ? `Email domains saved: ${list.join(", ")}.` : "Email domains cleared.");
    } catch {
      /* shown below */
    }
  };

  return (
    <PortalPage
      allowedRoles={COMPANY_ADMIN_ROLES}
      icon={KeyRound}
      title="Invites, requests & domains"
      subtitle={companyName ? `Who can join ${companyName}, and how.` : undefined}
    >
      <OrgPicker orgs={orgs} value={companyId} onChange={setCompanyId} label="Company" />
      {message && <Notice tone="success">{message}</Notice>}

      {!companyId ? (
        <Panel>
          <EmptyState icon={KeyRound} title="No company yet" text="You aren't an admin of any company." />
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Invite by email" icon={Mail}>
              <div className="p-4 md:p-5 space-y-3">
                <p className="text-sm text-[#60646C]">We email them a link to join as an employee (valid 24 hours).</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                  />
                  <button className={`${primaryBtn} justify-center`} onClick={sendInvite} disabled={!isEmail(email) || invite.isPending}>
                    <Send size={14} /> {invite.isPending ? "Sending..." : "Send"}
                  </button>
                </div>
                {invite.isError && <Notice tone="error">{getApiErrorMessage(invite.error, "Couldn't send the invite.")}</Notice>}
              </div>
            </Panel>

            <Panel title="Work email domains" icon={AtSign}>
              <div className="p-4 md:p-5 space-y-3">
                <Field label="Domains" hint="People who verify an address on these domains are asked to join; you approve them below. Free mail providers are refused.">
                  <input className={inputClass} placeholder="amygdal.com, amygdal.ba" value={domains} onChange={(e) => setDomainsText(e.target.value)} />
                </Field>
                <button className={primaryBtn} onClick={saveDomains} disabled={setDomains.isPending}>
                  {setDomains.isPending ? "Saving..." : "Save domains"}
                </button>
                {setDomains.isError && <Notice tone="error">{getApiErrorMessage(setDomains.error, "Couldn't save domains.")}</Notice>}
              </div>
            </Panel>
          </div>

          <JoinCodesPanel orgType="company" org={companyId} orgName={companyName || "your company"} roles={EMPLOYEE_ROLE} />
          <RequestsPanel orgType="company" org={companyId} />
        </div>
      )}
    </PortalPage>
  );
}
