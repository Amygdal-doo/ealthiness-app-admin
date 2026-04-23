export type Role = "super_admin" | "country_admin" | "company_admin" | "employee";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  countryId?: string;
  companyId?: string;
};

export type Country = {
  id: string;
  name: string;
  code: string;
  adminCount: number;
  companyCount: number;
};

export type Company = {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
  employeeCount: number;
  adminId?: string;
  adminName?: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  companyId: string;
  companyName: string;
  position: string;
  status: "active" | "on_leave" | "terminated";
  startDate: string;
  salary: number;
  healthScore: number;
  progressPercent: number;
};

export type MonthlyProgress = {
  month: string;
  healthScore: number;
  productivity: number;
  engagement: number;
  wellbeing: number;
};

export type Bonus = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "salary_bonus" | "gift";
  amount: number;
  description: string;
  date: string;
  status: "pending" | "approved" | "paid";
};

export type Invitation = {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  countryId?: string;
  companyId?: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  country_admin: "Country Admin",
  company_admin: "Company Admin",
  employee: "Employee",
};
