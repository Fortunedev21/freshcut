import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET all services
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorie = searchParams.get('categorie');

    const services = await prisma.service.findMany({
      where: categorie ? { categorie } : {},
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(services);
  } catch (error) {
    return errorResponse('Failed to fetch services', 500);
  }
}

// POST create new service (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN']);

    const body = await request.json();
    const { nom, categorie, description, duree, prix, badge } = body;

    if (!nom || !categorie || !description || !duree || !prix) {
      return errorResponse('Missing required fields', 400);
    }

    const service = await prisma.service.create({
      data: {
        nom,
        categorie,
        description,
        duree: parseInt(duree),
        prix: parseInt(prix),
        badge,
      },
    });

    return successResponse(service, 'Service created', 201);
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only SuperAdmin can create services', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    return errorResponse('Failed to create service', 500);
  }
}
