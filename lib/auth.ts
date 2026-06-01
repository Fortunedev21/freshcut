// lib/auth.ts
import { getServerSession as nextGetServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";

export async function getServerSession() {
  return await nextGetServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export async function requireRole(requiredRoles: string[]) {
  const session = await getServerSession();
  const userRole = (session?.user as any)?.role;

  if (!userRole || !hasRole(userRole, requiredRoles)) {
    throw new Error('Forbidden');
  }

  return session?.user ?? null;
}
