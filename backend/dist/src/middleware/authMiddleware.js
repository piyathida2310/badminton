"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authConfig_1 = require("../config/authConfig");
const prismaClient_1 = require("../services/prismaClient");
const httpError_1 = require("../utils/httpError");
async function authMiddleware(req, _res, next) {
    try {
        const request = req;
        const authHeader = request.headers.authorization ?? '';
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new httpError_1.HttpError(401, 'Access token not found', 'TOKEN_NOT_FOUND');
        }
        const decoded = jsonwebtoken_1.default.verify(token, authConfig_1.jwtConfig.access.secret);
        if (!decoded || typeof decoded === 'string') {
            throw new httpError_1.HttpError(401, 'Invalid token', 'INVALID_TOKEN');
        }
        const userId = Number(decoded.sub);
        if (!userId) {
            throw new httpError_1.HttpError(401, 'Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
        }
        const user = await prismaClient_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                userName: true,
                role: true,
                email: true,
            },
        });
        if (!user) {
            throw new httpError_1.HttpError(401, 'User not found', 'USER_NOT_FOUND');
        }
        const userPayload = {
            sub: String(user.id),
            username: user.userName ?? undefined,
            role: user.role,
            email: user.email,
        };
        request.user = userPayload;
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=authMiddleware.js.map