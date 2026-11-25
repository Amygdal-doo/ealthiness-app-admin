import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutGrid,
  Globe,
  Building2,
  Users,
  HeartPulse,
  Settings,
  MapPin,
  Dumbbell,
  Brain,
  Stethoscope,
  CalendarClock,
  Activity,
  UtensilsCrossed,
  Hospital,
  ClipboardCheck,
  ClipboardList,
  Wallet,
  Building,
  KeyRound,
  Inbox,
  Menu,
  X,
} from "lucide-react";

import type { User } from "~/lib/auth/types";
import { useLogout } from "~/hooks/useAuthApi";

interface AppSidebarProps {
  user: User;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[];
  path: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll and support Escape while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  // Use user.role from the authenticated user
  const effectiveRole = user.role;

  // Normalize role for consistent checking
  const normalizedRole = effectiveRole.toUpperCase().replace(/[-\s]/g, "_");

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      navigate("/");
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "COUNTRY_ADMIN":
        return "Country Admin";
      case "COMPANY_ADMIN":
        return "Company Admin";
      case "REGIONAL_ADMIN":
        return "Regional Admin";
      case "PSYCHOLOGIST":
        return "Psychologist";
      case "DOCTOR":
        return "Doctor";
      case "COACH":
        return "Trainer";
      case "GYM_ADMIN":
        return "Gym Admin";
      default:
        return "Admin";
    }
  };

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutGrid,
      roles: [
        "SUPER_ADMIN",
        "COUNTRY_ADMIN",
        "REGIONAL_ADMIN",
        "COMPANY_ADMIN",
      ],
      path: "/home",
    },
    {
      id: "psych-overview",
      label: "Overview",
      icon: LayoutGrid,
      roles: ["PSYCHOLOGIST"],
      path: "/psychologist",
    },
    {
      id: "psych-sessions",
      label: "Sessions",
      icon: CalendarClock,
      roles: ["PSYCHOLOGIST"],
      path: "/psychologist/sessions",
    },
    {
      id: "psych-patients",
      label: "Patients",
      icon: Users,
      roles: ["PSYCHOLOGIST"],
      path: "/psychologist/patients",
    },
    {
      id: "doctor-overview",
      label: "Overview",
      icon: LayoutGrid,
      roles: ["DOCTOR"],
      path: "/doctor",
    },
    {
      id: "doctor-sessions",
      label: "Sessions",
      icon: CalendarClock,
      roles: ["DOCTOR"],
      path: "/doctor/sessions",
    },
    {
      id: "doctor-patients",
      label: "Patients",
      icon: Users,
      roles: ["DOCTOR"],
      path: "/doctor/patients",
    },
    {
      id: "hospital-staff",
      label: "Hospital",
      icon: Hospital,
      roles: ["PSYCHOLOGIST", "DOCTOR"],
      path: "/hospital-staff",
    },
    // Trainer (COACH) portal
    {
      id: "trainer-overview",
      label: "Overview",
      icon: LayoutGrid,
      roles: ["COACH"],
      path: "/trainer",
    },
    {
      id: "trainer-plans",
      label: "Diet Plans",
      icon: UtensilsCrossed,
      roles: ["COACH"],
      path: "/trainer/plans",
    },
    {
      id: "trainer-payouts",
      label: "Payouts",
      icon: Wallet,
      roles: ["COACH"],
      path: "/payouts",
    },
    // Gym admin portal
    {
      id: "gym-overview",
      label: "My Gym",
      icon: Dumbbell,
      roles: ["GYM_ADMIN"],
      path: "/gym",
    },
    {
      id: "gym-people",
      label: "Invites & Requests",
      icon: Inbox,
      roles: ["GYM_ADMIN"],
      path: "/gym/people",
    },
    // Company admin portal
    {
      id: "organisation",
      label: "My Organisation",
      icon: Building2,
      roles: ["COMPANY_ADMIN"],
      path: "/organisation",
    },
    {
      id: "organisation-access",
      label: "Invites & Requests",
      icon: KeyRound,
      roles: ["COMPANY_ADMIN"],
      path: "/organisation/access",
    },
    {
      id: "regions",
      label: "Regions",
      icon: Globe,
      roles: ["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN"],
      path: "/regions",
    },
    {
      id: "countries",
      label: "Countries",
      icon: MapPin,
      roles: ["SUPER_ADMIN", "REGIONAL_ADMIN", "COUNTRY_ADMIN"],
      path: "/countries",
    },
    {
      id: "companies",
      label: "Companies",
      icon: Building2,
      roles: [
        "SUPER_ADMIN",
        "COUNTRY_ADMIN",
        "REGIONAL_ADMIN",
        "COMPANY_ADMIN",
      ],
      path: "/companies",
    },
    {
      id: "customers",
      label: normalizedRole === "COMPANY_ADMIN" ? "My Users" : "All Users",
      icon: Users,
      roles: [
        "SUPER_ADMIN",
        "COUNTRY_ADMIN",
        "REGIONAL_ADMIN",
        "COMPANY_ADMIN",
      ],
      path: "/customers",
    },
    {
      id: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      roles: ["SUPER_ADMIN"],
      path: "/doctors",
    },
    {
      id: "psychologists",
      label: "Psychologists",
      icon: Brain,
      roles: ["SUPER_ADMIN"],
      path: "/psychologists",
    },
    {
      id: "coaches",
      label: "Coaches",
      icon: Dumbbell,
      roles: ["SUPER_ADMIN"],
      path: "/coaches",
    },
    {
      id: "coach-applications",
      label: "Coach Applications",
      icon: ClipboardCheck,
      roles: ["SUPER_ADMIN"],
      path: "/coach-applications",
    },
    {
      id: "exercises",
      label: "Exercises",
      icon: Activity,
      roles: ["SUPER_ADMIN"],
      path: "/exercises",
    },
    {
      id: "diet-plans",
      label: "Diet Plans",
      icon: UtensilsCrossed,
      roles: ["SUPER_ADMIN"],
      path: "/diet-plans",
    },
    {
      id: "plan-reviews",
      label: "Plan Reviews",
      icon: ClipboardList,
      roles: ["SUPER_ADMIN"],
      path: "/plan-reviews",
    },
    {
      id: "gyms",
      label: "Gyms",
      icon: Building,
      roles: ["SUPER_ADMIN"],
      path: "/gyms",
    },
    {
      id: "hospitals",
      label: "Hospitals",
      icon: Hospital,
      roles: ["SUPER_ADMIN"],
      path: "/hospitals",
    },
  ];

  const brandItems: NavItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      roles: [
        "SUPER_ADMIN",
        "COUNTRY_ADMIN",
        "REGIONAL_ADMIN",
        "COMPANY_ADMIN",
      ],
      path: "/settings",
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(normalizedRole),
  );
  const filteredBrandItems = brandItems.filter((item) =>
    item.roles.includes(normalizedRole),
  );

  const isActiveRoute = (itemId: string, itemPath: string) => {
    if (itemId === "dashboard") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    if (itemId === "psych-overview") {
      return location.pathname === "/psychologist";
    }
    if (itemId === "doctor-overview") {
      return location.pathname === "/doctor";
    }
    // Overview items whose path prefixes a sibling item.
    if (itemId === "trainer-overview" || itemId === "gym-overview" || itemId === "organisation") {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath);
  };

  const goTo = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  const sidebarContent = (
    <>
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
            {getRoleDisplayName(normalizedRole)}
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

          const handleNavigation = (e: React.MouseEvent) => {
            e.preventDefault();
            goTo(item.path);
          };

          return (
            <button
              key={item.id}
              onClick={handleNavigation}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition text-left ${
                isActive
                  ? "bg-[#F0F0F3] text-[#5850DE]"
                  : "text-[#60646C] hover:bg-gray-50"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
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

              const handleBrandNavigation = (e: React.MouseEvent) => {
                e.preventDefault();
                goTo(item.path);
              };

              return (
                <button
                  key={item.id}
                  onClick={handleBrandNavigation}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition text-left ${
                    isActive
                      ? "bg-gradient-to-r from-[#5850DE] to-[#248FEC] text-white shadow-md"
                      : "text-[#60646C] hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-[#E0E1E6] mt-auto">
        <button
          onClick={() => {
            setMobileOpen(false);
            handleLogout();
          }}
          className="w-full flex items-center justify-center gap-2 p-3 text-[#EF4444] font-bold hover:bg-red-50 rounded-xl transition-colors"
        >
          Logout Securely
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar (< md) */}
      <div className="md:hidden sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-[#E0E1E6] bg-white px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar-drawer"
          className="-ml-2 p-2 rounded-xl text-[#1B173A] hover:bg-[#F0F0F3] transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-[#5850DE] to-[#248FEC] rounded-lg flex items-center justify-center text-white shadow-md">
          <HeartPulse size={16} />
        </div>
        <div className="min-w-0">
          <span className="font-extrabold text-base text-[#1B173A] leading-tight block">
            Ealthiness
          </span>
          <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block truncate">
            {getRoleDisplayName(normalizedRole)}
          </span>
        </div>
      </div>

      {/* Mobile off-canvas drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] ${mobileOpen ? "" : "pointer-events-none"}`}
        inert={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          id="app-sidebar-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="absolute top-4 right-3 p-2 rounded-xl text-[#60646C] hover:bg-[#F0F0F3] transition-colors"
          >
            <X size={20} />
          </button>
          {sidebarContent}
        </aside>
      </div>

      {/* Desktop sidebar (>= md) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E0E1E6] flex-col h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;
