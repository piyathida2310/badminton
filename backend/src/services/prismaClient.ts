import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectPrisma(): Promise<PrismaClient> {
  await prisma.$connect();
  return prisma;
}
