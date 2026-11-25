import { useState } from "react";
import { Link } from "react-router";
import { Building, Dumbbell, UserMinus, Users } from "lucide-react";
import type { Route } from "./+types/gym";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { OrgPicker } from "~/components/portal/OrgPicker";
import { EmptyState, Notice, Panel, PortalPage, Spinner, StatCard, dangerBtn, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { WeeklyTotalsPanel } from "~/components/portal/WeeklyTotalsPanel";
import { useMyGym } from "~/hooks/useMyGym";
import { useGymOverview, useRemoveGymPerson } from "~/hooks/useOrgAdminApi";
import { GYM_ADMIN_ROLES } from "~/lib/portal";
import { formatDate } from "~/lib/portals/format";
import type { GymStaff } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Gym Overview - Ealthiness Gym Portal" }];
}

/* Gym admin overview: member count, trainers/admins, weekly member totals,
 * take a trainer out. GET /v1/gym, GET /v1/gym/:id/overview,
 * DELETE /v1/gym/:id/people/:membershipId */
export default function GymOverviewPage() {
  const { gyms, orgs, gymId, gymName, setGymId } = useMyGym();
  const overview = useGymOverview(gymId);
  const remove = useRemoveGymPerson();
  const [target, setTarget] = useState<GymStaff | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const o = overview.data;

  const confirmRemove = async () => {
    if (!target || !gymId) return;
    try {
      await remove.mutateAsync({ gymId, membershipId: target.membershipId });
      setMessage(`${target.name || "They"} no longer belong to ${gymName}.`);
      setTarget(null);
    } catch {
      /* shown below */
    }
  };

  return (
    <PortalPage
      allowedRoles={GYM_ADMIN_ROLES}
      icon={Dumbbell}
      title={gymName || "My gym"}
      subtitle="Members, trainers and weekly totals. You see totals only, never one member's data."
      actions={<Link to="/gym/people" className={secondaryBtn}><Users size={14} /> Invites & requests</Link>}
    >
      <OrgPicker orgs={orgs} value={gymId} onChange={setGymId} label="Gym" />
      {message && <Notice tone="success">{message}</Notice>}
      {(gyms.isError || overview.isError) && (
        <Notice tone="error">{getApiErrorMessage(gyms.error ?? overview.error, "Couldn't load your gym.")}</Notice>
      )}
      {remove.isError && <Notice tone="error">{getApiErrorMessage(remove.error, "Couldn't remove this person.")}</Notice>}

      {gyms.isLoading ? (
        <Spinner label="Loading gym..." />
      ) : !orgs.length ? (
        <Panel>
          <EmptyState icon={Building} title="No gym yet" text="Once Ealthiness adds you as a gym admin, your gym appears here." />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard label="Members" value={overview.isLoading ? "…" : (o?.members ?? 0)} icon={Users} />
            <StatCard label="Trainers" value={overview.isLoading ? "…" : (o?.trainers.filter((t) => t.role === "coach").length ?? 0)} icon={Dumbbell} />
          </div>

          <Panel title="Trainers & admins" icon={Dumbbell} className="mb-6">
            {overview.isLoading ? (
              <Spinner />
            ) : !o?.trainers.length ? (
              <EmptyState icon={Dumbbell} title="No trainers yet" text="Create a trainer join code under Invites & requests." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className={thClass}>Name</th>
                      <th className={thClass}>Role</th>
                      <th className={`${thClass} hidden sm:table-cell`}>Since</th>
                      <th className={`${thClass} text-right`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {o.trainers.map((t) => (
                      <tr key={t.membershipId}>
                        <td className={`${tdClass} font-bold text-[#1B173A]`}>{t.name || "Unnamed"}</td>
                        <td className={`${tdClass} capitalize`}>{t.role === "coach" ? "Trainer" : t.role}</td>
                        <td className={`${tdClass} hidden sm:table-cell whitespace-nowrap`}>{formatDate(t.since)}</td>
                        <td className={`${tdClass} text-right`}>
                          <button className={dangerBtn} onClick={() => setTarget(t)}>
                            <UserMinus size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <WeeklyTotalsPanel totals={o?.totals} loading={overview.isLoading} title="Members — weekly totals" />
        </>
      )}

      <ConfirmDeleteModal
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={confirmRemove}
        isDeleting={remove.isPending}
        title="Remove from gym"
        description={`${target?.name || "This person"} will no longer be part of ${gymName}.`}
        confirmLabel="Remove"
      />
    </PortalPage>
  );
}
