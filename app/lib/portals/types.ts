/* -------------------------------------------------------------------------- */
/*  API shapes for the role portals (trainer, gym, hospital, company, super)   */
/*  Mirrors the NestJS controllers: membership, org-invite, care, gym,          */
/*  trainer-payout, org-wellbeing. Keep in step with the backend.               */
/* -------------------------------------------------------------------------- */

export type OrgType = "company" | "hospital" | "practice" | "gym";

export type MembershipRole =
  | "employee"
  | "patient"
  | "trainee"
  | "member"
  | "clinician"
  | "coach"
  | "admin";

export type MembershipStatus =
  | "invited"
  | "requested"
  | "active"
  | "leave_requested"
  | "left"
  | "removed";

/** GET /v1/membership/me */
export interface MyMembership {
  _id: string;
  user: string;
  orgType: OrgType;
  org: string;
  orgName: string | null;
  role: MembershipRole;
  status: MembershipStatus;
}

/** GET /v1/membership/requests */
export interface MembershipRequest {
  _id: string;
  kind: "join" | "leave";
  orgType: OrgType;
  org: string;
  orgName: string | null;
  role: MembershipRole;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  };
  requestedAt: string | null;
  autoApproveAt: string | null;
  reason: string | null;
}

/** GET /v1/org-invites, POST /v1/org-invites */
export interface OrgInvite {
  _id: string;
  orgType: OrgType;
  org: string;
  role: MembershipRole;
  code: string;
  displayCode: string;
  joinLink: string;
  label?: string | null;
  expiresAt?: string | null;
  maxUses?: number | null;
  uses?: number;
  active?: boolean;
}

export interface CreateOrgInvitePayload {
  orgType: OrgType;
  org: string;
  role: MembershipRole;
  label?: string;
  expiresInDays?: number;
  maxUses?: number;
}

/* ---------------------------- care workspace ----------------------------- */

export interface WorkspaceClient {
  userId: string;
  name: string;
  profileImage: { url?: string } | null;
  since: string;
  lastActiveAt: string | null;
  sharedScopes: string[];
  section: string;
}

export interface WorkspaceSection {
  key: string;
  kind: string;
  orgType: OrgType | null;
  org: string | null;
  name: string;
  clients: WorkspaceClient[];
  more: number;
}

export interface WorkspaceAttention {
  userId: string;
  name: string;
  section: string;
  reason: "not_shared" | "quiet";
  days: number | null;
}

/** GET /v1/care/workspace */
export interface CareWorkspace {
  role: string;
  sections: WorkspaceSection[];
  attention: WorkspaceAttention[];
  requests: number;
  sessions: unknown[];
}

/** GET /v1/care/hospitals/:id/patients */
export interface HospitalPatient {
  membership: { _id: string; user: string; role: string; startedAt?: string };
  person: { _id: string; firstName?: string; lastName?: string } | null;
  sharedScopes: string[];
}

/* -------------------------------- payouts -------------------------------- */

export interface PayoutStatus {
  connected: boolean;
  payoutsEnabled: boolean;
  needsInfo: boolean;
}

export interface EarningsMonth {
  month: string; // YYYY-MM
  sales: number;
  earned: number; // cents
}

/** GET /v1/trainer-payouts/earnings (amounts in cents) */
export interface Earnings {
  currency: string;
  totalEarned: number;
  sales: number;
  months: EarningsMonth[];
  recent: { plan: string; amount: number; trainerShare: number; date: string }[];
}

/** GET /v1/plan-reviews — raw diet plan documents, creator populated. */
export interface PlanForReview {
  _id: string;
  title: string;
  description?: string;
  goal?: string;
  durationDays?: number;
  dailyCalorieTarget?: number;
  price?: number;
  currency?: string;
  isFree?: boolean;
  updatedAt?: string;
  creator: { _id: string; firstName?: string; lastName?: string } | string;
}

export type ReviewDecision = "approve" | "reject";

/* ---------------------------------- gyms --------------------------------- */

export interface Gym {
  _id: string;
  name: string;
  email?: string | null;
  address?: string | null;
  contact?: string | null;
  countryId?: string | null;
  createdAt?: string;
}

export interface GymPayload {
  name: string;
  email?: string;
  address?: string;
  contact?: string;
}

export interface GymStaff {
  membershipId: string;
  user: string;
  role: MembershipRole;
  name: string;
  since: string | null;
}

/** One weekly number; withheld when too few people contributed. */
export interface ShownMetric {
  week: string;
  value: number | null;
  people: number | null;
  withheld: boolean;
}

/** Weekly totals (gym overview `totals`, GET /v1/organisation/:id/wellbeing) */
export interface WeeklyTotals {
  minGroupSize: number;
  from: string;
  to: string;
  employees: number | null;
  withheld: boolean;
  metrics: {
    steps: ShownMetric[];
    sleepHours: ShownMetric[];
    mood: ShownMetric[];
  } | null;
}

/** GET /v1/gym/:id/overview */
export interface GymOverview {
  gym: Gym;
  members: number;
  trainers: GymStaff[];
  totals: WeeklyTotals;
}
