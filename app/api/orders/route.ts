import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET orders (either by client phone, or all if admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    // If phone parameter is provided, allow public fetching of client's own orders
    if (phone) {
      const orders = await prisma.boutiqueOrder.findMany({
        where: { clientPhone: phone },
        include: {
          items: {
            include: { product: true }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return successResponse(orders);
    }

    // Otherwise require admin role to view all orders
    try {
      await requireRole(['SUPER_ADMIN', 'ADMIN']);
    } catch {
      return errorResponse('Unauthorized', 401);
    }

    const orders = await prisma.boutiqueOrder.findMany({
      include: {
        items: {
          include: { product: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

// POST create a new boutique order (public Checkout flow)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      client,
      items,
      totalAmount,
      shippingCost,
      shippingMethod,
      finalAmount,
      transactionId,
      status
    } = body;

    if (!client || !client.telephone || !client.nom || !client.prenom || !items || !items.length || !transactionId) {
      return errorResponse('Missing required order fields', 400);
    }

    // Execute order creation in a transaction to guarantee atomicity
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the Boutique Order
      const newOrder = await tx.boutiqueOrder.create({
        data: {
          clientPhone: client.telephone,
          firstName: client.prenom,
          lastName: client.nom,
          adresse: client.adresse || null,
          ville: client.ville || null,
          shippingMethod: shippingMethod,
          shippingCost: parseInt(shippingCost) || 0,
          totalAmount: parseInt(totalAmount),
          finalAmount: parseInt(finalAmount),
          status: status || 'PAID',
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantite: parseInt(item.quantite),
              prix: parseInt(item.prix)
            }))
          },
          payment: {
            create: {
              transactionId: transactionId,
              amount: parseInt(finalAmount),
              status: 'SUCCESS'
            }
          }
        },
        include: {
          items: true,
          payment: true
        }
      });

      // 2. Adjust Product stock levels & write logs
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id }
        });
        
        if (product) {
          const newStock = Math.max(0, product.stock - parseInt(item.quantite));
          
          await tx.product.update({
            where: { id: item.id },
            data: { stock: newStock }
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.id,
              oldStock: product.stock,
              newStock: newStock,
              reason: 'SALE'
            }
          });
        }
      }

      // 3. Upsert client records for loyalty spent
      await tx.client.upsert({
        where: { phone: client.telephone },
        create: {
          phone: client.telephone,
          firstName: client.prenom,
          lastName: client.nom,
          points: 0,
          totalSpent: parseInt(finalAmount)
        },
        update: {
          totalSpent: {
            increment: parseInt(finalAmount)
          }
        }
      });

      return newOrder;
    });

    return successResponse(order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Failed to create order:', error);
    return errorResponse('Failed to create order', 500);
  }
}
