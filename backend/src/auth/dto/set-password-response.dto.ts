import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './common-response.dto';

export class SetPasswordResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'สถานะความสำเร็จของการดำเนินการ',
    example: true,
  })
  declare success: true;
}
