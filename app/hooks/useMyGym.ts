import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useGyms } from "./useOrgAdminApi";

/**
 * The gyms the signed-in person may manage (GET /v1/gym: gym admins get their
 * own, super admins all) and the selected one. ?gym=<id> preselects one.
 */
export function useMyGym() {
  const gyms = useGyms();
  const [params] = useSearchParams();
  const orgs = useMemo(
    () => (gyms.data ?? []).map((g) => ({ id: g._id, name: g.name })),
    [gyms.data],
  );
  const [gymId, setGymId] = useState<string | null>(params.get("gym"));
  const selected = orgs.find((o) => o.id === gymId) ?? orgs[0] ?? null;
  return { gyms, orgs, gymId: selected?.id ?? null, gymName: selected?.name ?? "", setGymId };
}
