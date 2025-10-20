import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class AccessTokenGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
