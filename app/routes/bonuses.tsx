import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { bonuses, employees } from "~/lib/mock-data";
import type { Bonus } from "~/lib/types";
import { useAuth } from "~/lib/auth";
import { PlusIcon, GiftIcon, DollarSignIcon } from "lucide-react";

const statusVariant: Record<Bonus["status"], "default" | "secondary" | "outline"> = {
  pending: "secondary",
  approved: "default",
  paid: "outline",
};

const columns: ColumnDef<Bonus>[] = [
  {
    accessorKey: "employeeName",
    header: "Employee",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.type === "gift" ? (
          <GiftIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        )}
        <span>{row.original.type === "gift" ? "Gift" : "Salary Bonus"}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium">${row.original.amount}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
];

function AddBonusDialog({ companyEmployees }: { companyEmployees: typeof employees }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setOpen(false);
      setSaved(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Bonus / Gift
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bonus or Gift</DialogTitle>
          <DialogDescription>
            Reward an employee with a salary bonus or a gift.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-green-600">Saved!</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {companyEmployees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} — {e.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary_bonus">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4" />
                      Salary Bonus
                    </div>
                  </SelectItem>
                  <SelectItem value="gift">
                    <div className="flex items-center gap-2">
                      <GiftIcon className="h-4 w-4" />
                      Gift
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-amount">Amount ($)</Label>
              <Input
                id="bonus-amount"
                type="number"
                placeholder="500"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-desc">Description</Label>
              <Textarea
                id="bonus-desc"
                placeholder="Performance bonus for Q1..."
              />
            </div>
          </div>
        )}

        {!saved && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function BonusesPage() {
  const { user } = useAuth();

  let filteredBonuses = bonuses;
  let companyEmployees = employees;

  if (user?.role === "company_admin") {
    companyEmployees = employees.filter((e) => e.companyId === user.companyId);
    const empIds = companyEmployees.map((e) => e.id);
    filteredBonuses = bonuses.filter((b) => empIds.includes(b.employeeId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonuses & Gifts
          </h1>
          <p className="text-muted-foreground">
            Manage salary bonuses and gift rewards for employees.
          </p>
        </div>
        <AddBonusDialog companyEmployees={companyEmployees} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Bonuses</p>
          <p className="mt-1 text-2xl font-bold">
            ${filteredBonuses
              .filter((b) => b.type === "salary_bonus")
              .reduce((sum, b) => sum + b.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Gifts</p>
          <p className="mt-1 text-2xl font-bold">
            ${filteredBonuses
              .filter((b) => b.type === "gift")
              .reduce((sum, b) => sum + b.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending Approvals</p>
          <p className="mt-1 text-2xl font-bold">
            {filteredBonuses.filter((b) => b.status === "pending").length}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBonuses}
        searchKey="employeeName"
        searchPlaceholder="Search by employee..."
      />
    </div>
  );
}
