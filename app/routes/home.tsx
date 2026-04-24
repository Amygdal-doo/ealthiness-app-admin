import type { Route } from "./+types/home";
import { redirect } from "react-router";
import HomeContainer from "../../src/components/home/HomeContainer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Comprehensive admin dashboard for the Ealthiness wellness platform",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  
  // Check authentication - in real app, check session/token
  const isAuthenticated = role !== null; // Simple check for demo
  
  if (!isAuthenticated) {
    return redirect("/login");
  }
  
  return {
    userRole: role || 'super_admin',
    user: {
      name: 'Super Admin',
      email: 'admin@ealthiness.com',
      role: role || 'super_admin'
    }
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomeContainer userData={loaderData} />;
}
