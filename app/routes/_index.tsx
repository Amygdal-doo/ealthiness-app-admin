import type { Route } from "./+types/_index";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import LoginContainer from "~/components/login/LoginContainer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Secure login to the Ealthiness admin platform",
    },
  ];
}

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated and has admin role, redirect to home
    if (!isLoading && isAuthenticated && user) {
      const adminRoles = [
        "SUPER_ADMIN",
        "COUNTRY_ADMIN",
        "REGIONAL_ADMIN",
        "COMPANY_ADMIN",
        "PSYCHOLOGIST",
      ];
      if (adminRoles.includes(user.role)) {
        navigate("/home", { replace: true });
      } else {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated or doesn't have admin role
  if (!isAuthenticated || !user) {
    return <LoginContainer />;
  }

  // If authenticated but doesn't have admin role, this will be handled by the useEffect
  return <LoginContainer />;
}
