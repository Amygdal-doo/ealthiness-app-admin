import type { Route } from "./+types/unauthorized";
import { Link } from "react-router";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Unauthorized - Ealthiness Admin" },
    { name: "description", content: "You don't have permission to access this page" },
  ];
}

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] via-white to-[#F0F4FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Sorry, you don't have permission to access this page. Your current role doesn't allow access to this resource.
          </p>
          
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Current Role:</strong> {user.role.replace('_', ' ').toLowerCase()}
              </p>
              <p className="text-sm text-gray-700">
                <strong>User:</strong> {user.name}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link to="/" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            
            <Button
              asChild
              className="flex-1"
              onClick={() => window.history.back()}
            >
              <button className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}