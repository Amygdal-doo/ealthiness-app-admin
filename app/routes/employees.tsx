import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { employees, companies as allCompanies } from "~/lib/mock-data";
import type { Employee } from "~/lib/types";
import { useAuth } from "~/lib/auth";
import { InviteDialog } from "~/components/invite-dialog";
import { EyeIcon } from "lucide-react";

const statusVariant: Record<Employee["status"], "default" | "secondary" | "destructive"> = {
  active: "default",
  on_leave: "secondary",
  terminated: "destructive",
};

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "companyName",
    header: "Company",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "healthScore",
    header: "Health Score",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress value={row.original.healthScore} className="w-16" />
        <span className="text-xs text-muted-foreground">
          {row.original.healthScore}%
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" render={<Link to={`/employees/${row.original.id}`} />}>
        <EyeIcon className="mr-1 h-4 w-4" />
        View
      </Button>
    ),
  },
];

export default function EmployeesPage() {
  const { user } = useAuth();

  let filteredEmployees = employees;
  if (user?.role === "company_admin") {
    filteredEmployees = employees.filter((e) => e.companyId === user.companyId);
  } else if (user?.role === "country_admin") {
    const countryCompanyIds = allCompanies
      .filter((c) => c.countryId === user.countryId)
      .map((c) => c.id);
    filteredEmployees = employees.filter((e) =>
      countryCompanyIds.includes(e.companyId)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            View and manage employee profiles.
          </p>
        </div>
        {user?.role !== "employee" && <InviteDialog />}
      </div>

      <DataTable
        columns={columns}
        data={filteredEmployees}
        searchKey="name"
        searchPlaceholder="Search employees..."
      />
    </div>
  );
}
