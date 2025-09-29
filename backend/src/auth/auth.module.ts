import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './refresh-token.service';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../common/email/email.module';
import { RoleService } from '../rbac/role.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UsersModule, EmailModule, NotificationModule],
  providers: [AuthService, RefreshTokenService, PrismaService, RoleService],
  controllers: [AuthController],
})
export class AuthModule {}
