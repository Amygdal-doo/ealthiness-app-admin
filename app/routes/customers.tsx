import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/customers";
import { Users, User, UserCheck } from "lucide-react";
import { Badge } from "~/components/ui";
import AppSidebar from "../../src/components/shared/AppSidebar";
import Navbar from "../../src/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import { useUsers } from "~/hooks/useAuthApi";
import type { ApiUser } from "~/lib/auth/types";


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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch users with React Query
  const { data: usersResponse, isLoading, error, refetch } = useUsers({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    orderBy: 'lastName',
    type: 'ascending'
  });

  // Console log users when data changes
  useEffect(() => {
    if (usersResponse?.results) {
      console.log('Users from API:', usersResponse.results);
      console.log('Total users:', usersResponse.total);
      console.log('Current page:', usersResponse.page);
    }
  }, [usersResponse]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
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

  // Transform API users to display format
  const transformUser = (apiUser: ApiUser) => ({
    id: apiUser._id,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    roles: apiUser.roles, // Show all roles
    joined: new Date(apiUser.createdAt).toLocaleDateString(),
    status: 'Active', // API doesn't provide status, defaulting to Active
    weight: apiUser.weight ? `${apiUser.weight}kg` : 'N/A',
    height: apiUser.height ? `${apiUser.height}cm` : 'N/A',
    username: apiUser.username,
    email: apiUser.email[0],
    gender: apiUser.gender // Include gender for icon display
  });

  const visibleCustomers = usersResponse?.results?.map(transformUser) || [];
  const pageTitle = user?.role === "COMPANY_ADMIN" ? "My Users" : "All Users";

  // Handle loading state
  if (isLoading && !usersResponse) {
    return (
      <RoleGuard allowedRoles={["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN", "COMPANY_ADMIN"]}>
        <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
          <AppSidebar user={user!} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading users...</span>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // Handle error state
  if (error) {
    console.error('Error fetching users:', error);
  }

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
                  Total {usersResponse?.total || 0} users found ({visibleCustomers.length} on this page)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E0E1E6] shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                  <tr>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest">
                      User
                    </th>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden lg:table-cell">
                      Roles
                    </th>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                      Height
                    </th>
                    <th className="p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest hidden md:table-cell">
                      Weight
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
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1B173A] leading-tight">
                                {customer.name}
                              </span>
                              {/* Gender icon */}
                              {customer.gender === 'male' ? (
                                <User size={14} className="text-blue-500" />
                              ) : customer.gender === 'female' ? (
                                <UserCheck size={14} className="text-pink-500" />
                              ) : null}
                            </div>
                            <span className="text-xs text-[#8E8E93] font-medium">
                              @{customer.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          {customer.roles.map((role, index) => (
                            <div key={index}>
                              <Badge
                                variant={role === 'SUPER_ADMIN' ? 'destructive' : role.includes('ADMIN') ? 'secondary' : 'default'}
                                className="text-xs"
                              >
                                {role.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                        {customer.height}
                      </td>
                      <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                        {customer.weight}
                      </td>
                      <td className="p-4 font-medium text-[#60646C] hidden md:table-cell">
                        {customer.joined}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/customers/${customer.id}`}
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
