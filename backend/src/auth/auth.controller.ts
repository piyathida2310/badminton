import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { RoleService } from '../rbac/role.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  TokenResponseDto,
  LogoutResponseDto,
  PingResponseDto,
  UserProfileResponseDto,
  VerifyEmailResponseDto,
  ErrorResponse,
} from './dto/auth-response.dto';
import { RoleWithPermissionsDto } from './dto/roles-permissions-response.dto';
import {
  VerifyTokenDto,
  VerifyTokenResponseDto,
  VerifyEmailDto,
  SetPasswordDto,
  SetPasswordResponseDto,
} from './dto';
import type { AuthenticatedRequest } from './auth.types';
import {
  extractDeviceInfo,
  extractIpAddress,
  setRefreshTokenCookie,
  setAccessTokenCookie,
} from './auth.utils';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RoleService,
  ) {}
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @HttpCode(201)
  async signup(
    @Body() dto: SignupDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const deviceInfo = extractDeviceInfo(req) || 'unknown';
    const ipAddress = extractIpAddress(req) || 'unknown';
    const user = await this.authService.signup(
      dto.email,
      dto.firstname,
      dto.lastname,
      dto.prefix,
      dto.phone,
      deviceInfo,
      ipAddress,
    );
    return {
      success: true,
      message: 'Registered',
    };
  }
  @Post('verify-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify  token' })
  @ApiResponse({
    status: 200,
    description: 'Token correct',
    type: VerifyTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token ไม่ถูกต้องหรือหมดอายุ',
    type: ErrorResponse,
  })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<VerifyEmailResponseDto> {
    console.log('token', dto.token);
    const result = await this.authService.verifyEmail(dto.token);
    return {
      success: true,
      message: result.message,
      userId: result.userId,
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'เข้าสู่ระบบสำเร็จ',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง อิอิ',
    type: ErrorResponse,
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const deviceInfo = extractDeviceInfo(req);
    const ipAddress = extractIpAddress(req);
    const tokens = await this.authService.login(
      dto.email,
      dto.password,
      deviceInfo,
      ipAddress,
    );
    setRefreshTokenCookie(res, tokens.refreshToken);
    setAccessTokenCookie(res, tokens.accessToken.token);
    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      expiresIn: tokens.accessToken.expiresIn,
    };
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'รีเฟรช Token สำเร็จ',
    type: TokenResponseDto,
  })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const refreshToken = req.cookies?.rt as string | undefined;
    const deviceInfo = extractDeviceInfo(req);
    const ipAddress = extractIpAddress(req);
    const tokens = await this.authService.refresh(
      refreshToken,
      deviceInfo,
      ipAddress,
    );
    setRefreshTokenCookie(res, tokens.refreshToken);
    setAccessTokenCookie(res, tokens.accessToken.token);
    return {
      success: true,
      message: 'รีเฟรช Token สำเร็จ',
      expiresIn: tokens.accessToken.expiresIn,
    };
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({
    status: 200,
    description: 'ออกจากระบบสำเร็จ',
    type: LogoutResponseDto,
  })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const user = req.user!;
    const refreshToken = req.cookies?.rt as string | undefined;
    await this.authService.logout(user.sub, refreshToken);
    res.clearCookie('rt', { path: '/' });
    res.clearCookie('at', { path: '/' });
    return {
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    };
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: 200,
    description: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว',
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่พบผู้ใช้งานที่มีอีเมลนี้',
    type: ErrorResponse,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.authService.ForgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password or verify token' })
  @ApiResponse({
    status: 200,
    description: 'รีเซ็ตรหัสผ่านสำเร็จหรือโทเค็นถูกต้อง',
  })
  @ApiResponse({
    status: 400,
    description: 'โทเค็นไม่ถูกต้องหรือหมดอายุแล้ว',
    type: ErrorResponse,
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    // ถ้าส่งแค่ token มา = ตรวจสอบโทเค็น
    if (!dto.newPassword) {
      return await this.authService.VerifyResetToken(dto.token);
    }
    // ถ้าส่งทั้ง token และ newPassword = รีเซ็ตรหัสผ่าน
    return await this.authService.ResetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'เปลี่ยนรหัสผ่านสำเร็จ',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: true; message: string }> {
    await this.authService.ChangePassword(req.user!.sub, dto);
    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดึงข้อมูลโปรไฟล์ผู้ใช้' })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต',
    type: ErrorResponse,
  })
  @ApiResponse({
    type: UserProfileResponseDto,
  })
  async me(@Req() req: AuthenticatedRequest): Promise<UserProfileResponseDto> {
    const user = req.user!;
    const userProfile = await this.authService.getUserProfile(user.sub);

    return userProfile;
  }

  @Post('set-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set password for user' })
  @ApiResponse({
    status: 200,
    description: 'ตั้งรหัสผ่านสำเร็จ',
    type: SetPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ไม่สามารถตั้งรหัสผ่านได้',
    type: ErrorResponse,
  })
  async setPassword(
    @Body() dto: SetPasswordDto,
  ): Promise<SetPasswordResponseDto> {
    return this.authService.setPassword(dto.userId, dto.password);
  }

  @Get('roles-permissions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดึงข้อมูลทุก role พร้อม permission' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูล role และ permission สำเร็จ',
    type: [RoleWithPermissionsDto],
  })
  @ApiResponse({
    status: 401,
    description: 'ไม่ได้รับอนุญาต',
    type: ErrorResponse,
  })
  async getRolesWithPermissions(): Promise<RoleWithPermissionsDto[]> {
    return this.roleService.findAllWithPermissions();
  }
}
