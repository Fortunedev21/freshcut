import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET loyalty points
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      select: { points: true, totalSpent: true },
    });

    if (!client) {
      return errorResponse('Client not found', 404);
    }

    return successResponse(client);
  } catch (error) {
    return errorResponse('Failed to fetch loyalty points', 500);
  }
}
