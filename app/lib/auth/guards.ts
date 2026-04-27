import { redirect } from 'react-router';
import type { User, UserRole } from './types';
import { requireAuth, requireRole, getCurrentUser, isAuthenticated } from './session.server';
import { isAuthorizedForRoute } from './utils';

export async function protectRoute(request: Request) {
  const session = await requireAuth(request);
  return session;
}

export async function protectAdminRoute(request: Request) {
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'COUNTRY_ADMIN', 'REGION_ADMIN'];
  const session = await requireRole(request, allowedRoles);
  return session;
}

export async function protectSuperAdminRoute(request: Request) {
  const allowedRoles: UserRole[] = ['SUPER_ADMIN'];
  const session = await requireRole(request, allowedRoles);
  return session;
}

export async function protectCountryAdminRoute(request: Request) {
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'COUNTRY_ADMIN'];
  const session = await requireRole(request, allowedRoles);
  return session;
}

export async function protectRegionAdminRoute(request: Request) {
  const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'COUNTRY_ADMIN', 'REGION_ADMIN'];
  const session = await requireRole(request, allowedRoles);
  return session;
}

export async function redirectIfAuthenticated(request: Request, redirectTo: string = '/') {
  const authenticated = await isAuthenticated(request);
  if (authenticated) {
    throw redirect(redirectTo);
  }
}

export async function createRouteLoader(
  requiredRoles?: UserRole[],
  routePath?: string
) {
  return async ({ request }: { request: Request }) => {
    if (requiredRoles) {
      const session = await requireRole(request, requiredRoles);
      
      // Additional route-specific authorization
      if (routePath && !isAuthorizedForRoute(session.user.role, routePath)) {
        throw redirect('/unauthorized');
      }
      
      return { user: session.user };
    }
    
    // For protected routes without specific role requirements
    const session = await requireAuth(request);
    
    // Additional route-specific authorization
    if (routePath && !isAuthorizedForRoute(session.user.role, routePath)) {
      throw redirect('/unauthorized');
    }
    
    return { user: session.user };
  };
}

export async function createOptionalAuthLoader() {
  return async ({ request }: { request: Request }) => {
    const user = await getCurrentUser(request);
    return { user };
  };
}