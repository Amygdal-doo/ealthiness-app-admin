import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useUser } from "./useAuth";
import { useCompanyDetails } from "./useAuthApi";
import { idsOf } from "~/lib/portals/format";

/**
 * The company the company admin works on: one of user.adminCompanies, or
 * ?company=<id> (lets a super admin open any company's portal).
 */
export function useMyCompany() {
  const user = useUser();
  const [params] = useSearchParams();
  const fromUrl = params.get("company");

  const orgs = useMemo(() => {
    const list = (user?.adminCompanies ?? []) as unknown[];
    const ids = idsOf(list);
    const named = ids.map((id, i) => {
      const raw = list[i] as { name?: string } | string;
      return { id, name: typeof raw === "object" && raw?.name ? raw.name : `Company ${i + 1}` };
    });
    if (fromUrl && !ids.includes(fromUrl)) named.unshift({ id: fromUrl, name: "Selected company" });
    return named;
  }, [user?.adminCompanies, fromUrl]);

  const [picked, setPicked] = useState<string | null>(fromUrl);
  const companyId = orgs.find((o) => o.id === picked)?.id ?? orgs[0]?.id ?? null;
  const details = useCompanyDetails(companyId ?? "");
  const companyName = details.data?.name ?? orgs.find((o) => o.id === companyId)?.name ?? "";
  // Prefer the real name of the selected company in the picker.
  const pickerOrgs = orgs.map((o) => (o.id === companyId && details.data?.name ? { ...o, name: details.data.name } : o));

  return { orgs: pickerOrgs, companyId, companyName, setCompanyId: setPicked, details };
}
