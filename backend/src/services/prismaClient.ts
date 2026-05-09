import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectPrisma(): Promise<PrismaClient> {
  try {
    await prisma.$connect();
    // ✅ Log เมื่อเชื่อมต่อสำเร็จ
    console.log('[Database]: Connected to PostgreSQL successfully via Prisma');
    return prisma;
  } catch (error) {
    // ❌ Log เมื่อเกิดข้อผิดพลาด
    console.error('[Database]: Failed to connect to PostgreSQL!');
    console.error(error);
    process.exit(1); // ปิด Process ทันทีถ้าต่อ DB ไม่ได้ (ป้องกันแอปค้างแบบเอ๋อๆ)
  }
}