import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET all products or filter by category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorie = searchParams.get('categorie');

    const products = await prisma.product.findMany({
      where: categorie ? { categorie } : {},
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(products);
  } catch (error) {
    return errorResponse('Failed to fetch products', 500);
  }
}

// POST create new product (ADMIN or SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const body = await request.json();
    const { nom, categorie, prix, description, image, stock } = body;

    if (!nom || !categorie || !prix) {
      return errorResponse('Missing required fields', 400);
    }

    const product = await prisma.product.create({
      data: {
        nom,
        categorie,
        prix: parseInt(prix),
        description,
        image,
        stock: parseInt(stock) || 0,
      },
    });

    return successResponse(product, 'Product created', 201);
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only admin can create products', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    return errorResponse('Failed to create product', 500);
  }
}
