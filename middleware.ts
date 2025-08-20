import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disable authentication middleware
  // This allows the site to work while we fix the authentication system
  
  // Allow all requests to pass through without authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
