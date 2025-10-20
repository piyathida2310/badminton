"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleWithPermissionsDto = exports.PermissionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PermissionDto {
    id;
    name;
    description;
}
exports.PermissionDto = PermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permission ID',
        example: 'perm_123',
    }),
    __metadata("design:type", String)
], PermissionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permission name',
        example: 'CREATE_USER',
    }),
    __metadata("design:type", String)
], PermissionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permission description',
        example: 'สามารถสร้างผู้ใช้ใหม่',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PermissionDto.prototype, "description", void 0);
class RoleWithPermissionsDto {
    id;
    name;
    nameValue;
    description;
    createdAt;
    updatedAt;
    permissions;
}
exports.RoleWithPermissionsDto = RoleWithPermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role ID',
        example: 'role_123',
    }),
    __metadata("design:type", String)
], RoleWithPermissionsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role name',
        example: 'Admin',
    }),
    __metadata("design:type", String)
], RoleWithPermissionsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role name value',
        example: 'ADMIN',
    }),
    __metadata("design:type", String)
], RoleWithPermissionsDto.prototype, "nameValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role description',
        example: 'ผู้ดูแลระบบ',
        nullable: true,
    }),
    __metadata("design:type", Object)
], RoleWithPermissionsDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], RoleWithPermissionsDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated date',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], RoleWithPermissionsDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of permissions for this role',
        type: [PermissionDto],
    }),
    __metadata("design:type", Array)
], RoleWithPermissionsDto.prototype, "permissions", void 0);
//# sourceMappingURL=roles-permissions-response.dto.js.map