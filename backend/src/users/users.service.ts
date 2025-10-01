import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
    role: Role = Role.PLAYER,
    userName?: string,
  ) {
    // Check if email already exists
    const emailExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExists) throw new BadRequestException('Email already registered');

    // Check if username already exists (if provided)
    if (userName) {
      const usernameExists = await this.prisma.user.findFirst({
        where: { userName },
      });
      if (usernameExists)
        throw new BadRequestException('Username already registered');
    }

    return this.prisma.user.create({
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

  findByUsername(userName: string) {
    return this.prisma.user.findFirst({
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

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
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

  async update(userId: number, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
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

  async findAll() {
    return this.prisma.user.findMany({
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
}
