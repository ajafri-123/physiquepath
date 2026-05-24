import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

// Reuse a single Prisma client across hot-reloads in dev;
// in production each serverless function gets its own instance.
export const db = global.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = db;
}
