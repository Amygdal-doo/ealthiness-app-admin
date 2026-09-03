import { redirect } from "react-router";
import type { User, Session, ApiAuthResponse } from "./types";
import {
  createSessionCookie,
  createLogoutCookie,
  getSessionFromRequest as getSessionTokenFromRequest,
} from "./cookies";
import { getUserFromToken, refreshAuthToken } from "../services/user.service";

export async function createSession(
  user: User,
  tokens: ApiAuthResponse,
): Promise<{ token: string; cookie: string }> {
  // Store the access token as our session token
  const cookie = createSessionCookie(tokens.accessToken);

  return { token: tokens.accessToken, cookie };
}

export async function getSessionFromRequest(
  request: Request,
): Promise<Session | null> {
  const token = getSessionTokenFromRequest(request);
  if (!token) return null;

  try {
    // Get user info from the access token
    const user = getUserFromToken(token);
    if (!user) return null;

    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationDate = new Date(payload.exp * 1000);

    if (Date.now() >= payload.exp * 1000) {
      // Token is expired
      return null;
    }

    return {
      userId: user.id,
      user,
      expiresAt: expirationDate,
    };
  } catch (error) {
    console.error("Error getting session from request:", error);
    return null;
  }
}

export async function requireAuth(request: Request): Promise<Session> {
  const session = await getSessionFromRequest(request);

  if (!session) {
    throw redirect("/");
  }

  return session;
}

export async function requireRole(
  request: Request,
  allowedRoles: Array<User["role"]>,
): Promise<Session> {
  const session = await requireAuth(request);

  if (!allowedRoles.includes(session.user.role)) {
    throw redirect("/unauthorized");
  }

  return session;
}

export async function getOptionalSession(
  request: Request,
): Promise<Session | null> {
  try {
    return await getSessionFromRequest(request);
  } catch (error) {
    console.error("Error getting optional session:", error);
    return null;
  }
}

export function destroySession(): string {
  return createLogoutCookie();
}

export async function isAuthenticated(request: Request): Promise<boolean> {
  const session = await getOptionalSession(request);
  return session !== null;
}

export async function getCurrentUser(request: Request): Promise<User | null> {
  const session = await getOptionalSession(request);
  return session?.user || null;
}
