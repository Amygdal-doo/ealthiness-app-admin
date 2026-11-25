import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { BadgeCheck, CircleAlert, ExternalLink, Receipt, Wallet } from "lucide-react";
import type { Route } from "./+types/payouts";
import { EmptyState, Notice, Panel, PortalPage, Spinner, StatCard, primaryBtn, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { useEarnings, usePayoutLink, usePayoutStatus } from "~/hooks/useTrainerApi";
import { TRAINER_ROLES } from "~/lib/portal";
import { formatDate, formatMoney, formatMonth } from "~/lib/portals/format";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Payouts - Ealthiness Trainer Portal" }];
}

/* Stripe Connect payouts. Stripe returns here: /payouts?done=1 or ?refresh=1.
 * GET status/earnings, POST onboarding/dashboard (/v1/trainer-payouts/*) */
export default function PayoutsPage() {
  const [params, setParams] = useSearchParams();
  const status = usePayoutStatus();
  const earnings = useEarnings();
  const link = usePayoutLink();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("done")) setNotice("Back from Stripe. Your payout status is refreshed below.");
    if (params.get("refresh")) setNotice("That Stripe link expired. Continue setup to get a new one.");
    if (params.get("done") || params.get("refresh")) setParams({}, { replace: true });
  }, [params, setParams]);

  const open = async (kind: "onboarding" | "dashboard") => {
    try {
      const { url } = await link.mutateAsync(kind);
      if (url) window.location.assign(url);
    } catch {
      /* shown below */
    }
  };

  const s = status.data;
  const e = earnings.data;
  const currency = e?.currency ?? "usd";

  return (
    <PortalPage
      allowedRoles={TRAINER_ROLES}
      icon={Wallet}
      title="Payouts"
      subtitle="Stripe pays your 70% of each plan sale to your bank. Your bank and identity details stay with Stripe."
    >
      {notice && <Notice tone="info">{notice}</Notice>}
      {link.isError && <Notice tone="error">{getApiErrorMessage(link.error, "Couldn't open Stripe.")}</Notice>}
      {status.isError && <Notice tone="error">{getApiErrorMessage(status.error, "Couldn't load payout status.")}</Notice>}

      <Panel title="Payout account" icon={s?.payoutsEnabled ? BadgeCheck : CircleAlert} className="mb-6">
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {status.isLoading ? (
            <Spinner />
          ) : (
            <div className="text-sm text-[#60646C]">
              {!s?.connected ? (
                <p><b className="text-[#1B173A]">Not set up.</b> Set up payouts to sell plans and get paid.</p>
              ) : s.payoutsEnabled ? (
                <p><b className="text-[#16A34A]">Payouts on.</b> Stripe can pay you.{s.needsInfo && " Stripe still asks for some details."}</p>
              ) : (
                <p><b className="text-[#B45309]">Setup incomplete.</b> Stripe needs more details before it can pay you.</p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(!s?.connected || !s.payoutsEnabled || s.needsInfo) && (
              <button className={primaryBtn} onClick={() => open("onboarding")} disabled={link.isPending}>
                <ExternalLink size={14} /> {s?.connected ? "Continue setup" : "Set up payouts"}
              </button>
            )}
            {s?.connected && (
              <button className={secondaryBtn} onClick={() => open("dashboard")} disabled={link.isPending}>
                <ExternalLink size={14} /> Stripe dashboard
              </button>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Total earned" value={earnings.isLoading ? "…" : formatMoney(e?.totalEarned, currency)} icon={Wallet} />
        <StatCard label="Plans sold" value={earnings.isLoading ? "…" : (e?.sales ?? 0)} icon={Receipt} />
      </div>

      {earnings.isError && <Notice tone="error">{getApiErrorMessage(earnings.error, "Couldn't load earnings.")}</Notice>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Earnings by month" icon={Wallet}>
          {!e?.months.length ? (
            <EmptyState icon={Wallet} title="No sales yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                  <tr>
                    <th className={thClass}>Month</th>
                    <th className={thClass}>Sales</th>
                    <th className={`${thClass} text-right`}>Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E1E6]">
                  {e.months.map((m) => (
                    <tr key={m.month}>
                      <td className={tdClass}>{formatMonth(m.month)}</td>
                      <td className={tdClass}>{m.sales}</td>
                      <td className={`${tdClass} text-right font-bold text-[#1B173A]`}>{formatMoney(m.earned, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Recent sales" icon={Receipt}>
          {!e?.recent.length ? (
            <EmptyState icon={Receipt} title="No sales yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                  <tr>
                    <th className={thClass}>Plan</th>
                    <th className={`${thClass} hidden sm:table-cell`}>Date</th>
                    <th className={`${thClass} text-right`}>You get</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E1E6]">
                  {e.recent.map((r, i) => (
                    <tr key={`${r.date}-${i}`}>
                      <td className={tdClass}>
                        {r.plan}
                        <span className="block text-xs text-[#8E8E93]">of {formatMoney(r.amount, currency)}</span>
                      </td>
                      <td className={`${tdClass} hidden sm:table-cell whitespace-nowrap`}>{formatDate(r.date)}</td>
                      <td className={`${tdClass} text-right font-bold text-[#1B173A]`}>{formatMoney(r.trainerShare, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </PortalPage>
  );
}
