import { useAuth } from "~/lib/auth";
import { countries, companies, employees, bonuses } from "~/lib/mock-data";
import { ROLE_LABELS } from "~/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  UsersIcon,
  BuildingIcon,
  GlobeIcon,
  ActivityIcon,
  TrendingUpIcon,
  GiftIcon,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  // Scope data by role
  let scopedCompanies = companies;
  let scopedEmployees = employees;
  let scopedBonuses = bonuses;

  if (user.role === "country_admin") {
    scopedCompanies = companies.filter((c) => c.countryId === user.countryId);
    const companyIds = scopedCompanies.map((c) => c.id);
    scopedEmployees = employees.filter((e) => companyIds.includes(e.companyId));
    const empIds = scopedEmployees.map((e) => e.id);
    scopedBonuses = bonuses.filter((b) => empIds.includes(b.employeeId));
  } else if (user.role === "company_admin") {
    scopedCompanies = companies.filter((c) => c.id === user.companyId);
    scopedEmployees = employees.filter((e) => e.companyId === user.companyId);
    const empIds = scopedEmployees.map((e) => e.id);
    scopedBonuses = bonuses.filter((b) => empIds.includes(b.employeeId));
  }

  const activeCount = scopedEmployees.filter((e) => e.status === "active").length;
  const avgHealth = scopedEmployees.length
    ? Math.round(
        scopedEmployees.reduce((sum, e) => sum + e.healthScore, 0) /
          scopedEmployees.length
      )
    : 0;
  const pendingBonuses = scopedBonuses.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}.{" "}
          <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {user.role === "super_admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Countries</CardTitle>
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countries.length}</div>
              <CardDescription>Active regions</CardDescription>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scopedCompanies.length}</div>
            <CardDescription>
              {user.role === "company_admin" ? "Your company" : "Registered"}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scopedEmployees.length}</div>
            <CardDescription>
              {activeCount} active, {scopedEmployees.length - activeCount} inactive
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Health</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHealth}%</div>
            <Progress value={avgHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Employees with highest health scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...scopedEmployees]
                .sort((a, b) => b.healthScore - a.healthScore)
                .slice(0, 5)
                .map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.position} — {emp.companyName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={emp.healthScore}
                        className="w-16"
                      />
                      <span className="text-sm font-medium w-10 text-right">
                        {emp.healthScore}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5" />
              Recent Bonuses
            </CardTitle>
            <CardDescription>
              {pendingBonuses} pending approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scopedBonuses.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No bonuses recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {scopedBonuses.slice(0, 5).map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {bonus.employeeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bonus.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${bonus.amount}
                      </p>
                      <Badge
                        variant={
                          bonus.type === "gift" ? "secondary" : "default"
                        }
                        className="text-xs"
                      >
                        {bonus.type === "gift" ? "Gift" : "Bonus"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
