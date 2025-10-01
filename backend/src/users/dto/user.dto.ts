import {
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'อีเมลของผู้ใช้',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'password123',
  })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  password!: string;

  @ApiPropertyOptional({
    description: 'รายการ ID ของบทบาท',
    example: ['role-id-1', 'role-id-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'roleIds ต้องเป็น array' })
  @IsString({ each: true, message: 'แต่ละ roleId ต้องเป็นข้อความ' })
  roleIds?: string[];
  @IsString()
  @IsOptional()
  prefix?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'อีเมลของผู้ใช้',
    example: 'newemail@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email?: string;
}

export class NewpassWordDto {
  @ApiProperty({
    description: 'อีเมลของผู้ใช้',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;
  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'password123',
  })
  //มากกว่า 8 ตัว
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  currentPassword!: string;
  @ApiProperty({
    description: 'รหัสผ่านใหม่',
    example: 'password123',
  })
  //มากกว่า 8 ตัว
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  newPassword!: string;
}

export class ResponeNewpassWordDto {
  @ApiProperty({
    description: 'สถานะ',
    example: 200,
  })
  status!: number;
  @ApiProperty({
    description: 'ข้อความ',
    example: 'message',
  })
  message!: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID ของผู้ใช้',
    example: 'uuid-string',
  })
  @IsString({ message: 'ID ต้องเป็นข้อความ' })
  id!: string;

  @ApiProperty({
    description: 'อีเมลของผู้ใช้',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @ApiProperty({
    description: 'วันที่สร้างบัญชี',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'รูปแบบวันที่ไม่ถูกต้อง' })
  createdAt!: string;

  @ApiProperty({
    description: 'วันที่อัปเดตล่าสุด',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'รูปแบบวันที่ไม่ถูกต้อง' })
  updatedAt!: string;

  @ApiProperty({
    description: 'บทบาทของผู้ใช้',
    example: [
      { role: { id: 'role-id', name: 'User', description: 'Basic user role' } },
    ],
  })
  roles!: Array<{
    role: {
      id: string;
      name: string;
      description: string;
    };
  }>;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'ID ของผู้ใช้',
    example: 'uuid-string',
  })
  sub!: string;

  @ApiProperty({
    description: 'อีเมลของผู้ใช้',
    example: 'user@example.com',
  })
  email!: string;
}
