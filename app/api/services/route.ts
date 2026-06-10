import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

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
    console.error("❌ ERREUR CRITIQUE DANS GET /api/services :", error);
    return errorResponse('Failed to fetch services', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const body = await request.json();
    const { nom, categorie, description, duree, badge, prix } = body;

    if (!nom || !categorie || !description || !duree || prix === undefined) {
      return errorResponse('Missing required fields', 400);
    }

    const service = await prisma.service.create({
      data: {
        nom,
        categorie,
        description,
        duree: parseInt(duree),
        prix: parseInt(prix.toString()),
        badge,
      },
    });

    return successResponse(service, 'Service created', 201);
  } catch (error: any) {
    console.error("❌ ERREUR CRITIQUE DANS POST /api/services :", error);
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to create service', 500);
  }
}