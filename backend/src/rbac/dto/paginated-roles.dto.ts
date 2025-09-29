import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from './role.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 2, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedRolesDto {
  @ApiProperty({ type: [RoleDto], description: 'List of roles' })
  items: RoleDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta: PaginationMetaDto;
}
