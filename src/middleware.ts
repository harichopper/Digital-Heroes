export { default } from 'next-auth/middleware';

/**
 * NextAuth middleware — protects /dashboard and /admin routes.
 * Admin role check is done at the page/layout level via getServerSession.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
