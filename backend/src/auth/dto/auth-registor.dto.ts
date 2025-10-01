import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  IsOptional,
} from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PLAYER = 'PLAYER',
}

export class AuthRegisterDto {
  @ApiProperty({
    description: 'ชื่อ-นามสกุล',
    example: 'สมชาย ใจดี',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'อีเมล',
    example: 'somchai@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'ยืนยันรหัสผ่าน',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;

  @ApiProperty({
    description: 'Username (optional)',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'User role',
    example: 'PLAYER',
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;
}
