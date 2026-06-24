import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// PUT/PATCH update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('Statut manquant', 400);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return successResponse(order, 'Statut de la commande mis à jour');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Non autorisé', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Veuillez vous connecter d\'abord', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Commande introuvable', 404);
    }
    return errorResponse('Échec de la mise à jour de la commande', 500);
  }
}

// DELETE order (SUPER_ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN']);
    const { id } = await params;

    await prisma.order.delete({
      where: { id },
    });

    return successResponse(null, 'Commande supprimée');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Seul le SuperAdmin peut supprimer une commande', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Veuillez vous connecter d\'abord', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Commande introuvable', 404);
    }
    return errorResponse('Échec de la suppression de la commande', 500);
  }
}
