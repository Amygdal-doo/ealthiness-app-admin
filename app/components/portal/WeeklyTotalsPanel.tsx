import { Activity } from "lucide-react";
import { formatDate } from "~/lib/portals/format";
import type { ShownMetric, WeeklyTotals } from "~/lib/portals/types";
import { EmptyState, Panel, Spinner, tdClass, thClass } from "./PortalPage";

/* Weekly group averages (steps, sleep, mood). Weeks with fewer than the
 * minimum group size are withheld by the backend and shown as "—". */

const cell = (m: ShownMetric | undefined, digits = 0) =>
  !m || m.withheld || m.value === null ? "—" : m.value.toLocaleString(undefined, { maximumFractionDigits: digits });

export function WeeklyTotalsPanel({ totals, loading, title = "Weekly totals" }: {
  totals: WeeklyTotals | undefined;
  loading?: boolean;
  title?: string;
}) {
  const metrics = totals?.metrics;
  const weeks = metrics
    ? [...new Set([...metrics.steps, ...metrics.sleepHours, ...metrics.mood].map((m) => m.week))].sort().reverse()
    : [];
  const at = (rows: ShownMetric[] | undefined, w: string) => rows?.find((r) => r.week === w);

  return (
    <Panel title={title} icon={Activity}>
      {loading ? (
        <Spinner />
      ) : !totals || totals.withheld || !metrics ? (
        <EmptyState
          icon={Activity}
          title="Not enough people yet"
          text={`Totals appear once at least ${totals?.minGroupSize ?? 20} people take part, so no one can be picked out.`}
        />
      ) : weeks.length === 0 ? (
        <EmptyState icon={Activity} title="No activity logged yet" />
      ) : (
        <>
          <p className="px-4 md:px-5 pt-4 text-xs text-[#8E8E93]">
            {totals.employees} people · averages per person · weeks with fewer than {totals.minGroupSize} contributors are hidden.
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB] border-y border-[#E0E1E6]">
                <tr>
                  <th className={thClass}>Week of</th>
                  <th className={thClass}>Steps / day</th>
                  <th className={thClass}>Sleep (h)</th>
                  <th className={thClass}>Mood (0–100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E1E6]">
                {weeks.map((w) => (
                  <tr key={w}>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDate(w)}</td>
                    <td className={tdClass}>{cell(at(metrics.steps, w))}</td>
                    <td className={tdClass}>{cell(at(metrics.sleepHours, w), 1)}</td>
                    <td className={tdClass}>{cell(at(metrics.mood, w))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}
