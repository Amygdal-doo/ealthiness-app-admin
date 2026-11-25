import { Users } from "lucide-react";
import type { Route } from "./+types/gym.people";
import { JoinCodesPanel } from "~/components/portal/JoinCodesPanel";
import { OrgPicker } from "~/components/portal/OrgPicker";
import { Notice, PortalPage, Spinner } from "~/components/portal/PortalPage";
import { RequestsPanel } from "~/components/portal/RequestsPanel";
import { useMyGym } from "~/hooks/useMyGym";
import { GYM_ADMIN_ROLES } from "~/lib/portal";
import type { MembershipRole } from "~/lib/portals/types";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Invites & Requests - Ealthiness Gym Portal" }];
}

const GYM_ROLES: { value: MembershipRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "coach", label: "Trainer" },
];

/* Gym admin: join codes for members/trainers (+ email them) and join/leave
 * requests. /v1/org-invites (orgType=gym), /v1/membership/requests|:id/decide */
export default function GymPeoplePage() {
  const { gyms, orgs, gymId, gymName, setGymId } = useMyGym();

  return (
    <PortalPage
      allowedRoles={GYM_ADMIN_ROLES}
      icon={Users}
      title="Invites & requests"
      subtitle="Invite members and trainers with a code or link, and answer join and leave requests."
    >
      <OrgPicker orgs={orgs} value={gymId} onChange={setGymId} label="Gym" />
      {gyms.isLoading ? (
        <Spinner />
      ) : !gymId ? (
        <Notice tone="info">You don't run a gym yet.</Notice>
      ) : (
        <div className="space-y-6">
          <JoinCodesPanel orgType="gym" org={gymId} orgName={gymName} roles={GYM_ROLES} />
          <RequestsPanel orgType="gym" org={gymId} />
        </div>
      )}
    </PortalPage>
  );
}
