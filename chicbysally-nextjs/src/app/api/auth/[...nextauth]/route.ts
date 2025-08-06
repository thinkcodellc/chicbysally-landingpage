import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Config kept minimal; Facebook/Twitter hidden for now
const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};

/**
 * For App Router, use the named handlers returned by NextAuth(authConfig).
 * NextAuth v5+ returns an object with { handlers, auth, signIn, signOut }.
 * Export GET/POST from handlers to satisfy Next.js route typing.
 */
/**
 * Export only GET/POST handlers from this file to satisfy Next.js route typing.
 * Re-export auth utilities from a library file to avoid adding extra exports here.
 */
const { handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;
