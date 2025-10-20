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
exports.UserProfileResponseDto = exports.PingResponseDto = exports.LogoutResponseDto = exports.VerifyEmailResponseDto = exports.VerifyTokenResponseDto = exports.TokenResponseDto = exports.ErrorResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ErrorResponse {
    error;
}
exports.ErrorResponse = ErrorResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error details',
        example: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email or password incorrect',
            status: 401,
        },
    }),
    __metadata("design:type", Object)
], ErrorResponse.prototype, "error", void 0);
class TokenResponseDto {
    success;
    message;
    expiresIn;
}
exports.TokenResponseDto = TokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'accessToken',
        example: 'eyJhbGciOi...',
    }),
    __metadata("design:type", Boolean)
], TokenResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'refreshToken',
        example: 'eyJhbGciOi...',
    }),
    __metadata("design:type", String)
], TokenResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'เวลาหมดอายุของ Access Token (วินาที)',
        example: 3600,
    }),
    __metadata("design:type", Number)
], TokenResponseDto.prototype, "expiresIn", void 0);
class VerifyTokenResponseDto {
    success;
    message;
    userId;
}
exports.VerifyTokenResponseDto = VerifyTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: true,
    }),
    __metadata("design:type", Boolean)
], VerifyTokenResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อความแสดงสถานะ',
        example: 'Operation completed successfully',
        required: false,
    }),
    __metadata("design:type", String)
], VerifyTokenResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสผู้ใช้',
        example: 'user_123',
        required: false,
    }),
    __metadata("design:type", String)
], VerifyTokenResponseDto.prototype, "userId", void 0);
class VerifyEmailResponseDto {
    success;
    message;
    userId;
}
exports.VerifyEmailResponseDto = VerifyEmailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: true,
    }),
    __metadata("design:type", Boolean)
], VerifyEmailResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อความแสดงสถานะ',
        example: 'Email verified successfully',
    }),
    __metadata("design:type", String)
], VerifyEmailResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสผู้ใช้',
        example: 'user_123',
        required: false,
    }),
    __metadata("design:type", String)
], VerifyEmailResponseDto.prototype, "userId", void 0);
class LogoutResponseDto {
    success;
    message;
}
exports.LogoutResponseDto = LogoutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: true,
    }),
    __metadata("design:type", Boolean)
], LogoutResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อความแสดงสถานะ',
        example: 'ออกจากระบบสำเร็จ',
    }),
    __metadata("design:type", String)
], LogoutResponseDto.prototype, "message", void 0);
class PingResponseDto {
    success;
    message;
    refreshToken;
}
exports.PingResponseDto = PingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PingResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อความแสดงสถานะ',
        example: 'Operation completed successfully',
        required: false,
    }),
    __metadata("design:type", String)
], PingResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Refresh Token ของผู้ใช้',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Refresh token ต้องเป็นข้อความ' }),
    __metadata("design:type", String)
], PingResponseDto.prototype, "refreshToken", void 0);
class UserProfileResponseDto {
    id;
    departmentId;
    email;
    firstName;
    lastName;
    prefix;
    name;
    phone;
    description;
    isActive;
    isVerified;
    roles;
    createdAt;
    updatedAt;
    departments;
    departmentName;
    position;
    organization;
    unreadNotificationCount;
    unreadNotifications;
}
exports.UserProfileResponseDto = UserProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสผู้ใช้',
        example: 'user_123',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสแผนก',
        example: 'dept_456',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Department ID ต้องเป็นข้อความ' }),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'อีเมลผู้ใช้',
        example: 'jane@company.com',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ชื่อจริง',
        example: 'Jane',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'นามสกุล',
        example: 'Doe',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'คำนำหน้าชื่อ',
        example: 'Ms.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ชื่อผู้ใช้',
        example: 'Jane Doe',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'เบอร์โทรศัพท์',
        example: '0812345678',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'คำอธิบายเพิ่มเติม',
        example: 'Senior Developer',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะการใช้งาน',
        example: true,
    }),
    __metadata("design:type", Boolean)
], UserProfileResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะการยืนยันอีเมล',
        example: true,
    }),
    __metadata("design:type", Boolean)
], UserProfileResponseDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'บทบาทของผู้ใช้',
        example: ['ADMIN', 'MANAGER'],
    }),
    __metadata("design:type", Array)
], UserProfileResponseDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'วันที่สร้างบัญชี',
        example: '2025-08-01T09:00:00Z',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'วันที่อัปเดตล่าสุด',
        example: '2025-08-10T07:30:00Z',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'แผนกของผู้ใช้',
        example: [],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UserProfileResponseDto.prototype, "departments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ชื่อแผนกของผู้ใช้',
        example: '',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "departmentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อมูลตำแหน่งงาน',
        example: {
            id: 'pos_123',
            name: 'Senior Developer',
            description: 'Responsible for software development',
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อมูลองค์กร',
        example: {
            id: 'org_123',
            name: 'PONIX Company',
            logoUrl: 'https://example.com/logo.png',
            address: '123 Main St, Bangkok',
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน',
        example: 5,
    }),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "unreadNotificationCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รายการการแจ้งเตือนที่ยังไม่ได้อ่าน',
        example: [
            {
                id: 'notif_123',
                title: 'งานใหม่',
                message: 'คุณได้รับมอบหมายงานใหม่: ออกแบบระบบ',
                type: 'TASK_ASSIGNED',
                isRead: false,
                createdAt: '2025-01-13T10:00:00Z',
                task: null,
            },
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UserProfileResponseDto.prototype, "unreadNotifications", void 0);
//# sourceMappingURL=auth-response.dto.js.map