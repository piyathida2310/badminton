import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionService } from './permission.service';
import { PermissionDto } from './dto/permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('user.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List permissions ' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully',
    type: [PermissionDto],
  })
  async findAll(
    @Query() query: GetPermissionsQueryDto,
  ): Promise<PermissionDto[]> {
    return this.permissionService.findAll(query);
  }

  @Post()
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('user.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Permission name already exists',
  })
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PermissionDto> {
    return this.permissionService.create(createPermissionDto, req.user.sub);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('user.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: PermissionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  async findOne(@Param('id') id: string): Promise<PermissionDto> {
    return this.permissionService.findOne(id);
  }
  @Patch(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('user.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Permission name already exists',
  })
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionDto> {
    return this.permissionService.update(id, updatePermissionDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions('user.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.permissionService.remove(id, req.user.sub);
  }
}
