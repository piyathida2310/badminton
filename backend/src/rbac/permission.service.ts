import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionDto } from './dto/permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PermissionDto[]> {
    const { page = 1, limit = 10, search } = options || {};
    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const permissions = await this.prisma.ms_Permission.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return permissions;
  }

  async findOne(id: string): Promise<PermissionDto> {
    const permission = await this.prisma.ms_Permission.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async create(
    createPermissionDto: CreatePermissionDto,
    userId: string,
  ): Promise<PermissionDto> {
    try {
      const permission = await this.prisma.ms_Permission.create({
        data: {
          name: createPermissionDto.name,
          description: createPermissionDto.description,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return permission;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Permission name already exists');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    userId: string,
  ): Promise<PermissionDto> {
    await this.findOne(id);

    try {
      const permission = await this.prisma.ms_Permission.update({
        where: { id },
        data: {
          ...(updatePermissionDto.name && { name: updatePermissionDto.name }),
          ...(updatePermissionDto.description !== undefined && {
            description: updatePermissionDto.description,
            updatedBy: userId,
          }),
        },
      });

      return permission;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Permission name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.ms_Permission.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy: userId,
      },
    });
  }
}
