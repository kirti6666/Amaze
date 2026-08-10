import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Runs on every Google sign-in — creates the user in our own User collection
    // if this is their first time, so Google users and credential users share
    // one identity model (role, wishlist, addresses, etc. all live in one place).
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name: user.name ?? "Google User",
            email: user.email,
            avatar: user.image,
            provider: "google",
            role: "customer", // Google sign-in never grants admin — admin is seeded/manual only
            isVerified: true,
          });
        }
      }
      return true;
    },

    // Attach our own Mongo _id and role onto the token so downstream code
    // (requireAuth, getServerUser) can treat NextAuth and JWT users identically.
    async jwt({ token, user, account }) {
      if (account && user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as "customer" | "admin";
      }
      return session;
    },
  },
};
