import React, { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/companies";
import { Building2, Plus, Mail, Edit } from "lucide-react";
import { Button, Card, Badge } from "~/components/ui";
import AppSidebar from "../../src/components/shared/AppSidebar";
import Navbar from "../../src/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";

const MOCK_COMPANIES = [
  {
    id: "comp1",
    countryId: "c1",
    name: "Sarajevo TechFit",
    status: "Active",
    users: 145,
  },
  {
    id: "comp2", 
    countryId: "c1",
    name: "Mostar Health Corp",
    status: "Active",
    users: 89,
  },
  {
    id: "comp3",
    countryId: "c2", 
    name: "NY Wellness Solutions",
    status: "Pending",
    users: 320,
  },
  {
    id: "comp4",
    countryId: "c3",
    name: "Berlin BioHacks",
    status: "Active",
    users: 210,
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Companies - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage companies across the Ealthiness platform",
    },
  ];
}


export default function CompaniesPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: string;
    data: any;
  }>({
    isOpen: false,
    type: "",
    data: null,
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleLogout = () => {
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Filter companies based on role (country admin only sees their country's companies)
  const visibleCompanies =
    user.role === "COUNTRY_ADMIN"
      ? MOCK_COMPANIES.filter((c) => c.countryId === "c1") // Assuming country admin is for BA
      : MOCK_COMPANIES;

  const handleInviteAdmin = (companyName: string) => {
    setModalState({
      isOpen: true,
      type: "invite_admin",
      data: { entity: companyName, role: "Company Admin" },
    });
  };

  const handleAddCompany = () => {
    setModalState({ isOpen: true, type: "company", data: null });
  };

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

        <div className="flex-1 flex flex-col">
          <Navbar
            user={user}
            onLogout={handleLogout}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

        <div className="flex-1 p-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1B173A]">
              Managed Companies
            </h2>
            <p className="text-[#60646C] text-sm font-medium mt-1">
              Total {visibleCompanies.length} active companies in your
              jurisdiction.
            </p>
          </div>
          <Button onClick={handleAddCompany}>
            <Plus size={18} className="mr-2" /> New Company
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                <tr>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Company Name
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Status
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Avg Scores
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Total Users
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E1E6]">
                {visibleCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-[#1B173A] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0F0F3] text-[#1B173A] flex items-center justify-center">
                        <Building2 size={16} />
                      </div>
                      {comp.name}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          comp.status === "Active" ? "secondary" : "outline"
                        }
                      >
                        {comp.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs font-medium text-[#60646C]">
                        <span className="flex items-center justify-between w-24">
                          Mood:{" "}
                          <span className="text-[#1B173A] font-bold">
                            88/100
                          </span>
                        </span>
                        <span className="flex items-center justify-between w-24">
                          Fit:{" "}
                          <span className="text-[#1B173A] font-bold">
                            92/100
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#1B173A]">
                      {comp.users}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          className="px-2"
                          title="Edit Company"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleInviteAdmin(comp.name)}
                        >
                          <Mail size={16} className="mr-2" /> Invite Admin
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal for invite/add actions */}
        {modalState.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#E0E1E6] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1B173A]">
                  {modalState.type === "invite_admin"
                    ? `Invite ${modalState.data?.role}`
                    : "Add New Company"}
                </h3>
                <button
                  onClick={() =>
                    setModalState({ isOpen: false, type: "", data: null })
                  }
                  className="text-[#8E8E93] hover:text-[#1B173A] transition"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                {modalState.type === "invite_admin" && (
                  <>
                    <p className="text-sm text-[#60646C]">
                      You are inviting a new {modalState.data?.role} to manage{" "}
                      <strong>{modalState.data?.entity}</strong>. They will
                      receive an email to set up their account.
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8E8E93] uppercase">
                        Email Address
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-[#E0E1E6] rounded-lg focus:border-[#5850DE] outline-none"
                        placeholder="admin@example.com"
                        type="email"
                      />
                    </div>
                  </>
                )}
                {modalState.type === "company" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8E8E93] uppercase">
                      Company Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-[#E0E1E6] rounded-lg focus:border-[#5850DE] outline-none"
                      placeholder="Enter company name..."
                    />
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setModalState({ isOpen: false, type: "", data: null })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      setModalState({ isOpen: false, type: "", data: null })
                    }
                  >
                    {modalState.type === "invite_admin"
                      ? "Send Invitation"
                      : "Save"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
