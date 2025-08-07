import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
// Temporarily hide Facebook and X (Twitter) providers
// import Facebook from "next-auth/providers/facebook";
// import Twitter from "next-auth/providers/twitter";

const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Facebook({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
    // Twitter({
    //   clientId: process.env.TWITTER_CLIENT_ID!,
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    // }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        // augment session at runtime
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

// Export NextAuth utilities for use across the app
export const { auth, signIn, signOut, handlers } = NextAuth(config);
