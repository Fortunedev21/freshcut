// lib/auth.config.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
//import prisma from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !(await bcrypt.compare(credentials.password as string, user.password))) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
      async jwt({ token, user }: { token: JWT; user?: { id: string; role?: string } }) { if (user) { token.role = user.role; token.id = user.id; } return token; },
      async session({ session, token }: { session: Session; token: JWT }) { if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; } return session; }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
};

const handler = NextAuth(authOptions);
export { handler };