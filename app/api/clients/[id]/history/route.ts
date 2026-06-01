import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET client booking history by phone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bookings = await prisma.booking.findMany({
      where: { phoneNumber: id },
      include: { service: true },
      orderBy: { date: 'desc' },
    });

    return successResponse(bookings);
  } catch (error) {
    return errorResponse('Failed to fetch booking history', 500);
  }
}
