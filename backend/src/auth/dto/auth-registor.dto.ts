import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

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
  @MinLength(8)
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
  firstName: string;

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
  phone?: string;

  @ApiPropertyOptional({
    description: 'Employee description',
    example: 'ผู้พัฒนาระบบหลัก',
    nullable: true,
  })
  description?: string | null;
}
