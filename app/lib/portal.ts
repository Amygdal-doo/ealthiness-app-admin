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
