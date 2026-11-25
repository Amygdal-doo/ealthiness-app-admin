/* Pure helpers for the role portals. No React, no network — tested with
 * `npm test` (node --test, see format.test.mjs). */

/** Stripe amounts come in cents. */
export function formatMoney(cents: number | null | undefined, currency = "usd"): string {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** "2026-11" → "Nov 2026". Anything else is returned unchanged. */
export function formatMonth(month: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) return month;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function fullName(p: { firstName?: string; lastName?: string } | null | undefined): string {
  const name = `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim();
  return name || "Unnamed";
}

/** Ids from a user's admin list (may be ids or populated objects). */
export function idsOf(list: unknown[] | null | undefined): string[] {
  return (list ?? [])
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") {
        const o = x as { id?: unknown; _id?: unknown };
        return String(o.id ?? o._id ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

interface MembershipLike {
  orgType: string;
  org: string;
  orgName?: string | null;
  role: string;
  status: string;
}

/** Organisations of one type where the person is current staff in one of the roles. */
export function managedOrgs<M extends MembershipLike>(
  memberships: M[] | null | undefined,
  orgType: string,
  roles: string[],
): { id: string; name: string; role: string }[] {
  const seen = new Set<string>();
  const out: { id: string; name: string; role: string }[] = [];
  for (const m of memberships ?? []) {
    if (m.orgType !== orgType || !roles.includes(m.role)) continue;
    if (m.status !== "active" && m.status !== "leave_requested") continue;
    if (seen.has(m.org)) continue;
    seen.add(m.org);
    out.push({ id: m.org, name: m.orgName || "Unnamed", role: m.role });
  }
  return out;
}

/** Waiting join/leave requests for one organisation (or one type, if no org). */
export function requestsFor<R extends { orgType: string; org: string }>(
  requests: R[] | null | undefined,
  orgType: string,
  org?: string | null,
): R[] {
  return (requests ?? []).filter((r) => r.orgType === orgType && (!org || r.org === org));
}

export type ReviewTone = "neutral" | "pending" | "approved" | "rejected";

/** How a trainer plan's review state reads in the list. */
export function reviewBadge(
  review: string | null | undefined,
  visibility: string | null | undefined,
): { label: string; tone: ReviewTone } {
  switch (review) {
    case "pending":
      return { label: "In review", tone: "pending" };
    case "approved":
      return { label: "Approved · on sale", tone: "approved" };
    case "rejected":
      return { label: "Rejected", tone: "rejected" };
    default:
      return visibility === "public"
        ? { label: "Public", tone: "neutral" }
        : { label: "Private (my group)", tone: "neutral" };
  }
}

/** A trainer can send a plan for review unless it is already waiting or approved. */
export function canSubmitForReview(review: string | null | undefined): boolean {
  return review !== "pending" && review !== "approved";
}

/** The latest week that is not withheld, if any. */
export function latestShown<T extends { value: number | null; withheld: boolean }>(
  rows: T[] | null | undefined,
): T | null {
  const shown = (rows ?? []).filter((r) => !r.withheld && r.value !== null);
  return shown.length ? shown[shown.length - 1] : null;
}

/** A mailto: link that sends someone a join code (no backend email for codes). */
export function inviteMailto(
  email: string,
  orgName: string,
  invite: { displayCode: string; joinLink: string },
): string {
  const subject = `Join ${orgName} on Ealthiness`;
  const body =
    `You're invited to join ${orgName} on Ealthiness.\n\n` +
    `Open this link on your phone: ${invite.joinLink}\n` +
    `Or enter the code in the app: ${invite.displayCode}\n`;
  return `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Comma/space/newline separated domains → trimmed, lower-case, unique, no "@". */
export function parseDomains(input: string): string[] {
  const parts = input
    .split(/[\s,;]+/)
    .map((d) => d.trim().toLowerCase().replace(/^@/, "").replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
    .filter(Boolean);
  return [...new Set(parts)];
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
