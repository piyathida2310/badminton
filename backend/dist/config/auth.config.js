"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = exports.passwordResetConfig = exports.jwtConfig = exports.refreshTokenConfig = exports.authConfig = void 0;
exports.authConfig = {
    refreshToken: {
        expiryDays: 7,
        saltRounds: 12,
        maxTokensPerUser: 5,
        cookie: {
            maxAgeDays: 7,
            get maxAge() {
                return 7 * 24 * 3600 * 1000;
            },
        },
    },
    jwt: {
        access: {
            secret: process.env.JWT_ACCESS_SECRET || 'super-access-secret-32+',
            expiresIn: process.env.JWT_ACCESS_EXPIRES || '30m',
        },
        refresh: {
            secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-32+',
            expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
        },
        issuer: process.env.JWT_ISSUER || 'your-app-name',
        audience: process.env.JWT_AUDIENCE || 'your-app-users',
    },
    passwordReset: {
        expiresInMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRES || '15', 10),
        get expiresInMs() {
            return this.expiresInMinutes * 60 * 1000;
        },
        saltRounds: parseInt(process.env.PASSWORD_RESET_SALT_ROUNDS || '12', 10),
    },
    app: {
        port: parseInt(process.env.PORT || '8000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
};
exports.refreshTokenConfig = exports.authConfig.refreshToken;
exports.jwtConfig = exports.authConfig.jwt;
exports.passwordResetConfig = exports.authConfig.passwordReset;
exports.appConfig = exports.authConfig.app;
//# sourceMappingURL=auth.config.js.map