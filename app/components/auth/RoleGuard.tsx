import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import type { UserRole } from '~/lib/auth/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAdminRole?: boolean;
  fallback?: React.ReactNode;
}

const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN', 'COUNTRY_ADMIN', 'REGION_ADMIN', 'COMPANY_ADMIN'];

export function RoleGuard({ 
  children, 
  allowedRoles,
  requireAdminRole = false,
  fallback 
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      navigate('/', { replace: true });
      return;
    }

    // Check if admin role is required
    if (requireAdminRole && !ADMIN_ROLES.includes(user.role)) {
      navigate('/unauthorized', { replace: true });
      return;
    }

    // Check specific role requirements
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [user, isLoading, isAuthenticated, navigate, allowedRoles, requireAdminRole]);

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

  if (!isAuthenticated || !user) {
    return fallback || null;
  }

  // Check role requirements
  if (requireAdminRole && !ADMIN_ROLES.includes(user.role)) {
    return fallback || null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback || null;
  }

  return <>{children}</>;
}