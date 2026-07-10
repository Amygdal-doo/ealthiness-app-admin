import type { UserRole } from "~/lib/auth/types";

// Psychologists and doctors share the same practice pages (sessions, therapy
// plans, patients) — only the URL prefix and the guarding role differ.
export interface PractitionerPortal {
  basePath: "/psychologist" | "/doctor";
  allowedRoles: UserRole[];
}

export const PSYCHOLOGIST_PORTAL: PractitionerPortal = {
  basePath: "/psychologist",
  allowedRoles: ["PSYCHOLOGIST", "SUPER_ADMIN"],
};

export const DOCTOR_PORTAL: PractitionerPortal = {
  basePath: "/doctor",
  allowedRoles: ["DOCTOR", "SUPER_ADMIN"],
};
