import React from "react";
import { useNavigate } from "react-router";
import AppSidebar from "~/components/shared/AppSidebar";
import Navbar from "~/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import type { UserRole } from "~/lib/auth/types";

/* Page shell shared by the role portals: guard, sidebar, navbar, header.
 * Responsive: p-4 md:p-6, sidebar collapses to a drawer below md. */

interface PortalPageProps {
  allowedRoles: UserRole[];
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PortalPage({ allowedRoles, title, subtitle, icon: Icon, actions, children }: PortalPageProps) {
  const user = useUser();
  const navigate = useNavigate();

  if (!user) return <Spinner label="Loading..." full />;

  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex flex-col md:flex-row">
        <AppSidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar user={user} onLogout={() => navigate("/")} />
          <div className="flex-1 p-4 md:p-6 min-w-0">
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#1B173A] flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </span>
                    <span className="truncate">{title}</span>
                  </h2>
                  {subtitle && <p className="text-[#60646C] text-sm font-medium mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export function Spinner({ label, full = false }: { label?: string; full?: boolean }) {
  return (
    <div className={`${full ? "min-h-screen" : "py-10"} flex items-center justify-center`}>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        {label && <span className="text-gray-600">{label}</span>}
      </div>
    </div>
  );
}

export function Panel({ title, icon: Icon, actions, children, className = "" }: {
  title?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[24px] bg-white border border-[#E0E1E6] shadow-sm overflow-hidden min-w-0 ${className}`}>
      {title && (
        <div className="p-4 md:p-5 border-b border-[#E0E1E6] flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-bold text-[#1B173A] flex items-center gap-2">
            {Icon && <Icon size={18} className="text-[#5850DE]" />}
            {title}
          </h3>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-[#F0F4FF] border-[#D9E2FF] text-[#3B3F99]",
  }[tone];
  return <div className={`p-3 mb-4 border rounded-lg text-sm ${styles}`}>{children}</div>;
}

export function EmptyState({ icon: Icon, title, text }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  text?: string;
}) {
  return (
    <div className="p-5 md:p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[#F0F0F3] flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-[#8E8E93]" />
      </div>
      <h4 className="text-base font-bold text-[#1B173A] mb-1">{title}</h4>
      {text && <p className="text-[#60646C] text-sm max-w-md mx-auto">{text}</p>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon }: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className="rounded-[20px] p-4 md:p-5 bg-white border border-[#E0E1E6] shadow-sm min-w-0">
      <div className="w-10 h-10 rounded-xl bg-[#E1F0FD] text-[#248FEC] flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <div className="text-2xl md:text-3xl font-extrabold text-[#1B173A] leading-none break-words">{value}</div>
      <div className="text-sm font-medium text-[#60646C] mt-1.5">{label}</div>
    </div>
  );
}

export const thClass = "p-3 md:p-4 text-xs font-bold text-[#8E8E93] uppercase tracking-widest whitespace-nowrap";
export const tdClass = "p-3 md:p-4 text-sm text-[#60646C] font-medium";
export const primaryBtn =
  "bg-[#5850DE] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#4A42C7] transition inline-flex items-center gap-1 disabled:opacity-50";
export const secondaryBtn =
  "bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-[#5850DE] transition inline-flex items-center gap-1 disabled:opacity-50";
export const dangerBtn =
  "bg-white border border-[#E0E1E6] text-[#1B173A] text-xs font-bold px-4 py-2 rounded-lg hover:border-red-400 hover:text-red-500 transition inline-flex items-center gap-1 disabled:opacity-50";
export const inputClass =
  "w-full rounded-lg border border-[#E0E1E6] bg-white px-3 py-2 text-sm text-[#1B173A] focus:outline-none focus:ring-2 focus:ring-[#5850DE]/30";
