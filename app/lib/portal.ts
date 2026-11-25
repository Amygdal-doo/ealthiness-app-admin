import type { UserRole } from "~/lib/auth/types";

// Role segment used in practitioner-scoped API routes
// (e.g. /v1/therapy-sessions/{role}/all).
export type PractitionerApiRole = "psychologist" | "doctor";

// Psychologists and doctors share the same practice pages (sessions, therapy
// plans, patients) — only the URL prefix, the guarding role and the API role
// segment differ.
export interface PractitionerPortal {
  basePath: "/psychologist" | "/doctor";
  allowedRoles: UserRole[];
  apiRole: PractitionerApiRole;
}

export const PSYCHOLOGIST_PORTAL: PractitionerPortal = {
  basePath: "/psychologist",
  allowedRoles: ["PSYCHOLOGIST", "SUPER_ADMIN"],
  apiRole: "psychologist",
};

export const DOCTOR_PORTAL: PractitionerPortal = {
  basePath: "/doctor",
  allowedRoles: ["DOCTOR", "SUPER_ADMIN"],
  apiRole: "doctor",
};

// Where each portal role lands after sign-in (admins go to /home).
export const ROLE_HOME: Partial<Record<UserRole, string>> = {
  PSYCHOLOGIST: "/psychologist",
  DOCTOR: "/doctor",
  COACH: "/trainer",
  GYM_ADMIN: "/gym",
};

export const TRAINER_ROLES: UserRole[] = ["COACH"];
export const GYM_ADMIN_ROLES: UserRole[] = ["GYM_ADMIN", "SUPER_ADMIN"];
// Hospital staff are clinicians with a hospital membership (clinician/admin).
export const HOSPITAL_STAFF_ROLES: UserRole[] = ["DOCTOR", "PSYCHOLOGIST", "SUPER_ADMIN"];
export const COMPANY_ADMIN_ROLES: UserRole[] = ["COMPANY_ADMIN", "SUPER_ADMIN"];
