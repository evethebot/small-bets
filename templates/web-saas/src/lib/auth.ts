import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { createAdminClient } from "./db";

/**
 * NextAuth.js v5 Configuration
 *
 * Providers: Google, GitHub (add more as needed)
 * Strategy: JWT (lightweight, no session table needed)
 * User sync: Creates/updates user in Supabase on sign-in
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        // First sign-in: sync user to Supabase
        const supabase = createAdminClient();

        const { data: existingUser } = await supabase
          .from("users")
          .select("id, subscription_status, subscription_plan")
          .eq("email", user.email!)
          .single();

        if (existingUser) {
          token.userId = existingUser.id;
          token.subscriptionStatus = existingUser.subscription_status;
          token.subscriptionPlan = existingUser.subscription_plan;
        } else {
          // Create new user
          const { data: newUser } = await supabase
            .from("users")
            .insert({
              email: user.email!,
              name: user.name,
              avatar_url: user.image,
            })
            .select("id")
            .single();

          if (newUser) {
            token.userId = newUser.id;
            token.subscriptionStatus = "inactive";
            token.subscriptionPlan = "free";
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        (session as any).subscriptionStatus = token.subscriptionStatus;
        (session as any).subscriptionPlan = token.subscriptionPlan;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isApi = nextUrl.pathname.startsWith("/api");
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth");

      // Protect dashboard routes
      if (isDashboard && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Allow auth API routes
      if (isAuthApi) return true;

      return true;
    },
  },
});

// ============================================
// Type augmentation for session
// ============================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    subscriptionStatus?: string | null;
    subscriptionPlan?: string | null;
  }
}

declare module "next-auth" {
  interface JWT {
    userId?: string;
    subscriptionStatus?: string | null;
    subscriptionPlan?: string | null;
  }
}
