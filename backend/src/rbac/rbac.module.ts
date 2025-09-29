import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { PermissionsController } from './permissions.controller';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RbacController, PermissionsController],
  providers: [RoleService, PermissionService],
  exports: [RoleService, PermissionService],
})
export class RbacModule {}
