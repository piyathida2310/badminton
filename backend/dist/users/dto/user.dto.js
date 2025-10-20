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
exports.UserProfileDto = exports.UserResponseDto = exports.ResponeNewpassWordDto = exports.NewpassWordDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateUserDto {
    email;
    password;
    roleIds;
    prefix;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'อีเมลของผู้ใช้',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสผ่าน',
        example: 'password123',
    }),
    (0, class_validator_1.IsString)({ message: 'รหัสผ่านต้องเป็นข้อความ' }),
    (0, class_validator_1.MinLength)(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'รายการ ID ของบทบาท',
        example: ['role-id-1', 'role-id-2'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'roleIds ต้องเป็น array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'แต่ละ roleId ต้องเป็นข้อความ' }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "roleIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "prefix", void 0);
class UpdateUserDto {
    email;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'อีเมลของผู้ใช้',
        example: 'newemail@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
class NewpassWordDto {
    email;
    currentPassword;
    newPassword;
}
exports.NewpassWordDto = NewpassWordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'อีเมลของผู้ใช้',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
    __metadata("design:type", String)
], NewpassWordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสผ่าน',
        example: 'password123',
    }),
    (0, class_validator_1.MinLength)(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }),
    __metadata("design:type", String)
], NewpassWordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสผ่านใหม่',
        example: 'password123',
    }),
    (0, class_validator_1.MinLength)(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }),
    __metadata("design:type", String)
], NewpassWordDto.prototype, "newPassword", void 0);
class ResponeNewpassWordDto {
    status;
    message;
}
exports.ResponeNewpassWordDto = ResponeNewpassWordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะ',
        example: 200,
    }),
    __metadata("design:type", Number)
], ResponeNewpassWordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อความ',
        example: 'message',
    }),
    __metadata("design:type", String)
], ResponeNewpassWordDto.prototype, "message", void 0);
class UserResponseDto {
    id;
    email;
    createdAt;
    updatedAt;
    roles;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID ของผู้ใช้',
        example: 'uuid-string',
    }),
    (0, class_validator_1.IsString)({ message: 'ID ต้องเป็นข้อความ' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'อีเมลของผู้ใช้',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'วันที่สร้างบัญชี',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'รูปแบบวันที่ไม่ถูกต้อง' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'วันที่อัปเดตล่าสุด',
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'รูปแบบวันที่ไม่ถูกต้อง' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'บทบาทของผู้ใช้',
        example: [
            { role: { id: 'role-id', name: 'User', description: 'Basic user role' } },
        ],
    }),
    __metadata("design:type", Array)
], UserResponseDto.prototype, "roles", void 0);
class UserProfileDto {
    sub;
    email;
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID ของผู้ใช้',
        example: 'uuid-string',
    }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "sub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'อีเมลของผู้ใช้',
        example: 'user@example.com',
    }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "email", void 0);
//# sourceMappingURL=user.dto.js.map