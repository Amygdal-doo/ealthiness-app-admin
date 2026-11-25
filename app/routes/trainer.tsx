import { Link } from "react-router";
import { AlertCircle, Dumbbell, Inbox, Users, Wallet } from "lucide-react";
import type { Route } from "./+types/trainer";
import { EmptyState, Notice, Panel, PortalPage, Spinner, StatCard, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { useUser } from "~/hooks/useAuth";
import { useCareWorkspace } from "~/hooks/useTrainerApi";
import { TRAINER_ROLES } from "~/lib/portal";
import { formatDate } from "~/lib/portals/format";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Overview - Ealthiness Trainer Portal" }];
}

/* Trainer dashboard: clients in one section per gym/company + "Invited by me".
 * GET /v1/care/workspace */
export default function TrainerDashboardPage() {
  const user = useUser();
  const { data, isLoading, isError, error } = useCareWorkspace();
  const sections = data?.sections ?? [];
  const clientCount = new Set(sections.flatMap((s) => s.clients.map((c) => c.userId))).size;

  return (
    <PortalPage
      allowedRoles={TRAINER_ROLES}
      icon={Dumbbell}
      title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
      subtitle="Your clients, grouped by gym, company and the people you invited."
      actions={
        <>
          <Link to="/trainer/plans" className={secondaryBtn}>Diet plans</Link>
          <Link to="/payouts" className={secondaryBtn}><Wallet size={14} /> Payouts</Link>
        </>
      }
    >
      {isError && <Notice tone="error">{getApiErrorMessage(error, "Couldn't load your workspace.")}</Notice>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Clients" value={isLoading ? "…" : clientCount} icon={Users} />
        <StatCard label="Need attention" value={isLoading ? "…" : (data?.attention.length ?? 0)} icon={AlertCircle} />
        <StatCard label="Waiting requests" value={isLoading ? "…" : (data?.requests ?? 0)} icon={Inbox} />
      </div>

      {isLoading && <Spinner label="Loading clients..." />}

      {!!data?.attention.length && (
        <Panel title="Needs attention" icon={AlertCircle} className="mb-6">
          <ul className="divide-y divide-[#E0E1E6]">
            {data.attention.slice(0, 10).map((a) => (
              <li key={a.userId} className="p-4 md:px-5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-bold text-[#1B173A]">{a.name || "Unnamed"}</span>
                <span className="text-[#60646C]">
                  {a.reason === "not_shared"
                    ? "Hasn't chosen what to share yet"
                    : a.days === null
                      ? "Never opened the app"
                      : `Quiet for ${a.days} days`}
                  <span className="text-[#8E8E93]"> · {a.section}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {!isLoading && sections.length === 0 && (
        <Panel>
          <EmptyState icon={Users} title="No clients yet" text="Clients who join your gym, a company you coach, or your own invite code appear here." />
        </Panel>
      )}

      <div className="space-y-6">
        {sections.map((s) => (
          <Panel key={s.key} title={`${s.name} (${s.clients.length + s.more})`} icon={Users}>
            {s.clients.length === 0 ? (
              <EmptyState icon={Users} title="No clients in this section" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                    <tr>
                      <th className={thClass}>Client</th>
                      <th className={thClass}>Shares</th>
                      <th className={`${thClass} hidden md:table-cell`}>Client since</th>
                      <th className={`${thClass} hidden md:table-cell`}>Last active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E1E6]">
                    {s.clients.map((c) => (
                      <tr key={c.userId}>
                        <td className={`${tdClass} font-bold text-[#1B173A]`}>{c.name || "Unnamed"}</td>
                        <td className={tdClass}>
                          {c.sharedScopes.length ? (
                            <div className="flex flex-wrap gap-1">
                              {c.sharedScopes.map((sc) => (
                                <span key={sc} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E3F6EA] text-[#16A34A]">{sc}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#8E8E93]">Nothing yet</span>
                          )}
                        </td>
                        <td className={`${tdClass} hidden md:table-cell whitespace-nowrap`}>{formatDate(c.since)}</td>
                        <td className={`${tdClass} hidden md:table-cell whitespace-nowrap`}>{formatDate(c.lastActiveAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {s.more > 0 && <p className="p-4 text-xs text-[#8E8E93]">+{s.more} more not shown</p>}
              </div>
            )}
          </Panel>
        ))}
      </div>
    </PortalPage>
  );
}
