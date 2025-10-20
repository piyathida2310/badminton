"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const auth_config_1 = require("../config/auth.config");
let AuthService = class AuthService {
    users;
    prisma;
    constructor(users, prisma) {
        this.users = users;
        this.prisma = prisma;
    }
    signAccessToken(userId, username, role) {
        const payload = { sub: userId.toString(), username, role };
        const accessToken = jwt.sign(payload, auth_config_1.jwtConfig.access.secret, {
            expiresIn: auth_config_1.jwtConfig.access.expiresIn,
        });
        const expiresIn = this.parseExpiresIn(auth_config_1.jwtConfig.access.expiresIn);
        return {
            accessToken,
            expiresIn,
        };
    }
    parseExpiresIn(expiresIn) {
        if (typeof expiresIn === 'number') {
            return expiresIn;
        }
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error(`Invalid expiresIn format: ${expiresIn}`);
        }
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 60 * 60 * 24;
            default:
                throw new Error(`Invalid time unit: ${unit}`);
        }
    }
    async register(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Password confirmation does not match');
        }
        const nameParts = dto.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.users.create(dto.email, firstName, lastName, hashedPassword, dto.role, dto.username);
        return this.signAccessToken(user.id, user.userName || user.email, user.role);
    }
    async login(dto) {
        const user = await this.users.findByEmail(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.signAccessToken(user.id, user.userName || user.email, user.role);
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: parseInt(userId) },
            data: { password: hashedNewPassword },
        });
        return {
            success: true,
            message: 'Password changed successfully',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map