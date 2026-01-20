import jwt from 'jsonwebtoken';
import { redirect } from '@remix-run/node';
import { getAdminByUsername } from '~/Services/admin.prisma.server';
import { verifyPassword } from './password.server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '1d';
const JWT_EXPIRES_IN_REMEMBER = '7d';

export interface AdminPayload {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

/**
 * Generate JWT token for admin
 */
export function generateAdminToken(admin: { id: string; username: string; email?: string | null; role: string }): string {
  const payload: AdminPayload = {
    id: admin.id,
    username: admin.username,
    email: admin.email || null,
    role: admin.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 */
export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

/**
 * Authenticate admin with username and password
 */
export async function authenticateAdmin(username: string, password: string) {
  const admin = await getAdminByUsername(username);
  
  if (!admin) {
    return null;
  }
  
  const isValid = await verifyPassword(password, admin.password!);
  
  if (!isValid) {
    return null;
  }
  
  return admin;
}

/**
 * Get admin from request cookie
 */
export async function getAdminFromRequest(request: Request): Promise<AdminPayload | null> {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  
  const match = cookie.match(/admin_token=([^;]+)/);
  if (!match) return null;
  
  return verifyAdminToken(match[1]);
}

/**
 * Require authenticated admin
 */
export async function requireAdmin(request: Request): Promise<AdminPayload> {
  const admin = await getAdminFromRequest(request);
  
  if (!admin) {
    throw redirect('/login?type=admin');
  }
  
  return admin;
}

/**
 * Create admin session cookie
 */
export function createAdminSession(token: string, rememberMe: boolean = false): string {
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
  return `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

/**
 * Destroy admin session cookie
 */
export function destroyAdminSession(request: Request): Response {
    // Note: This logic seems to conflict with how some routes usually return redirects with headers.
    // But since logout.tsx imports it, it likely expects a redirect response OR just the cookie string?
    // Looking at routes/admin/logout.tsx: return destroyAdminSession(request) from an action/loader.
    // So it MUST return a Response object (likely a redirect).
    
    return redirect('/login?type=admin', {
        headers: {
            'Set-Cookie': 'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
        }
    });
}
