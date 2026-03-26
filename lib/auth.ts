import { cookies } from 'next/headers';
import { SessionUser } from '@/types';

const SESSION_COOKIE = 'session';

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const user = JSON.parse(sessionCookie.value) as SessionUser;
    return user;
  } catch {
    return null;
  }
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function requireRole(roles: string[]): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }
  if (!roles.includes(user.role)) {
    return null;
  }
  return user;
}
