import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({
    description: 'Permission ID',
    example: 'perm_123',
  })
  id: string;

  @ApiProperty({
    description: 'Permission name',
    example: 'CREATE_USER',
  })
  name: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'สามารถสร้างผู้ใช้ใหม่',
    nullable: true,
  })
  description: string | null;
}

export class RoleWithPermissionsDto {
  @ApiProperty({
    description: 'Role ID',
    example: 'role_123',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    description: 'Role name value',
    example: 'ADMIN',
  })
  nameValue: string;

  @ApiProperty({
    description: 'Role description',
    example: 'ผู้ดูแลระบบ',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'List of permissions for this role',
    type: [PermissionDto],
  })
  permissions: PermissionDto[];
}
