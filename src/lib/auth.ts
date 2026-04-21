import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

type AppUser = {
  id?: string;
  role?: string;
  name?: string | null;
};

type SessionUserWithMeta = {
  id?: string;
  role?: string;
};

type TokenWithMeta = {
  id?: string;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'digital-heroes-fallback-secret-dev-only',
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('[NextAuth] Missing credentials');
            return null;
          }

          await connectDB();

          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
          });

          if (!user) {
            console.error('[NextAuth] User not found:', credentials.email);
            return null;
          }

          const isValid = await user.comparePassword(credentials.password);

          if (!isValid) {
            console.error('[NextAuth] Invalid password for:', credentials.email);
            return null;
          }

          console.log('[NextAuth] ✅ Authenticated:', user.email, '| Role:', user.role);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName || user.email,
            role: user.role,
          };
        } catch (err) {
          console.error('[NextAuth] authorize() error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as AppUser;
        token.id = appUser.id;
        token.role = appUser.role;
        if (appUser.name) token.name = appUser.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & SessionUserWithMeta;
        const tokenWithMeta = token as typeof token & TokenWithMeta;

        if (typeof tokenWithMeta.id === 'string') sessionUser.id = tokenWithMeta.id;
        if (typeof tokenWithMeta.role === 'string') sessionUser.role = tokenWithMeta.role;
        if (typeof token.name === 'string') session.user.name = token.name;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
