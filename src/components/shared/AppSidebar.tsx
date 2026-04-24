import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutGrid,
  Globe,
  Building2,
  Users,
  Palette,
  HeartPulse,
  Settings,
} from "lucide-react";

interface User {
  name: string;
  email?: string;
  role: string;
}

interface AppSidebarProps {
  user: User;
  role: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[];
  path: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ user, role }) => {
  const location = useLocation();

  const handleLogout = () => {
    window.location.href = "/login";
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Global Admin";
      case "country_admin":
        return "Country Admin";
      case "company_admin":
        return "Company Admin";
      default:
        return "Admin";
    }
  };

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutGrid,
      roles: ["super_admin", "country_admin", "company_admin"],
      path: `/?role=${role}`,
    },
    {
      id: "countries",
      label: "Regions & Countries",
      icon: Globe,
      roles: ["super_admin"],
      path: `/countries?role=${role}`,
    },
    {
      id: "companies",
      label: "Companies",
      icon: Building2,
      roles: ["super_admin", "country_admin"],
      path: `/companies?role=${role}`,
    },
    {
      id: "customers",
      label: role === "company_admin" ? "My Users" : "All Users",
      icon: Users,
      roles: ["super_admin", "country_admin", "company_admin"],
      path: `/customers?role=${role}`,
    },
  ];

  const brandItems: NavItem[] = [
    {
      id: "design_system",
      label: "Design System",
      icon: Palette,
      roles: ["super_admin", "country_admin", "company_admin"],
      path: `/design-system?role=${role}`,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["super_admin", "country_admin", "company_admin"],
      path: `/settings?role=${role}`,
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));
  const filteredBrandItems = brandItems.filter((item) =>
    item.roles.includes(role),
  );

  const isActiveRoute = (itemId: string, itemPath: string) => {
    if (itemId === "dashboard") {
      return location.pathname === "/";
    }
    return location.pathname === itemPath.split("?")[0];
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E0E1E6] flex flex-col h-screen sticky top-0 shrink-0 z-20">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#E0E1E6]">
        <div className="w-10 h-10 bg-gradient-to-br from-[#5850DE] to-[#248FEC] rounded-xl flex items-center justify-center text-white shadow-md">
          <HeartPulse size={20} />
        </div>
        <div>
          <span className="font-extrabold text-lg text-[#1B173A] leading-tight block">
            Ealthiness
          </span>
          <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
            {getRoleDisplayName(role)}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
        <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest px-3 mb-2">
          Management
        </p>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.id, item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition ${
                isActive
                  ? "bg-[#F0F0F3] text-[#5850DE]"
                  : "text-[#60646C] hover:bg-gray-50"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}

        {filteredBrandItems.length > 0 && (
          <>
            <div className="mt-8 mb-4 border-t border-[#E0E1E6]"></div>
            <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest px-3 mb-2 mt-4">
              Brand Resources
            </p>

            {filteredBrandItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.id, item.path);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#5850DE] to-[#248FEC] text-white shadow-md"
                      : "text-[#60646C] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {item.label}
                  </div>
                  {!isActive && item.id === "design_system" && (
                    <div className="w-2 h-2 rounded-full bg-[#248FEC]"></div>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-[#E0E1E6] mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 text-[#EF4444] font-bold hover:bg-red-50 rounded-xl transition-colors"
        >
          Logout Securely
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
