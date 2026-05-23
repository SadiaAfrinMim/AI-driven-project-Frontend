import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== PUBLIC ROUTES (No login required) ====================
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/help',
  '/products',
  '/recommendations',
];

// ==================== ALL LOGGED-IN USERS (USER, MANAGER, ADMIN) ====================
const ALL_USERS_ROUTES = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/reviews',
  '/ai',
];

// ==================== MANAGER + ADMIN ONLY ====================
const MANAGER_ADMIN_ROUTES = [
  '/dashboard/analytics',
  '/dashboard/approvals',
  '/dashboard/items',
];

// ==================== ADMIN ONLY ====================
const ADMIN_ONLY_ROUTES = [
  '/dashboard/users',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const role = (request.cookies.get('role')?.value || '').toUpperCase();

  // 1. Allow all public routes
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isPublic) {
    return NextResponse.next();
  }

  // 2. If no token → redirect to login for any protected route
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Routes allowed for ALL logged-in users
  const isAllUsersRoute = ALL_USERS_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isAllUsersRoute) {
    return NextResponse.next();
  }

  // 4. Routes for MANAGER + ADMIN only
  const isManagerAdminRoute = MANAGER_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isManagerAdminRoute) {
    if (['ADMIN', 'MANAGER'].includes(role)) {
      return NextResponse.next();
    }
    // Unauthorized → send to main dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 5. Routes for ADMIN only (highest privilege)
  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isAdminOnlyRoute) {
    if (role === 'ADMIN') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. Default: allow if user is logged in (future pages will be accessible to all by default)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
