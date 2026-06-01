import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getServerSession, requireRole } from '@/lib/auth';

// GET all bookings (ADMIN only) or filter by phone (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phone');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    // If phone provided, allow public access to own bookings
    if (phoneNumber) {
      const bookings = await prisma.booking.findMany({
        where: {
          phoneNumber,
          ...(status && { status }),
          ...(date && {
            date: {
              gte: new Date(date),
              lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
            },
          }),
        },
        include: { service: true },
        orderBy: { date: 'desc' },
      });

      return successResponse(bookings);
    }

    // Otherwise require admin role to see all bookings
    try {
      await requireRole(['SUPER_ADMIN', 'ADMIN']);
    } catch {
      return errorResponse('Unauthorized', 401);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status && { status }),
        ...(date && {
          date: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: { service: true },
      orderBy: { date: 'asc' },
    });

    return successResponse(bookings);
  } catch (error) {
    return errorResponse('Failed to fetch bookings', 500);
  }
}

// POST create new booking (public with phone)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phoneNumber,
      firstName,
      lastName,
      email,
      serviceId,
      date,
      time,
      advanceAmount,
      totalAmount,
      notes,
    } = body;

    if (!phoneNumber || !firstName || !lastName || !serviceId || !date || !time) {
      return errorResponse('Missing required fields', 400);
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        phoneNumber,
        firstName,
        lastName,
        email,
        serviceId,
        date: new Date(date),
        time,
        advanceAmount: parseInt(advanceAmount) || service.prix,
        totalAmount: parseInt(totalAmount) || service.prix,
        notes,
      },
      include: { service: true },
    });

    // Update or create client loyalty record
    await prisma.client.upsert({
      where: { phone: phoneNumber },
      create: {
        phone: phoneNumber,
        firstName,
        lastName,
        points: 1,
        totalSpent: service.prix,
      },
      update: {
        points: {
          increment: 1,
        },
        totalSpent: {
          increment: service.prix,
        },
      },
    });

    return successResponse(booking, 'Booking created', 201);
  } catch (error: any) {
    console.error('Booking error:', error);
    return errorResponse('Failed to create booking', 500);
  }
}
