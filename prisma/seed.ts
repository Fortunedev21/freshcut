import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs';


async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (order matters for foreign keys)
    await prisma.invoice.deleteMany();
    await prisma.inventoryLog.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.client.deleteMany();
    await prisma.service.deleteMany();
    await prisma.coupe.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const hashedPassword = await bcrypt.hash('password', 10);

    // SUPER_ADMIN (Boss) - ONLY ONE, seeded directly
    const superAdmin = await prisma.user.create({
      data: {
        email: 'boss@freshcut.com',
        password: hashedPassword,
        name: 'Directeur Freshcut',
      },
    });

    console.log('✅ SuperAdmin created (boss@freshcut.com)');
    console.log('ℹ️  ADMINs (barbers) will be created by SuperAdmin via admin panel');

    // Create coupes (haircut styles with photos)
    const coupes = await prisma.coupe.createMany({
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
          conseils: ['Port d\'un durag la nuit obligatoire', 'Brossage régulier'],
        },
      ],
    });

    console.log('✅ Coupes (haircut styles) created');

    // Create services with per-ClientType prices (ServicePrice)
    const serviceData = [
      {
        nom: 'Dégradé',
        categorie: 'Coupe',
        description: 'Contour et dégradé précis, finition soignée',
        duree: 30,
        badge: 'Populaire',
        prixAdulte: 2500,
        prixEtudiant: 2000,
        prixEnfant: 1500,
      },
      {
        nom: 'Coupe plat',
        categorie: 'Coupe',
        description: 'Coupe classique nette, tous types de cheveux',
        duree: 25,
        badge: null,
        prixAdulte: 2000,
        prixEtudiant: 1500,
        prixEnfant: 1000,
      },
      {
        nom: 'Barbe',
        categorie: 'Barbe',
        description: 'Taille, contour et soin complet de la barbe',
        duree: 20,
        badge: null,
        prixAdulte: 1500,
        prixEtudiant: 1500,
        prixEnfant: 1000,
      },
      {
        nom: 'Combo',
        categorie: 'Combos',
        description: 'Coupe + barbe + soin du visage inclus',
        duree: 55,
        badge: 'Meilleure valeur',
        prixAdulte: 3500,
        prixEtudiant: 3000,
        prixEnfant: 2500,
      },
      {
        nom: 'Enfant',
        categorie: 'Coupe',
        description: 'Coupe pour moins de 12 ans',
        duree: 20,
        badge: null,
        prixAdulte: 1500,
        prixEtudiant: 1500,
        prixEnfant: 1000,
      },
      {
        nom: 'Soin visage',
        categorie: 'Soins',
        description: 'Nettoyage, hydratation et masque',
        duree: 15,
        badge: null,
        prixAdulte: 1000,
        prixEtudiant: 1000,
        prixEnfant: 1000,
      },
    ];

    for (const s of serviceData) {
      await prisma.service.create({
        data: {
          nom: s.nom,
          categorie: s.categorie,
          description: s.description,
          duree: s.duree,
          badge: s.badge,
          prices: {
            create: [
              { clientType: 'ADULTE',   prix: s.prixAdulte,   instructions: 'Tarif adulte standard' },
              { clientType: 'ETUDIANT', prix: s.prixEtudiant, instructions: 'Tarif réduit sur présentation de carte étudiante' },
              { clientType: 'ENFANT',   prix: s.prixEnfant,   instructions: 'Tarif enfant (moins de 12 ans)' },
            ],
          },
        },
      });
    }

    console.log('✅ Services created');

    // Create products
    const products = await prisma.product.createMany({
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
          description: 'Fixation forte, rendu naturel. Idéale pour les dégradés',
          stock: 12,
        },
        {
          nom: 'T-Shirt Freshcut 229',
          categorie: 'MERCHANDISING',
          prix: 15000,
          description: 'Coton 220g haut de gamme. Coupe oversize.',
          stock: 20,
        },
        {
          nom: 'Peigne en Corne',
          categorie: 'ACCESSOIRES',
          prix: 5000,
          description: 'Peigne antistatique taillé dans la masse',
          stock: 5,
        },
      ],
    });

    console.log('✅ Products created');

    // Create sample clients
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

    console.log('✅ Clients created');

    // Create sample bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const degradeService = await prisma.service.findFirst({ where: { nom: 'Dégradé' } });
    const comboService = await prisma.service.findFirst({ where: { nom: 'Combo' } });

    if (degradeService && comboService) {
      await prisma.booking.createMany({
        data: [
          {
            phoneNumber: client1.phone,
            firstName: client1.firstName,
            lastName: client1.lastName,
            serviceId: degradeService.id,
            date: new Date(today.getTime() + 2 * 60 * 60 * 1000),
            time: '09:00',
            status: 'CONFIRMED',
            advanceAmount: 2500,
            totalAmount: 2500,
          },
          {
            phoneNumber: client2.phone,
            firstName: client2.firstName,
            lastName: client2.lastName,
            serviceId: comboService.id,
            date: new Date(today.getTime() + 4 * 60 * 60 * 1000),
            time: '10:30',
            status: 'PENDING',
            advanceAmount: 3500,
            totalAmount: 3500,
          },
        ],
      });

      console.log('✅ Bookings created');
    }

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📝 Test accounts:');
    console.log('SuperAdmin (Boss): boss@freshcut.com / password');
    console.log('\n🪡 ADMINs (Barbers):');
    console.log('   → Created by SuperAdmin via admin panel only');
    console.log('   → No account creation allowed for regular users');
    console.log('\n📸 Coupes added with photos - SuperAdmin manages via API');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();

