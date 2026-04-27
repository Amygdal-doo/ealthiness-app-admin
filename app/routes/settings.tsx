import React from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/settings";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const isAuthenticated = role !== null;

  if (!isAuthenticated) {
    return redirect("/");
  }

  const userData = {
    user: {
      name:
        role === "super_admin"
          ? "Super Admin"
          : role === "country_admin"
            ? "Country Admin"
            : "Company Admin",
      email:
        role === "super_admin"
          ? "admin@ealthiness.com"
          : role === "country_admin"
            ? "country.admin@ealthiness.com"
            : "company.admin@ealthiness.com",
      role,
    },
  };

  return { userData };
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { userData } = loaderData;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1B173A] mb-8">
          Settings
        </h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E0E1E6]">
          <p className="text-[#60646C] mb-4">
            Manage system settings and configuration.
          </p>
          <p className="text-sm text-[#8E8E93]">
            Current role: {userData.user.role}
          </p>
          <div className="mt-8 p-6 bg-[#F8F9FB] rounded-lg border-2 border-dashed border-[#E0E1E6]">
            <p className="text-center text-[#8E8E93]">
              Settings interface coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
