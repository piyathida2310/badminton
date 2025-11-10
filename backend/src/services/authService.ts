import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Role, Prisma } from '@prisma/client';
import { jwtConfig } from '../config/authConfig';
import { createUser, findByEmail, updateUser } from './userService';
import { prisma } from './prismaClient';
import { HttpError } from '../utils/httpError';
import { parseExpiresIn } from '../utils/tokenUtils';

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterUserParams {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  username?: string | null;
  role?: Role;
}

export interface LoginUserParams {
  email: string;
  password: string;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    userName: true;
    firstName: true;
    lastName: true;
    email: true;
    role: true;
 
    createdAt: true;
  };
}>;

export function signAccessToken(userId: number, username: string | null, role: Role): TokenResponse {
  const payload: JwtPayload = {
    sub: String(userId),
    username: username ?? undefined,
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

export async function registerUser({
  fullName,
  email,
  password,
  confirmPassword,
  username,
  role = Role.PLAYER,
}: RegisterUserParams): Promise<TokenResponse> {
  if (password !== confirmPassword) {
    throw new HttpError(
      400,
      'Password confirmation does not match',
      'PASSWORD_MISMATCH',
    );
  }

  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') ?? '';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    email,
    firstName,
    lastName,
    passwordHash,
    role,
    userName: username ?? undefined,
  });

  return signAccessToken(user.id, user.userName ?? user.email, user.role);
}

export async function loginUser({ email, password }: LoginUserParams): Promise<TokenResponse> {
  const user = await findByEmail(email);
  if (!user) {
    throw new HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  return signAccessToken(user.id, user.userName ?? user.email, user.role);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
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

export async function changePassword(
  userId: string,
  { oldPassword, newPassword }: ChangePasswordParams,
): Promise<{ success: boolean; message: string }> {
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

// Update Profile
export interface UpdateProfileParams {
  fullName: string;
  email: string;
  username?: string | null;
}

export async function updateUserProfile(
  userId: string,
  { fullName, email, username }: { fullName: string; email: string; username?: string | null },
) {
  const numericId = Number(userId);

  const [firstName, ...lastNameParts] = (fullName || "").trim().split(" ");
  const lastName = lastNameParts.join(' ') || '';

  const existingUser = await prisma.user.findUnique({ where: { id: numericId } });
  if (!existingUser) throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');

  const emailInUse = await prisma.user.findFirst({
    where: { email, NOT: { id: numericId } },
  });
  if (emailInUse) throw new HttpError(400, 'Email already in use', 'EMAIL_DUPLICATE');
  

 try {
  const safeUserName =
    username && username.trim() !== ""
      ? username
      : existingUser.userName || `user_${numericId}`;

  const updated = await prisma.user.update({
    where: { id: numericId },
    data: {
      firstName,
      lastName,
      email,
      userName: safeUserName,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      userName: true,
      email: true,
      role: true,
    },
  });

  return updated;
} catch (error) {
  console.error(" updateUserProfile error:", error);
  throw new HttpError(500, "Failed to update profile", "UPDATE_FAILED");
}
}
