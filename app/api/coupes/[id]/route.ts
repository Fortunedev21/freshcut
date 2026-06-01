import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET single coupe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const coupe = await prisma.coupe.findUnique({
      where: { id },
    });

    if (!coupe) {
      return errorResponse('Coupe not found', 404);
    }

    return successResponse(coupe);
  } catch (error) {
    return errorResponse('Failed to fetch coupe', 500);
  }
}

// PUT update coupe (SUPER_ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN']);
    const { id } = await params;

    const body = await request.json();

    const coupe = await prisma.coupe.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom }),
        ...(body.description && { description: body.description }),
        ...(body.tempsEstimation && { tempsEstimation: body.tempsEstimation }),
        ...(body.difficulte !== undefined && { difficulte: parseInt(body.difficulte) }),
        ...(body.image && { image: body.image }),
        ...(body.conseils && { conseils: body.conseils }),
      },
    });

    return successResponse(coupe, 'Coupe updated');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only SuperAdmin can update coupes', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Coupe not found', 404);
    }
    return errorResponse('Failed to update coupe', 500);
  }
}

// DELETE coupe (SUPER_ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN']);
    const { id } = await params;

    await prisma.coupe.delete({
      where: { id },
    });

    return successResponse(null, 'Coupe deleted');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only SuperAdmin can delete coupes', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Coupe not found', 404);
    }
    return errorResponse('Failed to delete coupe', 500);
  }
}
