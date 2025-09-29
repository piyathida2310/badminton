import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class GetRolesQueryDto {
  @ApiProperty({
    description: 'Current page (1-based)',
    required: false,
    type: Number,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Page size',
    required: false,
    type: Number,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Free-text search (name/description)',
    required: false,
    type: String,
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
