import jwt from 'jsonwebtoken';
import { redirect } from '@remix-run/node';
import { getAuthorByUsername } from '~/Services/author-management.server';
import { verifyPassword } from './password.server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthorPayload {
  authorId: string;
  username: string;
  email: string;
  role: 'author' | 'superadmin';
  mustChangePassword: boolean;
}

/**
 * Generate JWT token for author
 */
export function generateAuthorToken(payload: AuthorPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 */
export function verifyAuthorToken(token: string): AuthorPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthorPayload;
  } catch {
    return null;
  }
}

/**
 * Authenticate author with username and password
 */
export async function authenticateAuthor(username: string, password: string) {
  const author = await getAuthorByUsername(username);
  
  if (!author || !author.password) {
    return null;
  }
  
  const isValid = await verifyPassword(password, author.password);
  
  if (!isValid) {
    return null;
  }
  
  return {
    authorId: author.authorId,
    username: author.username,
    email: author.email || '',
    role: author.role as 'author' | 'superadmin',
    mustChangePassword: author.mustChangePassword
  };
}

/**
 * Get author from request cookie
 */
export async function getAuthorFromRequest(request: Request): Promise<AuthorPayload | null> {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  
  const match = cookie.match(/author_token=([^;]+)/);
  if (!match) return null;
  
  return verifyAuthorToken(match[1]);
}

/**
 * Require authenticated author (any role)
 */
export async function requireAuthor(request: Request): Promise<AuthorPayload> {
  const author = await getAuthorFromRequest(request);
  
  if (!author) {
    throw redirect('/login?type=author');
  }
  
  // If must change password, redirect to change password page
  if (author.mustChangePassword && !request.url.includes('/change-password')) {
    throw redirect('/authors/change-password');
  }
  
  return author;
}

/**
 * Require superadmin role
 */
export async function requireSuperAdmin(request: Request): Promise<AuthorPayload> {
  const author = await requireAuthor(request);
  
  if (author.role !== 'superadmin') {
    throw redirect('/authors/dashboard');
  }
  
  return author;
}

/**
 * Create author session cookie
 */
export function createAuthorSession(token: string): string {
  return `author_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

/**
 * Destroy author session cookie
 */
export function destroyAuthorSession(): string {
  return 'author_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}

