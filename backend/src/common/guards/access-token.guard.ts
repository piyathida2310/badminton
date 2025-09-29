import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/auth.config';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.access.secret);

      if (
        !decoded ||
        typeof decoded === 'string' ||
        typeof decoded !== 'object'
      ) {
        throw new UnauthorizedException('Invalid token format');
      }

      const payload = decoded as JwtPayload;

      if (!payload.sub || !payload.username) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: parseInt(payload.sub),
        },
        select: {
          id: true,
          userName: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      (request as any).user = {
        sub: payload.sub,
        username: user.userName,
        role: user.role,
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
