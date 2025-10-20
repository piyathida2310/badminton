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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(email, firstName, lastName, passwordHash, role = client_1.Role.PLAYER, userName) {
        const emailExists = await this.prisma.user.findUnique({
            where: { email },
        });
        if (emailExists)
            throw new common_1.BadRequestException('Email already registered');
        if (userName) {
            const usernameExists = await this.prisma.user.findFirst({
                where: { userName },
            });
            if (usernameExists)
                throw new common_1.BadRequestException('Username already registered');
        }
        return this.prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                userName,
                password: passwordHash,
                role,
            },
        });
    }
    findByUsername(userName) {
        return this.prisma.user.findFirst({
            where: { userName },
            select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                password: true,
                role: true,
                createdAt: true,
            },
        });
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                password: true,
                role: true,
                createdAt: true,
            },
        });
    }
    async update(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    async findById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
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
    }
    async findAll() {
        return this.prisma.user.findMany({
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
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map