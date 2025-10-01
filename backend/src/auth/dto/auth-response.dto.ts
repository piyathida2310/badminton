import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ErrorResponse {
  @ApiProperty({
    description: 'Error details',
    example: {
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password incorrect',
      status: 401,
    },
  })
  error!: {
    code: string;
    message: string;
    status: number;
  };
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'accessToken',
    example: 'eyJhbGciOi...',
  })
  success!: boolean;

  @ApiProperty({
    description: 'refreshToken',
    example: 'eyJhbGciOi...',
  })
  message!: string;

  @ApiProperty({
    description: 'เวลาหมดอายุของ Access Token (วินาที)',
    example: 3600,
  })
  expiresIn!: number;
}
export class VerifyTokenResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'ข้อความแสดงสถานะ',
    example: 'Operation completed successfully',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'รหัสผู้ใช้',
    example: 'user_123',
    required: false,
  })
  userId?: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'ข้อความแสดงสถานะ',
    example: 'Email verified successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'รหัสผู้ใช้',
    example: 'user_123',
    required: false,
  })
  userId?: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'ข้อความแสดงสถานะ',
    example: 'ออกจากระบบสำเร็จ',
  })
  message!: string;
}

export class PingResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'ข้อความแสดงสถานะ',
    example: 'Operation completed successfully',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Refresh Token ของผู้ใช้',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Refresh token ต้องเป็นข้อความ' })
  refreshToken?: string;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'รหัสผู้ใช้',
    example: 'user_123',
  })
  id!: string;

  @ApiProperty({
    description: 'รหัสแผนก',
    example: 'dept_456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Department ID ต้องเป็นข้อความ' })
  departmentId?: string | null;

  @ApiProperty({
    description: 'อีเมลผู้ใช้',
    example: 'jane@company.com',
  })
  email!: string;

  @ApiProperty({
    description: 'ชื่อจริง',
    example: 'Jane',
    required: false,
  })
  @IsOptional()
  firstName?: string | null;

  @ApiProperty({
    description: 'นามสกุล',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  lastName?: string | null;

  @ApiProperty({
    description: 'คำนำหน้าชื่อ',
    example: 'Ms.',
    required: false,
  })
  @IsOptional()
  prefix?: string | null;

  @ApiProperty({
    description: 'ชื่อผู้ใช้',
    example: 'Jane Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'เบอร์โทรศัพท์',
    example: '0812345678',
    required: false,
  })
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    description: 'คำอธิบายเพิ่มเติม',
    example: 'Senior Developer',
    required: false,
  })
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'สถานะการใช้งาน',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'สถานะการยืนยันอีเมล',
    example: true,
  })
  isVerified!: boolean;

  @ApiProperty({
    description: 'บทบาทของผู้ใช้',
    example: ['ADMIN', 'MANAGER'],
  })
  roles!: string[];

  @ApiProperty({
    description: 'วันที่สร้างบัญชี',
    example: '2025-08-01T09:00:00Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'วันที่อัปเดตล่าสุด',
    example: '2025-08-10T07:30:00Z',
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'แผนกของผู้ใช้',
    example: [],
    required: false,
  })
  @IsOptional()
  departments?: string[];

  @ApiProperty({
    description: 'ชื่อแผนกของผู้ใช้',
    example: '',
    required: false,
  })
  @IsOptional()
  departmentName?: string;

  @ApiProperty({
    description: 'ข้อมูลตำแหน่งงาน',
    example: {
      id: 'pos_123',
      name: 'Senior Developer',
      description: 'Responsible for software development',
    },
    required: false,
  })
  @IsOptional()
  position?: {
    id: string;
    name: string;
    description?: string;
  } | null;

  @ApiProperty({
    description: 'ข้อมูลองค์กร',
    example: {
      id: 'org_123',
      name: 'PONIX Company',
      logoUrl: 'https://example.com/logo.png',
      address: '123 Main St, Bangkok',
    },
    required: false,
  })
  @IsOptional()
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
    address: string;
  } | null;

  @ApiProperty({
    description: 'จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน',
    example: 5,
  })
  unreadNotificationCount!: number;

  @ApiProperty({
    description: 'รายการการแจ้งเตือนที่ยังไม่ได้อ่าน',
    example: [
      {
        id: 'notif_123',
        title: 'งานใหม่',
        message: 'คุณได้รับมอบหมายงานใหม่: ออกแบบระบบ',
        type: 'TASK_ASSIGNED',
        isRead: false,
        createdAt: '2025-01-13T10:00:00Z',
        task: null,
      },
    ],
    required: false,
  })
  @IsOptional()
  unreadNotifications?: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    task?: any;
  }[];
}
