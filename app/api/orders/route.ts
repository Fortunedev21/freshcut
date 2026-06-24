import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { resend } from '@/lib/resend';
import { formatPrice } from '@/utils/format';

// GET orders by phone number (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phone');

    if (!phoneNumber) {
      return errorResponse('Numéro de téléphone requis', 400);
    }

    const orders = await prisma.order.findMany({
      where: {
        clientTelephone: phoneNumber,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(orders);
  } catch (error) {
    return errorResponse('Impossible de récupérer les commandes', 500);
  }
}

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
    } = body;

    if (!client || !items || items.length === 0 || !client.nom || !client.prenom || !client.telephone) {
      return errorResponse('Données de commande invalides', 400);
    }

    // Exécuter l'enregistrement et la mise à jour des stocks dans une transaction Prisma
    const order = await prisma.$transaction(async (tx) => {
      // 1. Vérification et diminution des stocks
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (!product) {
          throw new Error(`Produit introuvable: ${item.id}`);
        }

        if (product.stock < item.quantite) {
          throw new Error(`Stock insuffisant pour le produit: ${product.nom} (Disponible: ${product.stock})`);
        }

        // Mettre à jour le stock du produit
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: product.stock - item.quantite
          }
        });

        // Logger le changement de stock dans InventoryLog
        await tx.inventoryLog.create({
          data: {
            productId: item.id,
            oldStock: product.stock,
            newStock: product.stock - item.quantite,
            reason: `Achat boutique - Réf transaction: ${transactionId || 'N/A'}`
          }
        });
      }

      // 2. Création de la commande principale
      const newOrder = await tx.order.create({
        data: {
          clientNom: client.nom,
          clientPrenom: client.prenom,
          clientTelephone: client.telephone,
          clientEmail: client.email || null,
          adresse: client.adresse || null,
          ville: client.ville || null,
          shippingMethod,
          shippingCost: parseInt(shippingCost) || 0,
          totalAmount: parseInt(totalAmount),
          finalAmount: parseInt(finalAmount),
          transactionId: transactionId || null,
          status: 'PAID', // Marqué payé d'office si transactionId fourni et paiement réussi
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantite: item.quantite,
              prix: item.prix,
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // 3. Associer ou mettre à jour la fiche Client (cumuler total spent)
      await tx.client.upsert({
        where: { phone: client.telephone },
        create: {
          phone: client.telephone,
          firstName: client.prenom,
          lastName: client.nom,
          points: 0,
          totalSpent: parseInt(finalAmount),
        },
        update: {
          totalSpent: {
            increment: parseInt(finalAmount),
          }
        }
      });

      return newOrder;
    });

    // 4. Envoyer un email de notification aux coiffeurs/admins
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] }
        },
        select: {
          email: true,
        },
      });

      const adminEmails = admins.map((b) => b.email);

      if (adminEmails.length > 0) {
        const itemsListHtml = order.items.map((item) => `
          <li>
            <strong>${item.product.nom}</strong> x${item.quantite} - ${formatPrice(item.prix * item.quantite)} FCFA
          </li>
        `).join('');

        await resend.emails.send({
          from: 'Freshcut 229 <onboarding@resend.dev>',
          to: adminEmails,
          subject: `🛒 Nouvelle Commande Boutique - ${order.clientPrenom} ${order.clientNom}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: #ffffff; border-radius: 8px;">
              <h2 style="border-bottom: 1px solid #222; padding-bottom: 10px; color: #ffffff; text-transform: uppercase; tracking: tight;">
                Nouvelle Commande Reçue !
              </h2>
              <p>Un client vient d'acheter des produits sur la boutique en ligne.</p>
              
              <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Client :</strong> ${order.clientPrenom} ${order.clientNom}</p>
                <p><strong>Téléphone :</strong> ${order.clientTelephone}</p>
                <p><strong>Mode de retrait :</strong> ${order.shippingMethod === 'SALON' ? 'Retrait au Salon' : 'Livraison à domicile'}</p>
                ${order.shippingMethod === 'DELIVERY' ? `
                  <p><strong>Adresse de livraison :</strong> ${order.adresse}, ${order.ville}</p>
                ` : ''}
                <p><strong>Montant Total :</strong> ${formatPrice(order.finalAmount)} FCFA</p>
                <p><strong>Référence Transaction :</strong> ${order.transactionId || 'N/A'}</p>
              </div>

              <div style="margin: 20px 0;">
                <h3 style="color: #ffffff; border-bottom: 1px solid #333; padding-bottom: 5px;">Produits commandés :</h3>
                <ul style="padding-left: 20px; line-height: 1.6;">
                  ${itemsListHtml}
                </ul>
              </div>

              <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
                Connectez-vous à votre espace <a href="${process.env.NEXTAUTH_URL}/admin/dashboard" style="color: #fff; text-decoration: underline;">Freshcut Admin</a> pour gérer cette commande.
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send order email notification:", emailError);
    }

    return successResponse(order, 'Commande enregistrée avec succès', 201);
  } catch (error: any) {
    console.error('Erreur lors du traitement de la commande:', error);
    return errorResponse(error.message || 'Échec de l\'enregistrement de la commande', 500);
  }
}
