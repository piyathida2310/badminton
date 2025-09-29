import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { RoleService } from './role.service';
import { RoleDto } from './dto/role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { PaginatedRolesDto } from './dto/paginated-roles.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('Role')
@Controller('roles')
export class RbacController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('System.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List roles' })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    type: PaginatedRolesDto,
  })
  async findAll(@Query() query: GetRolesQueryDto): Promise<PaginatedRolesDto> {
    return this.roleService.findAll(query);
  }

  @Post()
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('System.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create role' })
  @ApiResponse({
    status: 201,
    description: 'Created',

    type: RoleDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Role name already exists',
  })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RoleDto> {
    return this.roleService.create(createRoleDto, req.user.sub);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('System.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role' })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: RoleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async findOne(@Param('id') id: string): Promise<RoleDto> {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('System.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Role name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RoleDto> {
    return this.roleService.update(id, updateRoleDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('System.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async remove(
    @Param('id') id: string,

    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.roleService.remove(id, req.user.sub);
  }
}
