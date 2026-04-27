import { useAuth as useAuthContext } from '~/contexts/AuthContext';
import type { User, UserRole, UserPermissions } from '~/lib/auth/types';
import { getUserPermissions, hasPermission } from '~/lib/auth/utils';

export function useAuth() {
  return useAuthContext();
}

export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role || null;
}

export function useUserPermissions(): UserPermissions | null {
  const { user } = useAuth();
  return user ? getUserPermissions(user.role) : null;
}

export function useHasPermission(permission: keyof UserPermissions): boolean {
  const { user } = useAuth();
  return user ? hasPermission(user.role, permission) : false;
}

export function useCanManageUsers(): boolean {
  return useHasPermission('canManageUsers');
}

export function useCanManageCompanies(): boolean {
  return useHasPermission('canManageCompanies');
}

export function useCanManageCountries(): boolean {
  return useHasPermission('canManageCountries');
}

export function useCanManageRegions(): boolean {
  return useHasPermission('canManageRegions');
}

export function useCanViewAnalytics(): boolean {
  return useHasPermission('canViewAnalytics');
}

export function useCanManageSystem(): boolean {
  return useHasPermission('canManageSystem');
}

export function useIsSuperAdmin(): boolean {
  const role = useUserRole();
  return role === 'SUPER_ADMIN';
}

export function useIsCountryAdmin(): boolean {
  const role = useUserRole();
  return role === 'COUNTRY_ADMIN';
}

export function useIsRegionAdmin(): boolean {
  const role = useUserRole();
  return role === 'REGION_ADMIN';
}

export function useIsCompanyAdmin(): boolean {
  const role = useUserRole();
  return role === 'COMPANY_ADMIN';
}