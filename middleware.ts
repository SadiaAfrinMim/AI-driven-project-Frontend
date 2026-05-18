import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value;

  const { pathname } = request.nextUrl;

  // Public paths
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/help'
  ) {
    return NextResponse.next();
  }

  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  const adminRoutes = ['/dashboard/users', '/dashboard/approvals', '/dashboard/analytics'];
  const managerRoutes = ['/dashboard/analytics', '/dashboard/users'];

  if (adminRoutes.some(route => pathname.startsWith(route)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (managerRoutes.some(route => pathname.startsWith(route)) && !['ADMIN', 'MANAGER'].includes(role || '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};