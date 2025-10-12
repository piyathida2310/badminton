import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/auth.config';
import { AuthRegisterDto, ChangePasswordDto, LoginDto } from './dto';

interface JwtPayload {
  sub: string;
  username: string;
  typ?: string;
  iat?: number;
  exp?: number;
}

type JwtPair = {
  accessToken: { token: string; expiresIn: number };
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private refreshTokenService: RefreshTokenService,
    private prisma: PrismaService,
  ) {}

<<<<<<< HEAD
  private signAccessToken(
    userId: number,
    username: string,
    role: string,
  ): TokenResponse {
    const payload: JwtPayload = { sub: userId.toString(), username, role };
    const accessToken = jwt.sign(payload, jwtConfig.access.secret, {
      expiresIn: jwtConfig.access.expiresIn,
    } as jwt.SignOptions);
    const expiresIn = this.parseExpiresIn(jwtConfig.access.expiresIn);

=======
  private signAccessToken(userId: string, username: string): string {
    return jwt.sign({ sub: userId, username }, jwtConfig.access.secret, {
      expiresIn: jwtConfig.access.expiresIn,
    } as jwt.SignOptions);
  }

  private signRefreshToken(userId: string, username: string): string {
    return jwt.sign(
      { sub: userId, username, typ: 'refresh' },
      jwtConfig.refresh.secret,
      { expiresIn: jwtConfig.refresh.expiresIn } as jwt.SignOptions,
    );
  }

  private buildTokens(userId: string, username: string): JwtPair {
    const accessToken = this.signAccessToken(userId, username);
    const expiresInSeconds = this.parseExpiresIn(jwtConfig.access.expiresIn);
>>>>>>> parent of 6b10c1e (login กับ registor เสร็จเเล้ว backend กับ frontend)
    return {
      accessToken: { token: accessToken, expiresIn: expiresInSeconds },
      refreshToken: this.signRefreshToken(userId, username),
    };
  }

  private parseExpiresIn(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn;
    }
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }

  async register(dto: AuthRegisterDto) {
    const normalizedUsername = dto.username.toLowerCase();
    const existingUser = await this.prisma.ss_User.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

<<<<<<< HEAD
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create(
      dto.email,
      firstName,
      lastName,
      hashedPassword,
      dto.role,
      dto.username,
    );
    return this.signAccessToken(
      user.id,
      user.userName || user.email,
      user.role,
    );
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    // Find user by email
    const user = await this.users.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signAccessToken(
      user.id,
      user.userName || user.email,
      user.role,
    );
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
=======
    const user = await this.prisma.ss_User.create({
      data: {
        username: normalizedUsername,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        prefix: dto.prefix,
        phone: dto.phone,
        description: dto.description,
        isVerify: true, // User is verified by default
>>>>>>> parent of 6b10c1e (login กับ registor เสร็จเเล้ว backend กับ frontend)
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(
    loginDto: LoginDto,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const normalizedUsername = loginDto.username.toLowerCase();
    const user = await this.prisma.ss_User.findUnique({
      where: { username: normalizedUsername },
    });
    if (!user) throw new UnauthorizedException('Invalid username or password');

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const ok = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid username or password');

    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    await this.refreshTokenService.updateDeviceRefaceToken(
      user.id,
      deviceInfo as string,
    );
    const tokens = this.buildTokens(user.id, user.username);
    await this.refreshTokenService.createRefreshToken(
      user.id,
      tokens.refreshToken,
      deviceInfo,
      ipAddress,
    );
    return tokens;
  }

  async refresh(
    refreshToken: string | undefined,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        jwtConfig.refresh.secret,
      ) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid/expired refresh token');
    }

    const user = await this.prisma.ss_User.findUnique({
      where: { username: payload.username },
    });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const validToken = await this.refreshTokenService.findValidRefreshToken(
      refreshToken,
      user.id,
    );
    if (!validToken)
      throw new UnauthorizedException('Invalid or expired refresh token');
    await this.refreshTokenService.revokeRefreshToken(validToken.id);
    const tokens = this.buildTokens(user.id, user.username);
    await this.refreshTokenService.createRefreshToken(
      user.id,
      tokens.refreshToken,
      deviceInfo,
      ipAddress,
    );

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const validToken = await this.refreshTokenService.findValidRefreshToken(
        refreshToken,
        userId,
      );
      if (validToken) {
        await this.refreshTokenService.revokeRefreshToken(validToken.id);
      }
    } else {
      await this.refreshTokenService.revokeAllUserTokens(userId);
    }
    return { success: true };
  }

  async ChangePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.passwordHash === null) {
      throw new UnauthorizedException('User has no password set');
    }
    const ok = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid old password');
    }
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users.update(user.id, {
      passwordHash: newPasswordHash,
    });
    return { success: true, message: 'Password changed successfully.' };
  }
  async getUserProfile(userId: string) {
    const user = await this.users.findByIdWithRolesAndPermissions(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

<<<<<<< HEAD
    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
=======
    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
>>>>>>> parent of 6b10c1e (login กับ registor เสร็จเเล้ว backend กับ frontend)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}
