import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET all coupes (public) or filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const difficulte = searchParams.get('difficulte');

    const coupes = await prisma.coupe.findMany({
      where: difficulte ? { difficulte: parseInt(difficulte) } : {},
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(coupes);
  } catch (error) {
    return errorResponse('Failed to fetch coupes', 500);
  }
}

// POST create new coupe (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN']);

    const body = await request.json();
    const { nom, description, tempsEstimation, difficulte, image, conseils } = body;

    if (!nom || !description || !image || difficulte === undefined) {
      return errorResponse('Missing required fields', 400);
    }

    const coupe = await prisma.coupe.create({
      data: {
        nom,
        description,
        tempsEstimation,
        difficulte: parseInt(difficulte),
        image,
        conseils: conseils || [],
      },
    });

    return successResponse(coupe, 'Coupe created', 201);
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only SuperAdmin can create coupes', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    return errorResponse('Failed to create coupe', 500);
  }
}
