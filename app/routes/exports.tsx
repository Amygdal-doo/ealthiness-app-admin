import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { employees, companies as allCompanies, bonuses } from "~/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  DownloadIcon,
  UploadIcon,
  FileSpreadsheetIcon,
  CheckCircleIcon,
} from "lucide-react";

function toCsv(headers: string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportsPage() {
  const { user } = useAuth();
  const [exportType, setExportType] = useState("employees");
  const [importDone, setImportDone] = useState(false);

  // Filter data based on role
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

  const handleExport = () => {
    if (exportType === "employees") {
      const csv = toCsv(
        ["ID", "Name", "Email", "Company", "Position", "Status", "Health Score", "Salary"],
        filteredEmployees.map((e) => [
          e.id, e.name, e.email, e.companyName, e.position,
          e.status, String(e.healthScore), String(e.salary),
        ])
      );
      downloadCsv("employees.csv", csv);
    } else {
      const filteredBonuses = bonuses.filter((b) =>
        filteredEmployees.some((e) => e.id === b.employeeId)
      );
      const csv = toCsv(
        ["ID", "Employee", "Type", "Amount", "Description", "Date", "Status"],
        filteredBonuses.map((b) => [
          b.id, b.employeeName, b.type, String(b.amount),
          b.description, b.date, b.status,
        ])
      );
      downloadCsv("bonuses.csv", csv);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // In a real app, parse and send to API
    setImportDone(true);
    setTimeout(() => setImportDone(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export / Import</h1>
        <p className="text-muted-foreground">
          Export data to CSV or import from a file.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DownloadIcon className="h-5 w-5" />
              <CardTitle>Export Data</CardTitle>
            </div>
            <CardDescription>
              Download data as a CSV file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Data type</Label>
              <Select value={exportType} onValueChange={(v) => v && setExportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employees">Employees</SelectItem>
                  <SelectItem value="bonuses">Bonuses & Gifts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheetIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {exportType === "employees"
                    ? `${filteredEmployees.length} employees`
                    : `${bonuses.filter((b) => filteredEmployees.some((e) => e.id === b.employeeId)).length} bonus records`}
                </span>
                <Badge variant="outline" className="ml-auto">CSV</Badge>
              </div>
            </div>

            <Button onClick={handleExport} className="w-full">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              <CardTitle>Import Data</CardTitle>
            </div>
            <CardDescription>
              Upload a CSV file to import data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">CSV File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv"
                onChange={handleImport}
              />
            </div>

            <div className="rounded-md border border-dashed p-6 text-center">
              {importDone ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  <p className="text-sm font-medium">Import successful!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select a CSV file to import
                  </p>
                </div>
              )}
            </div>

            <Separator />
            <p className="text-xs text-muted-foreground">
              Supported formats: CSV with headers matching the export format.
              Existing records will be updated, new records will be created.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
