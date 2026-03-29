import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

const roleRoutes: Record<UserRole, string[]> = {
  [UserRole.guest]: ['/'],
  [UserRole.applicant]: ['/applicant'],
  [UserRole.employer]: ['/employer'],
  [UserRole.curator]: ['/curator'],
  [UserRole.admin]: ['/admin'],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const userRole = req.nextauth.token?.role as UserRole;

    // Public routes
    if (
      pathname === '/' ||
      pathname.startsWith('/catalog') ||
      pathname.startsWith('/opportunity') ||
      pathname.startsWith('/company') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/api/auth')
    ) {
      return NextResponse.next();
    }

    // Check role-based access
    if (userRole) {
      const allowedRoutes = roleRoutes[userRole] || [];
      const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

      if (!hasAccess) {
        // Redirect to appropriate dashboard
        const redirectPath = roleRoutes[userRole]?.[0] || '/';
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow public routes
        const { pathname } = req.nextUrl;
        if (
          pathname === '/' ||
          pathname.startsWith('/catalog') ||
          pathname.startsWith('/opportunity') ||
          pathname.startsWith('/company') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/api/auth')
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|uploads).*)'],
};
