import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';

// GET single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    return successResponse(booking);
  } catch (error) {
    return errorResponse('Failed to fetch booking', 500);
  }
}

// PUT update booking (ADMIN/SUPER_ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const { id } = await params;

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return errorResponse('Status is required', 400);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
      },
      include: { service: true },
    });

    return successResponse(booking, 'Booking updated');
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Unauthorized role', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    if (error.code === 'P2025') {
      return errorResponse('Booking not found', 404);
    }
    return errorResponse('Failed to update booking', 500);
  }
}

// PATCH change booking status (ADMIN/SUPER_ADMIN only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (!action) {
      return errorResponse('Action parameter required', 400);
    }

    await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    let newStatus = booking.status;
    const now = new Date();

    if (action === 'confirm') {
      newStatus = 'CONFIRMED';
    } else if (action === 'start') {
      newStatus = 'IN_PROGRESS';
    } else if (action === 'complete') {
      newStatus = 'COMPLETED';
    } else if (action === 'cancel') {
      newStatus = 'CANCELLED';
    } else if (action === 'no-show') {
      newStatus = 'NO_SHOW';
    }

    const updateData: any = { status: newStatus };

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { service: true },
    });

    // Add points and update totalSpent when booking is completed
    if (action === 'complete' && booking.phoneNumber) {
      await prisma.client.upsert({
        where: { phone: booking.phoneNumber },
        create: {
          phone: booking.phoneNumber,
          firstName: booking.firstName,
          lastName: booking.lastName,
          points: 1,
          totalSpent: booking.totalAmount,
        },
        update: {
          points: { increment: 1 },
          totalSpent: { increment: booking.totalAmount },
        },
      });
    }

    return successResponse(updated, `Booking ${action}ed`);
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return errorResponse('Only admin can update booking', 403);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse('Please login first', 401);
    }
    return errorResponse('Failed to update booking', 500);
  }
}
