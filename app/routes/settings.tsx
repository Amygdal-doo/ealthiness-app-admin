import React from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/settings";
import AppSidebar from "../../src/components/shared/AppSidebar";
import Navbar from "../../src/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Manage system settings and configuration",
    },
  ];
}

export default function Settings() {
  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = React.useState(false);

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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
              <h1 className="text-3xl font-extrabold text-[#1B173A] mb-8">
                Settings
              </h1>
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E0E1E6]">
                <p className="text-[#60646C] mb-4">
                  Manage system settings and configuration.
                </p>
                <p className="text-sm text-[#8E8E93]">
                  Current role: {user.role}
                </p>
                <div className="mt-8 p-6 bg-[#F8F9FB] rounded-lg border-2 border-dashed border-[#E0E1E6]">
                  <p className="text-center text-[#8E8E93]">
                    Settings interface coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}