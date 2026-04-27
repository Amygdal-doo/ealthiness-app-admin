import { serialize, parse } from 'cookie';

export const SESSION_COOKIE_NAME = 'ealthiness-session';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

export function createSessionCookie(token: string): string {
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
  };

  return serialize(SESSION_COOKIE_NAME, token, options);
}

export function createLogoutCookie(): string {
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Immediately expire
    path: '/',
  };

  return serialize(SESSION_COOKIE_NAME, '', options);
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  return parseSessionCookie(cookieHeader);
}