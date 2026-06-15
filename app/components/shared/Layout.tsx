import React from "react";
import { Bell } from "lucide-react";
import AppSidebar from "./AppSidebar";
import type { User, UserRole } from "~/lib/auth/types";

interface LayoutProps {
  children: React.ReactNode;
  role: string;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role, title }) => {
  const userRole: UserRole =
    role === "super_admin"
      ? "SUPER_ADMIN"
      : role === "country_admin"
        ? "COUNTRY_ADMIN"
        : "COMPANY_ADMIN";

  const user: User = {
    id: "layout-user",
    firstName:
      role === "super_admin"
        ? "Super"
        : role === "country_admin"
          ? "Country"
          : "Company",
    lastName: "Admin",
    username: "admin",
    email: ["admin@example.com"],
    roles: [userRole],
    currentRole: userRole,
    companies: [],
    adminCountries: [],
    adminRegions: [],
    adminCompanies: [],
    diet: { breakfast: [], lunch: [], dinner: [] },
    coins: 0,
    friends: [],
    blockList: [],
    settings: {
      stretching: true,
      dailyMood: true,
      drinkWater: true,
      quotes: { send: true, minutes: 60 },
      facts: { send: true, minutes: 60 },
    },
    accomplishments: [],
    rating: 0,
    reviews: 0,
    price: 0,
    currency: "USD",
    coaches: [],
    coachTrainees: [],
    coachGroup: [],
    coachGroupMember: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    isFollowingDiet: false,
    activeDietPlanId: null,
    activeUserDietPlanId: null,
    currentDayNumber: null,
    get name() {
      return `${this.firstName} ${this.lastName}`;
    },
    get role() {
      return this.currentRole;
    },
  };

  const getRoleShortCode = (role: string) => {
    switch (role) {
      case "super_admin":
        return "SA";
      case "country_admin":
        return "CA";
      case "company_admin":
        return "CO";
      default:
        return "AD";
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans selection:bg-[#5850DE] selection:text-white overflow-hidden">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header */}
        {title && (
          <header className="flex justify-between items-center p-8 pb-0">
            <h1 className="text-3xl font-extrabold text-[#1B173A]">{title}</h1>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-[#E0E1E6] rounded-xl flex items-center justify-center text-[#1B173A] hover:bg-gray-50 cursor-pointer shadow-sm relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
              </div>
              <div className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center font-bold text-sm shadow-md cursor-pointer">
                {getRoleShortCode(role)}
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
