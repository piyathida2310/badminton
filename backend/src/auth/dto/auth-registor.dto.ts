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
  password: string;

  @ApiProperty({
    description: 'ยืนยันรหัสผ่าน',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
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
