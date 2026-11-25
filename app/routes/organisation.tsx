import { useState } from "react";
import { Link } from "react-router";
import { Building2, ChevronLeft, ChevronRight, KeyRound, Users } from "lucide-react";
import type { Route } from "./+types/organisation";
import { OrgPicker } from "~/components/portal/OrgPicker";
import { EmptyState, Notice, Panel, PortalPage, Spinner, StatCard, inputClass, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { WeeklyTotalsPanel } from "~/components/portal/WeeklyTotalsPanel";
import { useCompanyUsers } from "~/hooks/useAuthApi";
import { useMyCompany } from "~/hooks/useMyCompany";
import { useCompanyWellbeing } from "~/hooks/useOrgAdminApi";
import { COMPANY_ADMIN_ROLES } from "~/lib/portal";
import { formatDate, fullName } from "~/lib/portals/format";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Organisation - Ealthiness Company Portal" }];
}

const PAGE_SIZE = 20;

/* Company admin: employees and weekly wellbeing totals (never one person's data).
 * GET /v1/admin/company/:id/users?userType=employees, GET /v1/organisation/:id/wellbeing */
export default function OrganisationPage() {
  const { orgs, companyId, companyName, setCompanyId } = useMyCompany();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const employees = useCompanyUsers(companyId ?? "", { userType: "employees", page, limit: PAGE_SIZE, search });
  const wellbeing = useCompanyWellbeing(companyId);
  const pages = employees.data?.pages ?? 1;

  return (
    <PortalPage
      allowedRoles={COMPANY_ADMIN_ROLES}
      icon={Building2}
      title={companyName || "My organisation"}
      subtitle="Your employees and how the team is doing, as group totals only."
      actions={
        <Link to={`/organisation/access${companyId ? `?company=${companyId}` : ""}`} className={secondaryBtn}>
          <KeyRound size={14} /> Invites, requests & domains
        </Link>
      }
    >
      <OrgPicker orgs={orgs} value={companyId} onChange={(id) => { setCompanyId(id); setPage(1); }} label="Company" />

      {!companyId ? (
        <Panel>
          <EmptyState icon={Building2} title="No company yet" text="You aren't an admin of any company." />
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Employees" value={employees.isLoading ? "…" : (employees.data?.total ?? 0)} icon={Users} />
            <StatCard label="Taking part in totals" value={wellbeing.isLoading ? "…" : (wellbeing.data?.employees ?? "Too few")} icon={Users} />
          </div>

          <Panel
            title="Employees"
            icon={Users}
            actions={
              <input
                className={`${inputClass} sm:w-64`}
                placeholder="Search employees"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            }
          >
            {employees.isError && (
              <div className="p-4 md:p-5 pb-0">
                <Notice tone="error">{getApiErrorMessage(employees.error, "Couldn't load employees.")}</Notice>
              </div>
            )}
            {employees.isLoading ? (
              <Spinner />
            ) : !employees.data?.results.length ? (
              <EmptyState icon={Users} title="No employees found" text="Invite people by email or a join code." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className={thClass}>Name</th>
                      <th className={`${thClass} hidden sm:table-cell`}>Email</th>
                      <th className={`${thClass} hidden md:table-cell`}>Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {employees.data.results.map((u) => (
                      <tr key={u.id}>
                        <td className={`${tdClass} font-bold text-[#1B173A]`}>{fullName(u)}</td>
                        <td className={`${tdClass} hidden sm:table-cell break-all`}>{u.email?.[0] ?? "—"}</td>
                        <td className={`${tdClass} hidden md:table-cell whitespace-nowrap`}>{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {pages > 1 && (
              <div className="p-4 flex items-center justify-between border-t border-[#E0E1E6]">
                <span className="text-sm text-[#60646C]">Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button className={secondaryBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></button>
                  <button className={secondaryBtn} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </Panel>

          {wellbeing.isError && <Notice tone="error">{getApiErrorMessage(wellbeing.error, "Couldn't load wellbeing totals.")}</Notice>}
          <WeeklyTotalsPanel totals={wellbeing.data} loading={wellbeing.isLoading} title="Team wellbeing — weekly totals" />
        </div>
      )}
    </PortalPage>
  );
}
