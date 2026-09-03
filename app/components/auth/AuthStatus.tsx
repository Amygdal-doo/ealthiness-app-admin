import React from "react";
import { Form } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { LogOut, User, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";

export function AuthStatus() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "COUNTRY_ADMIN":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "REGIONAL_ADMIN":
        return <Shield className="w-4 h-4 text-green-500" />;
      case "COMPANY_ADMIN":
        return <Shield className="w-4 h-4 text-orange-500" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "COUNTRY_ADMIN":
        return "Country Admin";
      case "REGIONAL_ADMIN":
        return "Region Admin";
      case "COMPANY_ADMIN":
        return "Company Admin";
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
        {getRoleIcon(user.role)}
        <div className="text-sm">
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-gray-500">{getRoleLabel(user.role)}</div>
        </div>
      </div>

      <Form action="/auth/signout" method="post">
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </Form>
    </div>
  );
}

export function UserInfo() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <User className="w-5 h-5 text-gray-500" />
      <span className="text-sm text-gray-700">{user.name}</span>
    </div>
  );
}

export function RoleBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "COUNTRY_ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REGIONAL_ADMIN":
        return "bg-green-100 text-green-800 border-green-200";
      case "COMPANY_ADMIN":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "COUNTRY_ADMIN":
        return "Country Admin";
      case "REGIONAL_ADMIN":
        return "Region Admin";
      case "COMPANY_ADMIN":
        return "Company Admin";
      default:
        return role;
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-md border ${getRoleBadgeColor(
        user.role,
      )}`}
    >
      {getRoleLabel(user.role)}
    </span>
  );
}
