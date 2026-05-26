import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '@/types';

const SESSION_COOKIE = 'session';

async function getSessionUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

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

export async function middleware(request: NextRequest) {
  try {
    // Allow access to login page without authentication
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.next();
    }

    const user = await getSessionUserFromRequest(request);

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
