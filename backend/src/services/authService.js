const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Role } = require('@prisma/client');
const { jwtConfig } = require('../config/authConfig');
const {
  createUser,
  findByEmail,
  findById,
  updateUser,
} = require('./userService');
const { prisma } = require('./prismaClient');
const { HttpError } = require('../utils/httpError');
const { parseExpiresIn } = require('../utils/tokenUtils');

// บริการนี้รวมทุกฟังก์ชันที่เกี่ยวข้องกับการยืนยันตัวตนของผู้ใช้
// เพื่อให้คอนโทรลเลอร์เรียกใช้โดยไม่ต้องรู้รายละเอียดการเชื่อมต่อฐานข้อมูล

function signAccessToken(userId, username, role) {
  const payload = {
    sub: String(userId),
    username,
    role,
  };

  const accessToken = jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return {
    accessToken,
    expiresIn: parseExpiresIn(jwtConfig.access.expiresIn),
  };
}

async function registerUser({
  fullName,
  email,
  password,
  confirmPassword,
  username,
  role = Role.PLAYER,
}) {
  if (password !== confirmPassword) {
    throw new HttpError(
      400,
      'Password confirmation does not match',
      'PASSWORD_MISMATCH',
    );
  }

  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    email,
    firstName,
    lastName,
    passwordHash,
    role,
    userName: username,
  });

  return signAccessToken(user.id, user.userName || user.email, user.role);
}

async function loginUser({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    throw new HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  return signAccessToken(user.id, user.userName || user.email, user.role);
}

async function getUserProfile(userId) {
  const numericId = Number(userId);
  const user = await prisma.user.findUnique({
    where: { id: numericId },
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

  if (!user) {
    throw new HttpError(401, 'User not found', 'USER_NOT_FOUND');
  }

  return user;
}

async function changePassword(userId, { oldPassword, newPassword }) {
  const numericId = Number(userId);
  const user = await prisma.user.findUnique({
    where: { id: numericId },
  });

  if (!user) {
    throw new HttpError(401, 'User not found', 'USER_NOT_FOUND');
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new HttpError(
      400,
      'Current password is incorrect',
      'PASSWORD_INCORRECT',
    );
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await updateUser(numericId, { password: hashedNewPassword });

  return {
    success: true,
    message: 'Password changed successfully',
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  changePassword,
  signAccessToken,
};
