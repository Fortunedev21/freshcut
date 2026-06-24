import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';


async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (order matters for foreign keys)
    await prisma.invoice.deleteMany();
    await prisma.inventoryLog.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.client.deleteMany();
    await prisma.servicePrice.deleteMany();
    await prisma.service.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
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
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ SuperAdmin created (boss@freshcut.com)');
    console.log('ℹ️  ADMINs (barbers) will be created by SuperAdmin via admin panel');

    // Create services and their corresponding service prices
    const servicesData = [
      {
        nom: 'Dégradé',
        categorie: 'COIFFURE_BARBE',
        description: 'Contour et dégradé précis, finition soignée',
        duree: 30,
        badge: 'Populaire',
        prices: [
          { clientType: 'ADULTE', prix: 2500, instructions: 'Coupe standard' },
          { clientType: 'ETUDIANT', prix: 2000, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 1500, instructions: 'Moins de 12 ans' },
        ]
      },
      {
        nom: 'Coupe plat',
        categorie: 'COIFFURE_BARBE',
        description: 'Coupe classique nette, tous types de cheveux',
        duree: 25,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 2000, instructions: 'Coupe standard' },
          { clientType: 'ETUDIANT', prix: 1500, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 1000, instructions: 'Moins de 12 ans' },
        ]
      },
      {
        nom: 'Barbe',
        categorie: 'COIFFURE_BARBE',
        description: 'Taille, contour et soin complet de la barbe',
        duree: 20,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 1500, instructions: 'Taille standard' },
          { clientType: 'ETUDIANT', prix: 1200, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 1000, instructions: 'Moins de 12 ans' },
        ]
      },
      {
        nom: 'Combo',
        categorie: 'COIFFURE_BARBE',
        description: 'Coupe + barbe + soin du visage inclus',
        duree: 55,
        badge: 'Meilleure valeur',
        prices: [
          { clientType: 'ADULTE', prix: 3500, instructions: 'Combo complet' },
          { clientType: 'ETUDIANT', prix: 3000, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 2500, instructions: 'Moins de 12 ans' },
        ]
      },
      {
        nom: 'Soin visage',
        categorie: 'COIFFURE_BARBE',
        description: 'Nettoyage, hydratation et masque',
        duree: 15,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 1000, instructions: 'Soin standard' },
          { clientType: 'ETUDIANT', prix: 1000, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 1000, instructions: 'Moins de 12 ans' },
        ]
      },
      {
        nom: 'Tresses simples',
        categorie: 'TRESSES_NATTES',
        description: 'Tresses simples sur-mesure',
        duree: 60,
        badge: null,
        prices: [
          { clientType: 'ADULTE', prix: 5000, instructions: 'Tresses standard' },
          { clientType: 'ETUDIANT', prix: 4000, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 3000, instructions: 'Moins de 12 ans' },
        ]
      },
      {
        nom: 'Nattes collées',
        categorie: 'TRESSES_NATTES',
        description: 'Nattes collées et design esthétique',
        duree: 90,
        badge: 'Nouveau',
        prices: [
          { clientType: 'ADULTE', prix: 7000, instructions: 'Nattes complexes' },
          { clientType: 'ETUDIANT', prix: 6000, instructions: 'Sur présentation de carte étudiant' },
          { clientType: 'ENFANT', prix: 5000, instructions: 'Moins de 12 ans' },
        ]
      }
    ];

    for (const serviceInfo of servicesData) {
      const createdService = await prisma.service.create({
        data: {
          nom: serviceInfo.nom,
          categorie: serviceInfo.categorie,
          description: serviceInfo.description,
          duree: serviceInfo.duree,
          badge: serviceInfo.badge,
        }
      });

      for (const priceInfo of serviceInfo.prices) {
        await prisma.servicePrice.create({
          data: {
            serviceId: createdService.id,
            clientType: priceInfo.clientType as any,
            prix: priceInfo.prix,
            instructions: priceInfo.instructions,
          }
        });
      }
    }

    console.log('✅ Services and ServicePrices created');

    // Create products
    const productsData = [
      {
        nom: "Huile Barbe Premium",
        categorie: "BARBE",
        prix: 12500,
        description: "Une huile artisanale enrichie à l'huile de baobab pour une barbe douce et nourrie",
        stock: 15,
      },
      {
        nom: "Cire Mate Coiffante",
        categorie: "CHEVEUX",
        prix: 8000,
        description: "Fixation forte, rendu naturel. Idéale pour les dégradés",
        stock: 12,
      },
      {
        nom: "T-Shirt Freshcut 229",
        categorie: "MERCHANDISING",
        prix: 15000,
        description: "Coton 220g haut de gamme. Coupe oversize.",
        stock: 20,
      },
      {
        nom: "Peigne en Corne",
        categorie: "ACCESSOIRES",
        prix: 5000,
        description: "Peigne antistatique taillé dans la masse",
        stock: 5,
      },
    ];

    await prisma.product.createMany({
      data: productsData,
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
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
