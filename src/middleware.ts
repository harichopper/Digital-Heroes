import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {
    // Keep middleware strictly auth-focused on Vercel.
    // Vercel terminates TLS and serves deployment URLs over HTTPS.
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
