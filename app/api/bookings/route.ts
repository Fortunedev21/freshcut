import { NextRequest } from 'next/server';
import { BookingStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getServerSession, requireRole } from '@/lib/auth';
import { resend } from '@/lib/resend';
import { formatPrice } from '@/utils/format';


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
          ...(status && { status: status as BookingStatus }),
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
        ...(status && { status: status as BookingStatus }),
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
      coupeId,
      date,
      time,
      advanceAmount,
      totalAmount,
      notes,
    } = body;

    if (!phoneNumber || !firstName || !lastName || !serviceId || !date || !time) {
      return errorResponse('Missing required fields', 400);
    }

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
        ...(coupeId && { coupeId }),
        date: new Date(date),
        time,
        advanceAmount: parseInt(advanceAmount) || 0,
        totalAmount: parseInt(totalAmount) || 0,
        notes,
      },
      include: { service: true },
    });

    // Create or update client record (loyalty points & totalSpent are
    // incremented on booking *completion*, not creation)
    await prisma.client.upsert({
      where: { phone: phoneNumber },
      create: {
        phone: phoneNumber,
        firstName,
        lastName,
        points: 0,
        totalSpent: 0,
      },
      update: {},
    });

    const barbers = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        email: true,
      },
    });

    const barberEmails = barbers.map((b) => b.email);

    if (barberEmails.length > 0) {
      const formattedDate = new Date(booking.date).toLocaleDateString('fr-FR');

      await resend.emails.send({
        from: 'Freshcut 229 <onboarding@resend.dev>',
        to: barberEmails,
        subject: `💈 Nouvelle Réservation - ${booking.firstName} ${booking.lastName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: #ffffff; border-radius: 8px;">
            <h2 style="border-bottom: 1px solid #222; padding-bottom: 10px; color: #ffffff; text-transform: uppercase; tracking: tight;">
              Nouvelle Réservation Reçue !
            </h2>
            <p>Un client vient de réserver un créneau sur la plateforme.</p>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Client :</strong> ${booking.firstName} ${booking.lastName}</p>
              <p><strong>Téléphone :</strong> ${booking.phoneNumber}</p>
              <p><strong>Service :</strong> ${booking.service.nom}</p>
              <p><strong>Date :</strong> ${formattedDate}</p>
              <p><strong>Heure :</strong> ${booking.time}</p>
              <p><strong>Montant Total :</strong> ${formatPrice(booking.totalAmount)} FCFA</p>
              <p><strong>Avance versée :</strong> ${formatPrice(booking.advanceAmount)} FCFA</p>
            </div>

            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
              Connectez-vous à votre espace <a href="${process.env.NEXTAUTH_URL}/admin/coiffeur" style="color: #fff; text-decoration: underline;">Freshcut Admin</a> pour attribuer ou gérer cette coupe.
            </p>
          </div>
        `,
      });
    }

    return successResponse(booking, 'Booking created', 201);
  } catch (error: any) {
    console.error('Booking error:', error);
    return errorResponse('Failed to create booking', 500);
  }
}
