"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUserProfile = getUserProfile;
exports.changePassword = changePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authConfig_1 = require("../config/authConfig");
const userService_1 = require("./userService");
const prismaClient_1 = require("./prismaClient");
const httpError_1 = require("../utils/httpError");
const tokenUtils_1 = require("../utils/tokenUtils");
function signAccessToken(userId, username, role) {
    const payload = {
        sub: String(userId),
        username: username ?? undefined,
        role,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, authConfig_1.jwtConfig.access.secret, {
        expiresIn: authConfig_1.jwtConfig.access.expiresIn,
        issuer: authConfig_1.jwtConfig.issuer,
        audience: authConfig_1.jwtConfig.audience,
    });
    return {
        accessToken,
        expiresIn: (0, tokenUtils_1.parseExpiresIn)(authConfig_1.jwtConfig.access.expiresIn),
    };
}
async function registerUser({ fullName, email, password, confirmPassword, username, role = client_1.Role.PLAYER, }) {
    if (password !== confirmPassword) {
        throw new httpError_1.HttpError(400, 'Password confirmation does not match', 'PASSWORD_MISMATCH');
    }
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') ?? '';
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await (0, userService_1.createUser)({
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        userName: username ?? undefined,
    });
    return signAccessToken(user.id, user.userName ?? user.email, user.role);
}
async function loginUser({ email, password }) {
    const user = await (0, userService_1.findByEmail)(email);
    if (!user) {
        throw new httpError_1.HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        throw new httpError_1.HttpError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    return signAccessToken(user.id, user.userName ?? user.email, user.role);
}
async function getUserProfile(userId) {
    const numericId = Number(userId);
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { id: numericId },
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
        throw new httpError_1.HttpError(401, 'User not found', 'USER_NOT_FOUND');
    }
    return user;
}
async function changePassword(userId, { oldPassword, newPassword }) {
    const numericId = Number(userId);
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { id: numericId },
    });
    if (!user) {
        throw new httpError_1.HttpError(401, 'User not found', 'USER_NOT_FOUND');
    }
    const isOldPasswordValid = await bcrypt_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
        throw new httpError_1.HttpError(400, 'Current password is incorrect', 'PASSWORD_INCORRECT');
    }
    const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
    await (0, userService_1.updateUser)(numericId, { password: hashedNewPassword });
    return {
        success: true,
        message: 'Password changed successfully',
    };
}
//# sourceMappingURL=authService.js.map