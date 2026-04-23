import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { companies } from "~/lib/mock-data";
import type { Company } from "~/lib/types";
import { useAuth } from "~/lib/auth";
import { InviteDialog } from "~/components/invite-dialog";

const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Company",
  },
  {
    accessorKey: "countryName",
    header: "Country",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.countryName}</Badge>
    ),
  },
  {
    accessorKey: "adminName",
    header: "Admin",
  },
  {
    accessorKey: "employeeCount",
    header: "Employees",
  },
];

export default function CompaniesPage() {
  const { user } = useAuth();

  const filteredCompanies =
    user?.role === "country_admin"
      ? companies.filter((c) => c.countryId === user.countryId)
      : companies;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            {user?.role === "country_admin"
              ? "Manage companies in your country."
              : "Manage all companies across countries."}
          </p>
        </div>
        <InviteDialog />
      </div>

      <DataTable
        columns={columns}
        data={filteredCompanies}
        searchKey="name"
        searchPlaceholder="Search companies..."
      />
    </div>
  );
}
