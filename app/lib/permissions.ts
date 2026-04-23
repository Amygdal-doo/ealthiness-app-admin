import type { Role } from "./types";

export function canInviteRole(currentRole: Role, targetRole: Role): boolean {
  switch (currentRole) {
    case "super_admin":
      return ["country_admin", "company_admin", "employee"].includes(targetRole);
    case "country_admin":
      return ["company_admin"].includes(targetRole);
    case "company_admin":
      return ["employee"].includes(targetRole);
    default:
      return false;
  }
}

export function getInvitableRoles(currentRole: Role): Role[] {
  switch (currentRole) {
    case "super_admin":
      return ["country_admin", "company_admin", "employee"];
    case "country_admin":
      return ["company_admin"];
    case "company_admin":
      return ["employee"];
    default:
      return [];
  }
}

export function canViewCountries(role: Role): boolean {
  return role === "super_admin";
}

export function canViewCompanies(role: Role): boolean {
  return ["super_admin", "country_admin"].includes(role);
}

export function canViewEmployees(role: Role): boolean {
  return ["super_admin", "country_admin", "company_admin"].includes(role);
}

export function canManageBonuses(role: Role): boolean {
  return ["super_admin", "company_admin"].includes(role);
}

export function canExportImport(role: Role): boolean {
  return ["super_admin", "country_admin", "company_admin"].includes(role);
}
