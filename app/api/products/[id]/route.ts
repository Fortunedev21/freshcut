import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error) {
    return errorResponse('Failed to fetch product', 500);
  }
}

// PUT update product (SUPER_ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN']);
    const { id } = await params;

    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom }),
        ...(body.categorie && { categorie: body.categorie }),
        ...(body.prix && { prix: parseInt(body.prix) }),
        ...(body.description && { description: body.description }),
        ...(body.image && { image: body.image }),
        ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
      },
    });

    return successResponse(product, 'Product updated');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only SuperAdmin can update products', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Product not found', 404);
    }
    return errorResponse('Failed to update product', 500);
  }
}

// DELETE product (SUPER_ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['SUPER_ADMIN']);
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return successResponse(null, 'Product deleted');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only SuperAdmin can delete products', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Product not found', 404);
    }
    return errorResponse('Failed to delete product', 500);
  }
}
