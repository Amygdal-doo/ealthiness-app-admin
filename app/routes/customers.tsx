import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/customers";
import { Users } from "lucide-react";
import { Badge } from "~/components/ui";
import AppSidebar from "../../src/components/shared/AppSidebar";
import Navbar from "../../src/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";

const MOCK_CUSTOMERS = [
  {
    id: "u1",
    companyId: "comp1",
    name: "Tarik S.",
    role: "Premium User",
    joined: "2025-01-15",
    status: "Active",
    weight: "78kg",
    height: "182cm",
    age: 29,
  },
  {
    id: "u2",
    companyId: "comp1",
    name: "Amina M.",
    role: "Standard",
    joined: "2025-03-22",
    status: "Active",
    weight: "65kg",
    height: "168cm",
    age: 26,
  },
  {
    id: "u3",
    companyId: "comp3",
    name: "John Doe",
    role: "Premium User",
    joined: "2024-11-10",
    status: "Inactive",
    weight: "90kg",
    height: "175cm",
    age: 40,
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage users across the Ealthiness platform",
    },
  ];
}

export default function CustomersPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

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

  // Filter customers based on role
  const visibleCustomers =
    user.role === "COMPANY_ADMIN"
      ? MOCK_CUSTOMERS.filter((c) => c.companyId === "comp1") // Assuming company admin is for comp1
      : MOCK_CUSTOMERS;

  const pageTitle =
    user.role === "COMPANY_ADMIN" ? "My Users" : "All Users";

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN", "COMPANY_ADMIN"]}>
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  {pageTitle}
                </h2>
                <p className="text-[#60646C] text-sm font-medium mt-1">
                  Total {visibleCustomers.length} users in your management
                  scope.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                  <tr>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                      Customer
                    </th>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                      Health Status
                    </th>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                      Joined
                    </th>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E1E6]">
                  {visibleCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F0F0F3] text-[#5850DE] flex items-center justify-center font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#1B173A] block leading-tight">
                              {customer.name}
                            </span>
                            <span className="text-xs text-[#8E8E93] font-medium">
                              {customer.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                        <Badge
                          variant={
                            customer.status === "Active"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {customer.status === "Active"
                            ? "Optimal"
                            : "Needs Review"}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                        {customer.joined}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/customer/${customer.id}`}
                          className="bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#5850DE] hover:text-[#5850DE] transition inline-block"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {visibleCustomers.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-[#8E8E93]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-2">
                    No Users Found
                  </h3>
                  <p className="text-[#60646C] text-sm">
                    There are no users in your management scope yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
