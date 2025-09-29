import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({
    description: 'Permission ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Permission name',
    example: 'user.read',
  })
  name: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'View user information',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
  })
  isDeleted: boolean;
}
