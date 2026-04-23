import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { countries } from "~/lib/mock-data";
import type { Country } from "~/lib/types";
import { InviteDialog } from "~/components/invite-dialog";

const columns: ColumnDef<Country>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.code}</Badge>
    ),
  },
  {
    accessorKey: "name",
    header: "Country",
  },
  {
    accessorKey: "adminCount",
    header: "Admins",
  },
  {
    accessorKey: "companyCount",
    header: "Companies",
  },
];

export default function CountriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Countries</h1>
          <p className="text-muted-foreground">
            Manage countries and their admins.
          </p>
        </div>
        <InviteDialog />
      </div>

      <DataTable
        columns={columns}
        data={countries}
        searchKey="name"
        searchPlaceholder="Search countries..."
      />
    </div>
  );
}
