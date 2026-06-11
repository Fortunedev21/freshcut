import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

let _prisma: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is missing!");
      }
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      _prisma = new PrismaClient({ adapter });
    }
    return (_prisma as any)[prop];
  },
});

export default prisma;