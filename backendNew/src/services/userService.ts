import { Prisma, Role } from '@prisma/client';
import { prisma } from './prismaClient';
import { HttpError } from '../utils/httpError';

export interface CreateUserParams {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role?: Role;
  userName?: string | null;
}

type UserWithPassword = Prisma.UserGetPayload<{
  select: {
    id: true;
    userName: true;
    email: true;
    firstName: true;
    lastName: true;
    password: true;
    role: true;
    createdAt: true;
  };
}>;

type PublicUser = Prisma.UserGetPayload<{
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

export async function createUser({
  email,
  firstName,
  lastName,
  passwordHash,
  role = Role.PLAYER,
  userName,
}: CreateUserParams) {
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

export function findByUsername(userName: string): Promise<UserWithPassword | null> {
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

export function findByEmail(email: string): Promise<UserWithPassword | null> {
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

export function findById(id: number): Promise<PublicUser | null> {
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

export function findAll(): Promise<PublicUser[]> {
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

export async function updateUser(userId: number, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
