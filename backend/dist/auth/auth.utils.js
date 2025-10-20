"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtCookieOptions = void 0;
exports.extractDeviceInfo = extractDeviceInfo;
exports.extractIpAddress = extractIpAddress;
exports.setRefreshTokenCookie = setRefreshTokenCookie;
exports.setAccessTokenCookie = setAccessTokenCookie;
const auth_config_1 = require("../config/auth.config");
function parseExpiresInToMs(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match)
        return 30 * 60 * 1000;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 3600 * 1000;
        case 'd':
            return value * 86400 * 1000;
        default:
            return 30 * 60 * 1000;
    }
}
exports.rtCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
};
function extractDeviceInfo(req) {
    return req.get('User-Agent');
}
function extractIpAddress(req) {
    return req.ip || req.connection.remoteAddress;
}
function setRefreshTokenCookie(res, refreshToken) {
    res.cookie('rt', refreshToken, {
        ...exports.rtCookieOptions,
        maxAge: auth_config_1.refreshTokenConfig.cookie.maxAge,
    });
}
function setAccessTokenCookie(res, accessToken) {
    res.cookie('at', accessToken, {
        ...exports.rtCookieOptions,
        maxAge: parseExpiresInToMs(process.env.JWT_ACCESS_EXPIRES || '30m'),
    });
}
//# sourceMappingURL=auth.utils.js.map