import { withAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    // Enforce HTTPS in production deployments.
    if (process.env.NODE_ENV === 'production') {
      const proto = req.headers.get('x-forwarded-proto');
      if (proto === 'http') {
        const httpsUrl = new URL(req.url);
        httpsUrl.protocol = 'https:';
        return NextResponse.redirect(httpsUrl);
      }
    }

    return NextResponse.next();
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
