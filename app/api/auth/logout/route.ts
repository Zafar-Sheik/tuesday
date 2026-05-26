import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'session';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
    });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
