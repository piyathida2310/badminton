import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import {
  PaginatedRolesDto,
  PaginationMetaDto,
} from './dto/paginated-roles.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedRolesDto> {
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

    const [roles, total] = await Promise.all([
      this.prisma.ms_Role.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.ms_Role.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: roles,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.prisma.ms_Role.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto, userId: string): Promise<RoleDto> {
    try {
      const role = await this.prisma.ms_Role.create({
        data: {
          name: createRoleDto.name,
          nameValue: createRoleDto.name,
          description: createRoleDto.description,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return role;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Role name already exists');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    userId: string,
  ): Promise<RoleDto> {
    await this.findOne(id);

    try {
      const role = await this.prisma.ms_Role.update({
        where: { id },
        data: {
          ...(updateRoleDto.nameValue && {
            nameValue: updateRoleDto.nameValue,
          }),
          ...(updateRoleDto.description !== undefined && {
            description: updateRoleDto.description,
          }),
          updatedBy: userId,
        },
      });

      return role;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Role name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.ms_Role.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async findAllWithPermissions(): Promise<
    {
      id: string;
      name: string;
      nameValue: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      permissions: {
        id: string;
        name: string;
        description: string | null;
      }[];
    }[]
  > {
    const roles = await this.prisma.ms_Role.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      nameValue: role.nameValue,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
      })),
    }));
  }
}
