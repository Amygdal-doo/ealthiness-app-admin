import type { Route } from "./+types/home";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";
import HomeContainer from "~/components/home/HomeContainer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Comprehensive admin dashboard for the Ealthiness wellness platform",
    },
  ];
}

export default function Home() {
  const user = useUser();

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

  // Allow all admin roles to access dashboard (SUPER_ADMIN gets global view, others get scoped view)

  const userData = {
    userRole: user.role,
    user: user
  };
  
  return (
    <RoleGuard requireAdminRole>
      <HomeContainer userData={userData} />
    </RoleGuard>
  );
}
