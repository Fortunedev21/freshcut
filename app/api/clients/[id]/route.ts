import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET client profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return errorResponse('Client not found', 404);
    }

    return successResponse(client);
  } catch (error) {
    return errorResponse('Failed to fetch client', 500);
  }
}

// PUT update client info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
      },
    });

    return successResponse(client);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return errorResponse('Client not found', 404);
    }
    return errorResponse('Failed to update client', 500);
  }
}
