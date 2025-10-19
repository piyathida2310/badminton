const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/authConfig');
const { prisma } = require('../services/prismaClient');
const { HttpError } = require('../utils/httpError');

// มิดเดิลแวร์นี้ตรวจสอบ JWT จากส่วนหัว Authorization แล้วผูกข้อมูลผู้ใช้ไว้กับ req.user
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new HttpError(401, 'Access token not found', 'TOKEN_NOT_FOUND');
    }

    const decoded = jwt.verify(token, jwtConfig.access.secret);
    if (!decoded || typeof decoded !== 'object') {
      throw new HttpError(401, 'Invalid token', 'INVALID_TOKEN');
    }

    const userId = Number(decoded.sub);
    if (!userId) {
      throw new HttpError(401, 'Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      throw new HttpError(401, 'User not found', 'USER_NOT_FOUND');
    }

    req.user = {
      sub: String(user.id),
      username: user.userName,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
