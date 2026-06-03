import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { ClientType } from '@prisma/client';

interface PriceInput {
  clientType: ClientType;
  prix: number | string;
  instructions?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorie = searchParams.get('categorie');

    const services = await prisma.service.findMany({
      where: categorie ? { categorie } : {},
      include: {
        prices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(services);
  } catch (error) {
    return errorResponse('Failed to fetch services', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const body = await request.json();
    const { nom, categorie, description, duree, badge, prices } = body;

    if (!nom || !categorie || !description || !duree || !prices || !Array.isArray(prices)) {
      return errorResponse('Missing required fields', 400);
    }

    const service = await prisma.service.create({
      data: {
        nom,
        categorie,
        description,
        duree: parseInt(duree),
        badge,
        prices: {
          createMany: {
            data: prices.map((p: PriceInput) => ({
              clientType: p.clientType,
              prix: parseInt(p.prix.toString()),
              instructions: p.instructions || "",
            })),
          },
        },
      },
      include: {
        prices: true,
      },
    });

    return successResponse(service, 'Service created', 201);
  } catch (error: any) {
    if (error.message === 'Forbidden') return errorResponse('Forbidden', 403);
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Failed to create service', 500);
  }
}