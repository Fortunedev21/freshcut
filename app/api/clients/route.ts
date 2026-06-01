import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * POST /api/clients
 * 
 * Client login/registration by phone number (NO double validation)
 * - If phone exists → return client data
 * - If phone new → create client automatically
 * 
 * Body: { phone, firstName?, lastName? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, firstName, lastName } = body;

    if (!phone) {
      return errorResponse('Phone number is required', 400);
    }

    // Normalize phone (basic validation)
    if (phone.length < 8) {
      return errorResponse('Invalid phone number', 400);
    }

    // Upsert: find or create client
    const client = await prisma.client.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        firstName: firstName || 'Client',
        lastName: lastName || 'Freshcut',
        points: 0,
        totalSpent: 0,
      },
    });

    return successResponse(client, 'Login successful', 200);
  } catch (error: any) {
    console.error('Client login error:', error);
    return errorResponse('Failed to process login', 500);
  }
}

/**
 * GET /api/clients?phone=+22967123456
 * 
 * Get client profile by phone (public)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return errorResponse('Phone parameter required', 400);
    }

    const client = await prisma.client.findUnique({
      where: { phone },
    });

    if (!client) {
      return errorResponse('Client not found', 404);
    }

    return successResponse(client);
  } catch (error) {
    return errorResponse('Failed to fetch client', 500);
  }
}
