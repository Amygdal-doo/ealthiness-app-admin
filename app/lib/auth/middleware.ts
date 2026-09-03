import type { User, UserRole } from "./types";
import { isAuthorizedForRoute } from "./utils";

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  checkRoutePermissions?: boolean;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    requireAuth = true,
    allowedRoles,
    redirectTo = "/",
    checkRoutePermissions = false,
  } = options;

  return async function authMiddleware(
    request: Request,
    user: User | null,
    routePath: string,
  ): Promise<{ authorized: boolean; redirectTo?: string }> {
    // Check if authentication is required
    if (requireAuth && !user) {
      return { authorized: false, redirectTo };
    }

    // If no user is required, allow access
    if (!requireAuth) {
      return { authorized: true };
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return { authorized: false, redirectTo: "/unauthorized" };
    }

    // Check route-specific permissions
    if (
      checkRoutePermissions &&
      user &&
      !isAuthorizedForRoute(user.role, routePath)
    ) {
      return { authorized: false, redirectTo: "/unauthorized" };
    }

    return { authorized: true };
  };
}

// Pre-configured middleware functions
export const requireAuth = createAuthMiddleware({
  requireAuth: true,
});

export const requireAdminAuth = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN"],
});

export const requireSuperAdminAuth = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ["SUPER_ADMIN"],
});

export const requireCountryAdminAuth = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ["SUPER_ADMIN", "COUNTRY_ADMIN"],
});

export const requireRegionAdminAuth = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN"],
});

export const optionalAuth = createAuthMiddleware({
  requireAuth: false,
});
