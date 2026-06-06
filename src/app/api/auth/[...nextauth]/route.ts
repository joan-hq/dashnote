import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from '@/db/index';
import { users } from "@/db/schema";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async signIn({ user }) {
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") ?? [];
      if (!allowedEmails.includes(user.email!)) return false;
      
      await db.insert(users)
        .values({
          id:user.id!,
          email: user.email!,
          name: user.name,
          image: user.image,
        })
        .onConflictDoNothing();
      
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };