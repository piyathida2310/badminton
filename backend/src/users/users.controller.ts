import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';

import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  NewpassWordDto,
  ResponeNewpassWordDto,
  UserProfileDto,
  CreateUserDto,
  UserResponseDto,
} from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
}
