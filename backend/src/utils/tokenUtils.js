// ยูทิลิตี้เกี่ยวกับ JWT และคุกกี้ ใช้งานร่วมกับบริการยืนยันตัวตน
// แยกออกมาเพื่อให้ทดสอบและแก้ไขได้ง่ายหากมีการเปลี่ยนการคำนวณเวลาในอนาคต
const { refreshTokenConfig, jwtConfig } = require('../config/authConfig');

const rtCookieOptions = {
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
    ...rtCookieOptions,
    maxAge: refreshTokenConfig.cookie.maxAge,
  });
}

function setAccessTokenCookie(res, accessToken) {
  res.cookie('at', accessToken, {
    ...rtCookieOptions,
    maxAge: parseExpiresInToMs(jwtConfig.access.expiresIn),
  });
}

function extractDeviceInfo(req) {
  return req.get('User-Agent');
}

function extractIpAddress(req) {
  return (
    req.ip ||
    req.socket?.remoteAddress ||
    (Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']) ||
    undefined
  );
}

module.exports = {
  parseExpiresIn,
  parseExpiresInToMs,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  extractDeviceInfo,
  extractIpAddress,
  rtCookieOptions,
};
