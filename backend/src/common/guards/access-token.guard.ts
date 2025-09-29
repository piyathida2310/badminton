import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    permissions: string[];
    roles: string[];
  };
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    const accessToken = req.cookies?.at as string | undefined;
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const jwtSecret = process.env.JWT_ACCESS_SECRET;
      if (!jwtSecret) {
        throw new UnauthorizedException('JWT secret not configured');
      }
      const decoded = jwt.verify(accessToken, jwtSecret);

      if (
        typeof decoded === 'string' ||
        !decoded ||
        typeof decoded !== 'object'
      ) {
        throw new UnauthorizedException('Invalid token format');
      }

      const payload = decoded as JwtPayload;

      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }
      const user = await this.prisma.ss_User.findUnique({
        where: {
          id: payload.sub,
        },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isVerify) {
        throw new UnauthorizedException(
          'Please verify your email before accessing protected resources',
        );
      }
      const roles = user.roles.map((userRole) => userRole.role.name);
      const permissions = Array.from(
        new Set(
          user.roles.flatMap((userRole) =>
            userRole.role.rolePermissions.map((rp) => rp.permission.name),
          ),
        ),
      );
      console.log('permissions', permissions);
      console.log('roles', roles);
      req.user = {
        sub: payload.sub,
        email: payload.email,
        roles,
        permissions,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid/expired access token');
    }
  }
}
