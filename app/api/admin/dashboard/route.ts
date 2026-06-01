import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET dashboard stats for ADMIN or SUPER_ADMIN
export async function GET(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN']);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total bookings today
    const bookingsToday = await prisma.booking.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Completed bookings today
    const completedToday = await prisma.booking.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: 'COMPLETED',
      },
    });

    // Total revenue
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    });

    // Active clients
    const activeClients = await prisma.client.count();

    // Low stock products
    const lowStock = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
    });

    // This month's revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthRevenue = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: monthStart },
      },
      _sum: { totalAmount: true },
    });

    return successResponse({
      bookingsToday,
      completedToday,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeClients,
      lowStock,
      monthRevenue: monthRevenue._sum.totalAmount || 0,
    });
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only admin can view dashboard', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    return errorResponse('Failed to fetch dashboard stats', 500);
  }
}
