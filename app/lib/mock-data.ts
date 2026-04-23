import type {
  Country,
  Company,
  Employee,
  MonthlyProgress,
  Bonus,
  Invitation,
  User,
} from "./types";

// ── Countries ──────────────────────────────────────────────
export const countries: Country[] = [
  { id: "c1", name: "Germany", code: "DE", adminCount: 2, companyCount: 4 },
  { id: "c2", name: "Netherlands", code: "NL", adminCount: 1, companyCount: 3 },
  { id: "c3", name: "Turkey", code: "TR", adminCount: 1, companyCount: 2 },
  { id: "c4", name: "United Kingdom", code: "GB", adminCount: 1, companyCount: 3 },
];

// ── Companies ──────────────────────────────────────────────
export const companies: Company[] = [
  { id: "co1", name: "MediTech GmbH", countryId: "c1", countryName: "Germany", employeeCount: 45, adminName: "Hans Weber" },
  { id: "co2", name: "HealthFirst AG", countryId: "c1", countryName: "Germany", employeeCount: 32, adminName: "Anna Schmidt" },
  { id: "co3", name: "VitalCare BV", countryId: "c2", countryName: "Netherlands", employeeCount: 28, adminName: "Jan de Vries" },
  { id: "co4", name: "WellBeing Ltd", countryId: "c4", countryName: "United Kingdom", employeeCount: 51, adminName: "James Wilson" },
  { id: "co5", name: "Sağlık Corp", countryId: "c3", countryName: "Turkey", employeeCount: 38, adminName: "Ahmet Yılmaz" },
  { id: "co6", name: "FitWork Solutions", countryId: "c1", countryName: "Germany", employeeCount: 19, adminName: "Lisa Braun" },
  { id: "co7", name: "NutriBalance BV", countryId: "c2", countryName: "Netherlands", employeeCount: 22, adminName: "Sophie Bakker" },
  { id: "co8", name: "ActiveLife UK", countryId: "c4", countryName: "United Kingdom", employeeCount: 36, adminName: "Emily Brown" },
];

// ── Employees ──────────────────────────────────────────────
const positions = [
  "Software Engineer", "Product Manager", "Designer", "Data Analyst",
  "HR Specialist", "Marketing Lead", "Sales Rep", "Support Agent",
  "Team Lead", "DevOps Engineer",
];
const statuses: Employee["status"][] = ["active", "active", "active", "on_leave", "terminated"];

export const employees: Employee[] = Array.from({ length: 50 }, (_, i) => {
  const companyIndex = i % companies.length;
  const company = companies[companyIndex];
  return {
    id: `e${i + 1}`,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@${company.name.toLowerCase().replace(/\s+/g, "")}.com`,
    companyId: company.id,
    companyName: company.name,
    position: positions[i % positions.length],
    status: statuses[i % statuses.length],
    startDate: new Date(2023, i % 12, (i % 28) + 1).toISOString().split("T")[0],
    salary: 3000 + Math.round(Math.random() * 5000),
    healthScore: 40 + Math.round(Math.random() * 60),
    progressPercent: 20 + Math.round(Math.random() * 80),
  };
});

// ── Monthly Progress (per employee) ────────────────────────
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getEmployeeMonthlyProgress(employeeId: string): MonthlyProgress[] {
  const seed = parseInt(employeeId.replace("e", ""), 10) || 1;
  return monthNames.map((month, i) => ({
    month,
    healthScore: Math.min(100, Math.max(20, 50 + Math.round(Math.sin(seed + i) * 25))),
    productivity: Math.min(100, Math.max(20, 60 + Math.round(Math.cos(seed + i) * 20))),
    engagement: Math.min(100, Math.max(20, 55 + Math.round(Math.sin(seed * 2 + i) * 22))),
    wellbeing: Math.min(100, Math.max(20, 65 + Math.round(Math.cos(seed * 3 + i) * 18))),
  }));
}

// ── Bonuses ────────────────────────────────────────────────
const bonusStatuses: Bonus["status"][] = ["pending", "approved", "paid"];

export const bonuses: Bonus[] = Array.from({ length: 20 }, (_, i) => {
  const emp = employees[i % employees.length];
  return {
    id: `b${i + 1}`,
    employeeId: emp.id,
    employeeName: emp.name,
    type: i % 3 === 0 ? "gift" : "salary_bonus",
    amount: i % 3 === 0 ? 50 + Math.round(Math.random() * 200) : 200 + Math.round(Math.random() * 1000),
    description: i % 3 === 0
      ? ["Gift card", "Wellness voucher", "Fitness subscription", "Health box"][i % 4]
      : ["Performance bonus", "Quarterly bonus", "Overtime pay", "Achievement reward"][i % 4],
    date: new Date(2026, i % 12, (i % 28) + 1).toISOString().split("T")[0],
    status: bonusStatuses[i % bonusStatuses.length],
  };
});

// ── Invitations ────────────────────────────────────────────
export const invitations: Invitation[] = [
  { id: "inv1", email: "newadmin@de.com", role: "country_admin", invitedBy: "Super Admin", countryId: "c1", status: "pending", createdAt: "2026-04-20" },
  { id: "inv2", email: "company@nl.com", role: "company_admin", invitedBy: "NL Admin", companyId: "co3", countryId: "c2", status: "accepted", createdAt: "2026-04-18" },
  { id: "inv3", email: "john@meditech.com", role: "employee", invitedBy: "Hans Weber", companyId: "co1", status: "pending", createdAt: "2026-04-21" },
];

// ── Demo Login Accounts ────────────────────────────────────
export const demoAccounts: User[] = [
  { id: "u1", email: "super@ealthiness.com", name: "Super Admin", role: "super_admin" },
  { id: "u2", email: "germany@ealthiness.com", name: "Germany Admin", role: "country_admin", countryId: "c1" },
  { id: "u3", email: "meditech@ealthiness.com", name: "Hans Weber", role: "company_admin", countryId: "c1", companyId: "co1" },
  { id: "u4", email: "employee@meditech.com", name: "Employee 1", role: "employee", countryId: "c1", companyId: "co1" },
];
