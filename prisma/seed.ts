import { ClientType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import prisma from '@/lib/prisma';

async function seed() {
  console.log('🌱 Début du nettoyage et du seeding de la base de données...');

  try {
    await prisma.invoice.deleteMany();
    await prisma.inventoryLog.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.client.deleteMany();
    await prisma.servicePrice.deleteMany();
    await prisma.service.deleteMany();
    await prisma.coupe.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.barberAvailability.deleteMany();

    console.log('🗑️ Base de données vidée avec succès.');

    // 2. Création du compte SuperAdmin (Le Boss)
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.user.create({
      data: {
        email: 'boss@freshcut.com',
        password: hashedPassword,
        name: 'Directeur Freshcut',
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ SuperAdmin créé (boss@freshcut.com / password)');

    // 3. Création des Coupes d'inspiration (Catalogue Styles)
    await prisma.coupe.createMany({
      data: [
        {
          nom: 'Low Fade',
          description: 'Un dégradé subtil qui commence bas près des oreilles et de la nuque. Un classique indémodable.',
          tempsEstimation: '45 min',
          difficulte: 3,
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
          conseils: ['Utilisez une cire mate', 'Entretien toutes les 2 semaines'],
        },
        {
          nom: 'Skin Fade Burst',
          description: 'Un dégradé à blanc prononcé autour de l\'oreille, idéal pour mettre en avant une texture naturelle sur le dessus.',
          tempsEstimation: '60 min',
          difficulte: 5,
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop',
          conseils: ['Hydratez le cuir chevelu', 'Parfait avec un contour net'],
        },
        {
          nom: 'Classic Taper',
          description: 'Dégradé léger uniquement sur les favoris et la nuque. Garde une longueur naturelle sur les côtés.',
          tempsEstimation: '40 min',
          difficulte: 2,
          image: 'https://images.unsplash.com/photo-1599351431247-f10b21ce5012?q=80&w=1974&auto=format&fit=crop',
          conseils: ['Peignez quotidiennement', 'Utilisez un baume hydratant'],
        },
        {
          nom: '360 Waves',
          description: 'Style iconique nécessitant une technique de brossage précise pour créer des ondulations circulaires.',
          tempsEstimation: '30 min',
          difficulte: 4,
          image: 'https://images.unsplash.com/photo-1622286332307-0c76572cgf0a?q=80&w=1974&auto=format&fit=crop',
          conseils: ['Port d\'un durag la nuit obligatoire', 'Brossage REGULIER'],
        },
      ],
    });
    console.log('✅ Styles de coupes d\'inspiration créés');

    // 4. Définition et injection de la fiche tarifaire papier complète avec instructions
    const servicesToSeed = [
      // --- SECTION : COIFFURE & BARBE ---
      {
        nom: 'Coupe + Barbe',
        categorie: 'COIFFURE_BARBE',
        description: 'Prestation complète associant une coupe stylisée et un entretien millimétré de la barbe.',
        duree: 50,
        badge: 'Populaire',
        prices: [
          { clientType: 'ADULTE', prix: 5000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 3500, instructions: 'Présentation obligatoire de votre carte étudiant physique.' }
        ]
      },
      {
        nom: 'Coupe simple',
        categorie: 'COIFFURE_BARBE',
        description: 'Coupe classique ou moderne, finitions aux contours nets (Dégradé compris).',
        duree: 30,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 3000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 2500, instructions: 'Présentation obligatoire de votre carte étudiant physique.' },
          { clientType: 'ENFANT', prix: 2000, instructions: 'Uniquement pour les enfants de moins de 12 ans.' }
        ]
      },
      {
        nom: 'Barbe seule',
        categorie: 'COIFFURE_BARBE',
        description: 'Taille, traçage des contours et hydratation de la barbe.',
        duree: 20,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 2000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 1500, instructions: 'Présentation obligatoire de votre carte étudiant physique.' }
        ]
      },
      {
        nom: 'Shampoing + Masque capillaire',
        categorie: 'COIFFURE_BARBE',
        description: 'Soin purifiant et traitement nourrissant en profondeur pour vos cheveux.',
        duree: 25,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 3000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 2000, instructions: 'Présentation obligatoire de votre carte étudiant physique.' },
          { clientType: 'ENFANT', prix: 1000, instructions: 'Uniquement pour les enfants de moins de 12 ans.' }
        ]
      },
      {
        nom: 'Soin du visage',
        categorie: 'COIFFURE_BARBE',
        description: 'Nettoyage, gommage et application d\'un masque hydratant pour une peau parfaite.',
        duree: 30,
        badge: 'Bien-être',
        prices: [
          { clientType: 'ADULTE', prix: 5000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 3500, instructions: 'Présentation obligatoire de votre carte étudiant physique.' }
        ]
      },
      {
        nom: 'Coloration / Couleur',
        categorie: 'COIFFURE_BARBE',
        description: 'Teinture haut de gamme pour cheveux ou barbe avec des produits protecteurs.',
        duree: 45,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 8500, instructions: '' },
          { clientType: 'ETUDIANT', prix: 7500, instructions: 'Présentation obligatoire de votre carte étudiant physique.' }
        ]
      },
      // --- SECTION : TRESSES & NATTES ---
      {
        nom: 'Nattes collées (cornrows)',
        categorie: 'TRESSES_NATTES',
        description: 'Tresses plaquées traditionnelles ou géométriques, nettes et durables.',
        duree: 60,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 4000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 3000, instructions: 'Présentation obligatoire de votre carte étudiant physique.' },
          { clientType: 'ENFANT', prix: 2000, instructions: 'Uniquement pour les enfants de moins de 12 ans.' }
        ]
      },
      {
        nom: 'Vanilles / Twists',
        categorie: 'TRESSES_NATTES',
        description: 'Tresses à deux brins idéales pour protéger et styliser les cheveux crépus ou frisés.',
        duree: 75,
        badge: 'Tendance',
        prices: [
          { clientType: 'ADULTE', prix: 5000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 4000, instructions: 'Présentation obligatoire de votre carte étudiant physique.' },
          { clientType: 'ENFANT', prix: 2000, instructions: 'Uniquement pour les enfants de moins de 12 ans.' }
        ]
      },
      {
        nom: 'Dreadlocks - entretien',
        categorie: 'TRESSES_NATTES',
        description: 'Reprise des racines (retwist) et soin nourrissant pour locks existantes.',
        duree: 90,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 6500, instructions: '' },
          { clientType: 'ETUDIANT', prix: 5500, instructions: 'Présentation obligatoire de votre carte étudiant physique.' },
          { clientType: 'ENFANT', prix: 4000, instructions: 'Uniquement pour les enfants de moins de 12 ans.' }
        ]
      },
      {
        nom: 'Dreadlocks - démarrage',
        categorie: 'TRESSES_NATTES',
        description: 'Création et départ de locks propres à la cire naturelle ou au crochet.',
        duree: 120,
        badge: 'Expertise',
        prices: [
          { clientType: 'ADULTE', prix: 9000, instructions: '' },
          { clientType: 'ETUDIANT', prix: 8000, instructions: 'Présentation obligatoire de votre carte étudiant physique.' },
          { clientType: 'ENFANT', prix: 6000, instructions: 'Uniquement pour les enfants de moins de 12 ans.' }
        ]
      }
    ];

    for (const s of servicesToSeed) {
      await prisma.service.create({
        data: {
          nom: s.nom,
          categorie: s.categorie,
          description: s.description,
          duree: s.duree,
          badge: s.badge,
          prices: {
            createMany: {
              data: s.prices.map(p => ({
                clientType: p.clientType as ClientType,
                prix: p.prix,
                instructions: p.instructions
              }))
            }
          }
        }
      });
    }

    console.log(`✅ Fiche des tarifs insérée (${servicesToSeed.length} services configurés avec variantes)`);

    // 5. Création des Produits de la Boutique
    await prisma.product.createMany({
      data: [
        {
          nom: 'Huile Barbe Premium',
          categorie: 'BARBE',
          prix: 12500,
          description: 'Une huile artisanale enrichie à l\'huile de baobab pour une barbe douce et nourrie',
          stock: 15,
        },
        {
          nom: 'Cire Mate Coiffante',
          categorie: 'CHEVEUX',
          prix: 8000,
          description: 'Fixation forte, rendu naturel. Idéale pour stabiliser les dégradés',
          stock: 12,
        },
        {
          nom: 'T-Shirt Freshcut 229',
          categorie: 'MERCHANDISING',
          prix: 15000,
          description: 'Coton 220g lourd haut de gamme. Coupe oversize décontractée.',
          stock: 20,
        },
        {
          nom: 'Peigne en Corne',
          categorie: 'ACCESSOIRES',
          prix: 5000,
          description: 'Peigne antistatique naturel taillé de manière artisanale',
          stock: 5,
        },
      ],
    });
    console.log('✅ Produits de la boutique insérés');

    // 6. Création des Clients témoins
    const client1 = await prisma.client.create({
      data: {
        phone: '+22967123456',
        firstName: 'Kouassi',
        lastName: 'Mensah',
        points: 5,
        totalSpent: 12500,
      },
    });

    const client2 = await prisma.client.create({
      data: {
        phone: '+22965789012',
        firstName: 'Samuel',
        lastName: 'Adjogou',
        points: 8,
        totalSpent: 28000,
      },
    });
    console.log('✅ Profils clients témoins créés');

    // 7. Création des Réservations de test (Bookings)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const coupeSimpleService = await prisma.service.findFirst({ where: { nom: 'Coupe simple' } });
    const nattesService = await prisma.service.findFirst({ where: { nom: 'Nattes collées (cornrows)' } });

    if (coupeSimpleService && nattesService) {
      await prisma.booking.createMany({
        data: [
          {
            phoneNumber: client1.phone,
            firstName: client1.firstName,
            lastName: client1.lastName,
            serviceId: coupeSimpleService.id,
            date: new Date(today.getTime() + 2 * 60 * 60 * 1000),
            time: '09:00',
            status: 'CONFIRMED',
            advanceAmount: 0,
            totalAmount: 3000,
          },
          {
            phoneNumber: client2.phone,
            firstName: client2.firstName,
            lastName: client2.lastName,
            serviceId: nattesService.id,
            date: new Date(today.getTime() + 4 * 60 * 60 * 1000),
            time: '14:30',
            status: 'PENDING',
            advanceAmount: 0,
            totalAmount: 4000,
          },
        ],
      });
      console.log('✅ Réservations de test insérées');
    }

    console.log('\n✨ Base de données réinitialisée et seedée avec succès !');
    console.log('\n📝 Comptes administratifs :');
    console.log('   → SuperAdmin (Le Boss) : boss@freshcut.com / password');
  } catch (error) {
    console.error('❌ Erreur critique lors du seeding :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();