import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return errorResponse('Missing required fields', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('Email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ⚠️ NO ADMIN/SUPER_ADMIN ACCOUNTS VIA REGISTRATION
    // Only SUPER_ADMIN can create ADMIN accounts via API
    // Clients/general users cannot be created with admin roles

    // Create user with default ADMIN role for now (will be used by clients)
    // But we block this endpoint - only SUPER_ADMIN creates staff
    return errorResponse(
      'Admin account creation is restricted. Contact SuperAdmin.',
      403
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse('Failed to register user', 500);
  }
}
