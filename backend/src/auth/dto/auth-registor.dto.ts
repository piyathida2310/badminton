<<<<<<< HEAD
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
=======
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';
>>>>>>> parent of 6b10c1e (login กับ registor เสร็จเเล้ว backend กับ frontend)

export class AuthRegisterDto {
  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Employee prefix',
    example: 'Mr.',
    nullable: true,
  })
  prefix?: string | null;

  @ApiProperty({
    description: 'Employee first name',
    example: 'Jane',
  })
  @IsString()
  @IsNotEmpty()
<<<<<<< HEAD
  confirmPassword: string;
=======
  firstName: string;
>>>>>>> parent of 6b10c1e (login กับ registor เสร็จเเล้ว backend กับ frontend)

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Employee phone number',
    example: '+66912345678',
  })
<<<<<<< HEAD
  @IsEnum(Role)
  role: Role;
}
=======
  phone?: string;

  @ApiPropertyOptional({
    description: 'Employee description',
    example: 'ผู้พัฒนาระบบหลัก',
    nullable: true,
  })
  description?: string | null;
}
>>>>>>> parent of 6b10c1e (login กับ registor เสร็จเเล้ว backend กับ frontend)
