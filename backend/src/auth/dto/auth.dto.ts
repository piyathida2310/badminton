import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'ชื่อผู้ใช้',
    example: 'superadmin',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'รหัสผ่านเดิม',
    example: 'string',
  })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  oldPassword!: string;

  @ApiProperty({
    description: 'รหัสผ่านใหม่',
    example: 'stringst',
  })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  newPassword!: string;
}
