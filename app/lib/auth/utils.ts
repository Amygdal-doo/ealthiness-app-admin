import type { User, UserRole } from './types';
import { USER_ROLE_PERMISSIONS } from './types';

export function getUserPermissions(role: UserRole) {
  return USER_ROLE_PERMISSIONS[role];
}

export function hasPermission(userRole: UserRole, permission: keyof typeof USER_ROLE_PERMISSIONS[UserRole]): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions[permission];
}

export function isAuthorizedForRoute(userRole: UserRole, route: string): boolean {
  const permissions = getUserPermissions(userRole);
  
  // Define route permissions
  const routePermissions: Record<string, keyof typeof permissions> = {
    '/companies': 'canManageCompanies',
    '/countries': 'canManageCountries',
    '/customers': 'canManageUsers',
    '/settings': 'canManageSystem',
  };
  
  const requiredPermission = routePermissions[route];
  if (!requiredPermission) {
    return true; // Allow access to routes without specific permissions
  }
  
  return permissions[requiredPermission];
}

export function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function transformApiUser(apiUser: any): User {
  // Determine the best admin role for this user
  const adminRoles = ['SUPER_ADMIN', 'COUNTRY_ADMIN', 'REGIONAL_ADMIN', 'COMPANY_ADMIN'];
  const userAdminRoles = apiUser.roles?.filter((role: string) => adminRoles.includes(role)) || [];
  
  // Use the highest priority admin role if available, otherwise use currentRole
  let effectiveRole = apiUser.currentRole as UserRole;
  if (userAdminRoles.length > 0) {
    // Priority order: SUPER_ADMIN > COUNTRY_ADMIN > REGIONAL_ADMIN > COMPANY_ADMIN
    const rolePriority = ['SUPER_ADMIN', 'COUNTRY_ADMIN', 'REGIONAL_ADMIN', 'COMPANY_ADMIN'];
    effectiveRole = rolePriority.find(role => userAdminRoles.includes(role)) as UserRole || apiUser.currentRole;
  }
  
  const user: User = {
    ...apiUser,
    // Computed properties for backwards compatibility
    id: apiUser._id,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    role: effectiveRole,
  };
  
  return user;
}