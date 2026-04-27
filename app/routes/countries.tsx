import React, { useState } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/countries";
import { Globe, Plus, Mail } from "lucide-react";
import { Button, Card, Badge } from "~/components/ui";
import { Layout } from "../../src/components/shared";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const isAuthenticated = role !== null;

  if (!isAuthenticated) {
    return redirect("/");
  }

  // Only super admins can access countries page
  if (role !== "super_admin") {
    return redirect("/home?role=" + role);
  }

  const userData = {
    user: {
      name: "Super Admin",
      email: "admin@ealthiness.com",
      role: "super_admin",
    },
    countries: [
      { id: "c1", name: "Bosnia and Herzegovina", code: "BA" },
      { id: "c2", name: "United States", code: "US" },
      { id: "c3", name: "Germany", code: "DE" },
    ],
  };

  return { userData };
}

export default function CountriesPage({ loaderData }: Route.ComponentProps) {
  const { userData } = loaderData;
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: string;
    data: any;
  }>({
    isOpen: false,
    type: "",
    data: null,
  });

  const handleInviteAdmin = (countryName: string) => {
    setModalState({
      isOpen: true,
      type: "invite_admin",
      data: { entity: countryName, role: "Country Manager" },
    });
  };

  const handleAddRegion = () => {
    setModalState({ isOpen: true, type: "country", data: null });
  };

  const url = new URL(window.location.href);
  const role = url.searchParams.get("role") || "super_admin";

  return (
    <Layout role={role} title="Regions & Countries">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1B173A]">
              Regions & Countries
            </h2>
            <p className="text-[#60646C] text-sm font-medium mt-1">
              Manage country-level administrators and health stats.
            </p>
          </div>
          <Button onClick={handleAddRegion}>
            <Plus size={18} className="mr-2" /> Add Region
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                <tr>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Region / Country
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Code
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                    Admins
                  </th>
                  <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E1E6]">
                {userData.countries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-[#1B173A] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                        <Globe size={16} />
                      </div>
                      {country.name}
                    </td>
                    <td className="p-4 font-mono text-[#60646C] text-sm">
                      {country.code}
                    </td>
                    <td className="p-4">
                      <Badge variant="default">2 Admins</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleInviteAdmin(country.name)}
                        >
                          <Mail size={16} className="mr-2" /> Invite Manager
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
                    : "Add New Region"}
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
                {modalState.type === "country" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8E8E93] uppercase">
                      Region Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-[#E0E1E6] rounded-lg focus:border-[#5850DE] outline-none"
                      placeholder="Enter region name..."
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
    </Layout>
  );
}
