"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.changePasswordHandler = changePasswordHandler;
exports.me = me;
const client_1 = require("@prisma/client");
const authService_1 = require("../services/authService");
const httpError_1 = require("../utils/httpError");
const ALLOWED_ROLES = Object.values(client_1.Role);
async function register(req, res, next) {
    try {
        const { fullName, email, password, confirmPassword, username, role } = req.body ?? {};
        if (!fullName || !String(fullName).trim()) {
            throw new httpError_1.HttpError(400, 'fullName is required', 'VALIDATION_ERROR');
        }
        if (!email) {
            throw new httpError_1.HttpError(400, 'email is required', 'VALIDATION_ERROR');
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw new httpError_1.HttpError(400, 'email format is invalid', 'VALIDATION_ERROR');
        }
        if (!password || password.length < 8) {
            throw new httpError_1.HttpError(400, 'password must be at least 8 characters', 'VALIDATION_ERROR');
        }
        if (!confirmPassword || confirmPassword.length < 8) {
            throw new httpError_1.HttpError(400, 'confirmPassword must be at least 8 characters', 'VALIDATION_ERROR');
        }
        if (!role || !ALLOWED_ROLES.includes(role)) {
            throw new httpError_1.HttpError(400, `role must be one of ${ALLOWED_ROLES.join(', ')}`, 'VALIDATION_ERROR');
        }
        const tokenResponse = await (0, authService_1.registerUser)({
            fullName,
            email,
            password,
            confirmPassword,
            username,
            role,
        });
        res.status(201).json(tokenResponse);
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password || password.length < 8) {
            throw new httpError_1.HttpError(400, 'email and password (min 8 chars) are required', 'VALIDATION_ERROR');
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw new httpError_1.HttpError(400, 'email format is invalid', 'VALIDATION_ERROR');
        }
        const tokenResponse = await (0, authService_1.loginUser)({ email, password });
        res.status(200).json(tokenResponse);
    }
    catch (error) {
        next(error);
    }
}
async function changePasswordHandler(req, res, next) {
    try {
        const { oldPassword, newPassword } = req.body ?? {};
        if (!oldPassword || !newPassword) {
            throw new httpError_1.HttpError(400, 'oldPassword and newPassword are required', 'VALIDATION_ERROR');
        }
        if (oldPassword.length < 8 || newPassword.length < 8) {
            throw new httpError_1.HttpError(400, 'oldPassword and newPassword must be at least 8 characters', 'VALIDATION_ERROR');
        }
        const request = req;
        if (!request.user) {
            throw new httpError_1.HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
        }
        const result = await (0, authService_1.changePassword)(request.user.sub, {
            oldPassword,
            newPassword,
        });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function me(req, res, next) {
    try {
        const request = req;
        if (!request.user) {
            throw new httpError_1.HttpError(401, 'User not authenticated', 'UNAUTHORIZED');
        }
        const profile = await (0, authService_1.getUserProfile)(request.user.sub);
        res.json(profile);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=authController.js.map