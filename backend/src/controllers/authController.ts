import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
} from '../services/authService';
import { HttpError } from '../utils/httpError';
import { AuthenticatedRequest } from '../types/express';
import { updateUserProfile } from '../services/authService';

const ALLOWED_ROLES = Object.values(Role);

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { 
      fullName, 
      email, 
      password, 
      confirmPassword, 
      username, 
      role,
      clerkId,
      age,
      playType,
      phoneNumber
    } = req.body ?? {};

    if (!fullName || !String(fullName).trim()) {
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
      clerkId,
    });

    res.status(201).json(tokenResponse);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body ?? {};
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

export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body ?? {};
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

    const request = req as AuthenticatedRequest;
    if (!request.user) {
      throw new HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
    }

    const result = await changePassword(request.user.sub, {
      oldPassword,
      newPassword,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const request = req as AuthenticatedRequest;
    if (!request.user) {
      throw new HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
    }
    const profile = await getUserProfile(request.user.sub);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const request = req as AuthenticatedRequest;
    if (!request.user) {
      throw new HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
    }

    const { fullName = "", email = "", username } = req.body ?? {};
    if (!fullName.trim() || !email.trim()) {
      throw new HttpError(400, 'fullName and email are required', 'VALIDATION_ERROR');
    }

    const updated = await updateUserProfile(request.user.sub, {
      fullName,
      email,
      username,
    });

    res.json(updated);
  } catch (error) {
    console.error(" updateProfileHandler error:", error);
    next(error);
  }
}

