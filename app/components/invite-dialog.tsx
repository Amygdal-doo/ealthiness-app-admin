import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAuth } from "~/lib/auth";
import { getInvitableRoles } from "~/lib/permissions";
import { countries, companies } from "~/lib/mock-data";
import { ROLE_LABELS, type Role } from "~/lib/types";
import { PlusIcon } from "lucide-react";

export function InviteDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [sent, setSent] = useState(false);

  if (!user) return null;

  const invitableRoles = getInvitableRoles(user.role);
  if (invitableRoles.length === 0) return null;

  const showCountrySelect =
    selectedRole === "country_admin" ||
    (selectedRole === "company_admin" && user.role === "super_admin");

  const showCompanySelect =
    selectedRole === "company_admin" || selectedRole === "employee";

  const filteredCompanies =
    user.role === "super_admin"
      ? companies.filter((c) => !selectedCountry || c.countryId === selectedCountry)
      : user.role === "country_admin"
        ? companies.filter((c) => c.countryId === user.countryId)
        : companies.filter((c) => c.id === user.companyId);

  const handleSend = () => {
    // Replace with real API call
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setEmail("");
      setSelectedRole("");
      setSelectedCountry("");
      setSelectedCompany("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Invite User
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a User</DialogTitle>
          <DialogDescription>
            Send an invitation to join the platform.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-green-600">
              Invitation sent!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              An email has been sent to {email}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => v && setSelectedRole(v as Role)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {invitableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showCountrySelect && user.role === "super_admin" && (
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={selectedCountry}
                  onValueChange={(v) => v && setSelectedCountry(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showCompanySelect && user.role !== "company_admin" && (
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={selectedCompany}
                  onValueChange={(v) => v && setSelectedCompany(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {!sent && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!email || !selectedRole}>
              Send Invitation
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
