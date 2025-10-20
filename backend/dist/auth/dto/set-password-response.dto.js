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
exports.SetPasswordResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_response_dto_1 = require("./common-response.dto");
class SetPasswordResponseDto extends common_response_dto_1.BaseResponseDto {
}
exports.SetPasswordResponseDto = SetPasswordResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'สถานะความสำเร็จของการดำเนินการ',
        example: true,
    }),
    __metadata("design:type", Boolean)
], SetPasswordResponseDto.prototype, "success", void 0);
//# sourceMappingURL=set-password-response.dto.js.map