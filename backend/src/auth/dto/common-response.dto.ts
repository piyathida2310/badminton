import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'refreshToken',
    example: 'string',
  })
  @IsString({ message: 'Refresh Token ต้องเป็นข้อความ' })
  refreshToken!: string;
}

export class BaseResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: true,
  })
  @IsBoolean({ message: 'สถานะต้องเป็น boolean' })
  success!: boolean;

  @ApiProperty({
    description: 'ข้อความแสดงสถานะ',
    example: 'Operation completed successfully',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'ข้อความต้องเป็นข้อความ' })
  message?: string;
}

export class ErrorResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: false,
  })
  declare success: false;

  @ApiProperty({
    description: 'รหัสข้อผิดพลาด',
    example: 'AUTH_001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'รหัสข้อผิดพลาดต้องเป็นข้อความ' })
  errorCode?: string;

  @ApiProperty({
    description: 'รายละเอียดข้อผิดพลาด',
    example: ['Email is required', 'Password must be at least 6 characters'],
    required: false,
  })
  @IsOptional()
  errors?: string[];
}
