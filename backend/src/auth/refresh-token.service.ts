import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { refreshTokenConfig } from '../config/auth.config';

@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  async createRefreshToken(
    userId: string,
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const tokenHash = await bcrypt.hash(
      refreshToken,
      refreshTokenConfig.saltRounds,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenConfig.expiryDays);

    return this.prisma.sa_RefreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo,
        ipAddress,
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findValidRefreshToken(refreshToken: string, userId: string) {
    const tokens = await this.prisma.sa_RefreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const token of tokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isValid) {
        return token;
      }
    }

    return null;
  }

  async revokeRefreshToken(tokenId: string) {
    return this.prisma.sa_RefreshToken.update({
      where: { id: tokenId },
      data: { revoked: true },
    });
  }
  async updateDeviceRefaceToken(userId: string, deviceInfo: string) {
    return this.prisma.sa_RefreshToken.updateMany({
      where: {
        userId,
        revoked: false,
        deviceInfo: deviceInfo,
      },
      data: {
        revoked: true,
      },
    });
  }
  async cleanupExpiredTokens() {
    return this.prisma.sa_RefreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
      },
    });
  }

  async getActiveTokenCount(userId: string): Promise<number> {
    return this.prisma.sa_RefreshToken.count({
      where: {
        userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.sa_RefreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });
  }
}
