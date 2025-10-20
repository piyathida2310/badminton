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
exports.ErrorResponseDto = exports.BaseResponseDto = exports.RefreshTokenDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'refreshToken',
        example: 'string',
    }),
    (0, class_validator_1.IsString)({ message: 'Refresh Token ต้องเป็นข้อความ' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class BaseResponseDto {
    success;
    message;
}
exports.BaseResponseDto = BaseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)({ message: 'สถานะต้องเป็น boolean' }),
    __metadata("design:type", Boolean)
], BaseResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ข้อความแสดงสถานะ',
        example: 'Operation completed successfully',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'ข้อความต้องเป็นข้อความ' }),
    __metadata("design:type", String)
], BaseResponseDto.prototype, "message", void 0);
class ErrorResponseDto extends BaseResponseDto {
    errorCode;
    errors;
}
exports.ErrorResponseDto = ErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: false,
    }),
    __metadata("design:type", Boolean)
], ErrorResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รหัสข้อผิดพลาด',
        example: 'AUTH_001',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'รหัสข้อผิดพลาดต้องเป็นข้อความ' }),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "errorCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'รายละเอียดข้อผิดพลาด',
        example: ['Email is required', 'Password must be at least 6 characters'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ErrorResponseDto.prototype, "errors", void 0);
//# sourceMappingURL=common-response.dto.js.map