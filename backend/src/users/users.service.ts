import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { NewpassWordDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, passwordHash: string) {
    const normalizedEmail = email.toLowerCase();
    const exists = await this.prisma.ss_User.findUnique({
      where: { email: normalizedEmail },
    });
    if (exists) throw new BadRequestException('Email already registered');

    return this.prisma.ss_User.create({
      data: { email: normalizedEmail, passwordHash },
    });
  }

  findByEmail(email: string) {
    const normalizedEmail = email.toLowerCase();
    return this.prisma.ss_User.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isVerify: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByEmailWithEmployee(email: string) {
    const normalizedEmail = email.toLowerCase();
    return this.prisma.ss_User.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isVerify: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            isActive: true,
            isDeleted: true,
          },
        },
      },
    });
  }
  async Newpass(dto: NewpassWordDto) {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.findByEmail(normalizedEmail);
    if (!user) throw new BadRequestException('Email not found');
    return true;
  }

  async update(userId: string, data: {}) {
    return this.prisma.ss_User.update({
      where: { id: userId },
      data,
    });
  }

  async findByIdWithRolesAndPermissions(userId: string) {
    return this.prisma.ss_User.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isVerify: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    const users = await this.prisma.ss_User.findMany({
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: user.roles.map((userRole) => ({
        role: {
          id: userRole.role.id,
          name: userRole.role.name,
          description: userRole.role.description || '',
        },
      })),
    }));
  }

  async createUser(
    email: string,
    passwordHash: string,
    prefix: string,
    roleIds?: string[],
  ) {
    const user = await this.prisma.ss_User.create({
      data: {
        email,
        passwordHash,
        roles: {
          create: roleIds
            ? roleIds.map((roleId) => ({ role: { connect: { id: roleId } } }))
            : [],
        },
        employee: {
          create: {
            firstName: '',
            lastName: '',
            phone: '',
            prefix: prefix,
          },
        },
      },
    });
    return user;
  }
}
