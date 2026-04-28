import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  try {
    // Allow access to login page without authentication
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.next();
    }

    const user = await getSessionUser();

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
