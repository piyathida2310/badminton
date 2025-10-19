const { Role } = require('@prisma/client');
const { prisma } = require('./prismaClient');
const { HttpError } = require('../utils/httpError');

// บริการจัดการข้อมูลผู้ใช้ทั้งหมด แยกจากคอนโทรลเลอร์เพื่อให้ง่ายต่อการทดสอบ
async function createUser({
  email,
  firstName,
  lastName,
  passwordHash,
  role = Role.PLAYER,
  userName,
}) {
  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingByEmail) {
    throw new HttpError(400, 'Email already registered', 'EMAIL_EXISTS');
  }

  if (userName) {
    const existingByUsername = await prisma.user.findFirst({
      where: { userName },
    });
    if (existingByUsername) {
      throw new HttpError(400, 'Username already registered', 'USERNAME_EXISTS');
    }
  }

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      userName,
      password: passwordHash,
      role,
    },
  });
}

function findByUsername(userName) {
  return prisma.user.findFirst({
    where: { userName },
    select: {
      id: true,
      userName: true,
      email: true,
      firstName: true,
      lastName: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });
}

function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      userName: true,
      email: true,
      firstName: true,
      lastName: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });
}

function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userName: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

function findAll() {
  return prisma.user.findMany({
    select: {
      id: true,
      userName: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

async function updateUser(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

module.exports = {
  createUser,
  findByUsername,
  findByEmail,
  findById,
  findAll,
  updateUser,
};
