import { Response, Request } from 'express';
import { refreshTokenConfig, jwtConfig } from '../config/authConfig';

export const rtCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict' as const,
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

export function parseExpiresIn(expiresIn: string | number): number {
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

export function parseExpiresInToMs(expiresIn: string | number): number {
  const seconds = parseExpiresIn(expiresIn);
  return seconds * 1000;
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie('rt', refreshToken, {
    ...rtCookieOptions,
    maxAge: refreshTokenConfig.cookie.maxAge,
  });
}

export function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie('at', accessToken, {
    ...rtCookieOptions,
    maxAge: parseExpiresInToMs(jwtConfig.access.expiresIn),
  });
}

export function extractDeviceInfo(req: Request): string | undefined {
  return req.get('User-Agent') ?? undefined;
}

export function extractIpAddress(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    forwardedValue ||
    undefined
  );
}
