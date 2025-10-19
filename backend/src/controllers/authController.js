const { Role } = require('@prisma/client');
const {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
} = require('../services/authService');
const { HttpError } = require('../utils/httpError');

// คอนโทรลเลอร์ชุดนี้รวม handler สำหรับเส้นทาง /auth
// แต่ละฟังก์ชันจะตรวจสอบข้อมูลเบื้องต้นก่อนส่งต่อให้ service ชั้นล่าง

const ALLOWED_ROLES = Object.values(Role);

async function register(req, res, next) {
  try {
    const { fullName, email, password, confirmPassword, username, role } =
      req.body || {};

    if (!fullName || !fullName.trim()) {
      throw new HttpError(400, 'fullName is required', 'VALIDATION_ERROR');
    }
    if (!email) {
      throw new HttpError(400, 'email is required', 'VALIDATION_ERROR');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new HttpError(400, 'email format is invalid', 'VALIDATION_ERROR');
    }
    if (!password || password.length < 8) {
      throw new HttpError(
        400,
        'password must be at least 8 characters',
        'VALIDATION_ERROR',
      );
    }
    if (!confirmPassword || confirmPassword.length < 8) {
      throw new HttpError(
        400,
        'confirmPassword must be at least 8 characters',
        'VALIDATION_ERROR',
      );
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      throw new HttpError(
        400,
        `role must be one of ${ALLOWED_ROLES.join(', ')}`,
        'VALIDATION_ERROR',
      );
    }

    const tokenResponse = await registerUser({
      fullName,
      email,
      password,
      confirmPassword,
      username,
      role,
    });

    res.status(201).json(tokenResponse);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password || password.length < 8) {
      throw new HttpError(
        400,
        'email and password (min 8 chars) are required',
        'VALIDATION_ERROR',
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new HttpError(400, 'email format is invalid', 'VALIDATION_ERROR');
    }

    const tokenResponse = await loginUser({ email, password });
    res.status(200).json(tokenResponse);
  } catch (error) {
    next(error);
  }
}

async function changePasswordHandler(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      throw new HttpError(
        400,
        'oldPassword and newPassword are required',
        'VALIDATION_ERROR',
      );
    }
    if (oldPassword.length < 8 || newPassword.length < 8) {
      throw new HttpError(
        400,
        'oldPassword and newPassword must be at least 8 characters',
        'VALIDATION_ERROR',
      );
    }

    if (!req.user) {
      throw new HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
    }

    const result = await changePassword(req.user.sub, {
      oldPassword,
      newPassword,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    if (!req.user) {
      throw new HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const profile = await getUserProfile(req.user.sub);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  changePassword: changePasswordHandler,
  me,
};
