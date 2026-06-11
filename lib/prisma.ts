import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL || '';
const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

export const prisma = globalForPrisma.prisma || (
  isLocal
    ? new PrismaClient({
        adapter: new PrismaPg(new Pool({ connectionString: databaseUrl }))
      })
    : new PrismaClient({
        adapter: new PrismaNeon({
          connectionString: databaseUrl,
        })
      })
);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

//With Adapter

/*import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = global.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;


import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter });

*/