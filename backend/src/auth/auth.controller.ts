import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthRegisterDto } from './dto/auth-registor.dto';
import type { AuthenticatedRequest } from './auth.types';

interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

interface UserProfile {
  id: number;
  userName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists',
  })
  async register(@Body() dto: AuthRegisterDto): Promise<TokenResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid username or password',
  })
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }

  @Post('change-password')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async me(@Req() req: AuthenticatedRequest): Promise<UserProfile> {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.authService.getUserProfile(req.user.sub);
  }
}
