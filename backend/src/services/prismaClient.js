const { PrismaClient } = require('@prisma/client');

// ไฟล์นี้รับผิดชอบสร้างอินสแตนซ์ Prisma เพียงตัวเดียวสำหรับทั้งแอป
// ทำให้ทุกบริการเรียกใช้งานฐานข้อมูลผ่าน client เดียว ลดปัญหา connection ซ้ำซ้อน
const prisma = new PrismaClient();

async function connectPrisma() {
  await prisma.$connect();
  return prisma;
}

module.exports = {
  prisma,
  connectPrisma,
};
