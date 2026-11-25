import { useMemo, useState } from "react";
import { Hospital, Users } from "lucide-react";
import type { Route } from "./+types/hospital-staff";
import { JoinCodesPanel } from "~/components/portal/JoinCodesPanel";
import { OrgPicker } from "~/components/portal/OrgPicker";
import { EmptyState, Notice, Panel, PortalPage, Spinner, tdClass, thClass } from "~/components/portal/PortalPage";
import { RequestsPanel } from "~/components/portal/RequestsPanel";
import { useHospitalPatients } from "~/hooks/useOrgAdminApi";
import { useMyMemberships } from "~/hooks/usePortalApi";
import { HOSPITAL_STAFF_ROLES } from "~/lib/portal";
import { formatDate, fullName, managedOrgs } from "~/lib/portals/format";
import type { MembershipRole } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Hospital - Ealthiness Staff Portal" }];
}

const PATIENT_ROLE: { value: MembershipRole; label: string }[] = [{ value: "patient", label: "Patient" }];

/* Hospital staff (clinicians and hospital admins): patients with what each
 * shares with the hospital, patient join codes, join/leave requests.
 * GET /v1/membership/me, GET /v1/care/hospitals/:id/patients, /v1/org-invites,
 * /v1/membership/requests. */
export default function HospitalStaffPage() {
  const memberships = useMyMemberships();
  const hospitals = useMemo(() => managedOrgs(memberships.data, "hospital", ["admin", "clinician"]), [memberships.data]);
  const [picked, setPicked] = useState<string | null>(null);
  const current = hospitals.find((h) => h.id === picked) ?? hospitals[0] ?? null;
  const patients = useHospitalPatients(current?.id);

  return (
    <PortalPage
      allowedRoles={HOSPITAL_STAFF_ROLES}
      icon={Hospital}
      title={current?.name ?? "Hospital"}
      subtitle={current ? `You are ${current.role === "admin" ? "a hospital admin" : "a clinician"} here.` : "Your hospital work."}
    >
      <OrgPicker orgs={hospitals} value={current?.id ?? null} onChange={setPicked} label="Hospital" />
      {memberships.isError && <Notice tone="error">{getApiErrorMessage(memberships.error, "Couldn't load your hospitals.")}</Notice>}

      {memberships.isLoading ? (
        <Spinner label="Loading..." />
      ) : !current ? (
        <Panel>
          <EmptyState icon={Hospital} title="No hospital yet" text="When a hospital adds you as a clinician or admin, it appears here." />
        </Panel>
      ) : (
        <div className="space-y-6">
          <Panel title={`Patients${patients.data ? ` (${patients.data.length})` : ""}`} icon={Users}>
            {patients.isError && (
              <div className="p-4 md:p-5 pb-0">
                <Notice tone="error">{getApiErrorMessage(patients.error, "Couldn't load patients.")}</Notice>
              </div>
            )}
            {patients.isLoading ? (
              <Spinner />
            ) : !patients.data?.length ? (
              <EmptyState icon={Users} title="No patients yet" text="Share a patient join code below." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className={thClass}>Patient</th>
                      <th className={thClass}>Shares with hospital</th>
                      <th className={`${thClass} hidden sm:table-cell`}>Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {patients.data.map((p) => (
                      <tr key={p.membership._id}>
                        <td className={`${tdClass} font-bold text-[#1B173A]`}>{fullName(p.person)}</td>
                        <td className={tdClass}>
                          {p.sharedScopes.length ? p.sharedScopes.join(", ") : <span className="text-[#8E8E93]">Nothing yet</span>}
                        </td>
                        <td className={`${tdClass} hidden sm:table-cell whitespace-nowrap`}>{formatDate(p.membership.startedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <JoinCodesPanel orgType="hospital" org={current.id} orgName={current.name} roles={PATIENT_ROLE} />
          <RequestsPanel orgType="hospital" org={current.id} />
        </div>
      )}
    </PortalPage>
  );
}
