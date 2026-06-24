import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET all orders (ADMIN or SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(orders);
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Seuls les administrateurs peuvent voir les commandes', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Veuillez vous connecter d\'abord', 401);
    }
    return errorResponse('Impossible de récupérer les commandes', 500);
  }
}
