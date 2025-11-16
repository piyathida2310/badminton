"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtCookieOptions = void 0;
exports.parseExpiresIn = parseExpiresIn;
exports.parseExpiresInToMs = parseExpiresInToMs;
exports.setRefreshTokenCookie = setRefreshTokenCookie;
exports.setAccessTokenCookie = setAccessTokenCookie;
exports.extractDeviceInfo = extractDeviceInfo;
exports.extractIpAddress = extractIpAddress;
const authConfig_1 = require("../config/authConfig");
exports.rtCookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
};
function parseExpiresIn(expiresIn) {
    if (typeof expiresIn === 'number') {
        return expiresIn;
    }
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
        throw new Error(`รูปแบบ expiresIn ไม่ถูกต้อง: ${expiresIn}`);
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
            throw new Error(`ไม่รู้จักหน่วยเวลา: ${unit}`);
    }
}
function parseExpiresInToMs(expiresIn) {
    const seconds = parseExpiresIn(expiresIn);
    return seconds * 1000;
}
function setRefreshTokenCookie(res, refreshToken) {
    res.cookie('rt', refreshToken, {
        ...exports.rtCookieOptions,
        maxAge: authConfig_1.refreshTokenConfig.cookie.maxAge,
    });
}
function setAccessTokenCookie(res, accessToken) {
    res.cookie('at', accessToken, {
        ...exports.rtCookieOptions,
        maxAge: parseExpiresInToMs(authConfig_1.jwtConfig.access.expiresIn),
    });
}
function extractDeviceInfo(req) {
    return req.get('User-Agent') ?? undefined;
}
function extractIpAddress(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return (req.ip ||
        req.socket?.remoteAddress ||
        forwardedValue ||
        undefined);
}
//# sourceMappingURL=tokenUtils.js.map