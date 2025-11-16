"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findByUsername = findByUsername;
exports.findByEmail = findByEmail;
exports.findById = findById;
exports.findAll = findAll;
exports.updateUser = updateUser;
const client_1 = require("@prisma/client");
const prismaClient_1 = require("./prismaClient");
const httpError_1 = require("../utils/httpError");
async function createUser({ email, firstName, lastName, passwordHash, role = client_1.Role.PLAYER, userName, }) {
    const existingByEmail = await prismaClient_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingByEmail) {
        throw new httpError_1.HttpError(400, 'Email already registered', 'EMAIL_EXISTS');
    }
    if (userName) {
        const existingByUsername = await prismaClient_1.prisma.user.findFirst({
            where: { userName },
        });
        if (existingByUsername) {
            throw new httpError_1.HttpError(400, 'Username already registered', 'USERNAME_EXISTS');
        }
    }
    return prismaClient_1.prisma.user.create({
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
function findByUsername(userName) {
    return prismaClient_1.prisma.user.findFirst({
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
function findByEmail(email) {
    return prismaClient_1.prisma.user.findUnique({
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
function findById(id) {
    return prismaClient_1.prisma.user.findUnique({
        where: { id },
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
function findAll() {
    return prismaClient_1.prisma.user.findMany({
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
async function updateUser(userId, data) {
    return prismaClient_1.prisma.user.update({
        where: { id: userId },
        data,
    });
}
//# sourceMappingURL=userService.js.map