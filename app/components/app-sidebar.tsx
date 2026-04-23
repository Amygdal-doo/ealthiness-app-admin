import { Link, useLocation } from "react-router";
import {
  LayoutDashboardIcon,
  GlobeIcon,
  BuildingIcon,
  UsersIcon,
  GiftIcon,
  FileSpreadsheetIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/lib/auth";
import { ROLE_LABELS, type Role } from "~/lib/types";
import {
  canViewCountries,
  canViewCompanies,
  canViewEmployees,
  canManageBonuses,
  canExportImport,
} from "~/lib/permissions";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: (role: Role) => boolean;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboardIcon,
    visible: () => true,
  },
  {
    title: "Countries",
    href: "/countries",
    icon: GlobeIcon,
    visible: canViewCountries,
  },
  {
    title: "Companies",
    href: "/companies",
    icon: BuildingIcon,
    visible: canViewCompanies,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: UsersIcon,
    visible: canViewEmployees,
  },
  {
    title: "Bonuses & Gifts",
    href: "/bonuses",
    icon: GiftIcon,
    visible: canManageBonuses,
  },
  {
    title: "Export / Import",
    href: "/exports",
    icon: FileSpreadsheetIcon,
    visible: canExportImport,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    visible: () => true,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const visibleItems = navItems.filter((item) => item.visible(user.role));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">E</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Ealthiness</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={
                      item.href === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                    render={<Link to={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-1">
          <Badge variant="outline" className="w-full justify-center text-xs">
            {ROLE_LABELS[user.role]}
          </Badge>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOutIcon />
              <span>Sign out ({user.name})</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
