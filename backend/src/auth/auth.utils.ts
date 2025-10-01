import type { Request as ExpressRequest, Response } from 'express';
import { refreshTokenConfig } from '../config/auth.config';

function parseExpiresInToMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 60 * 1000;

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

export const rtCookieOptions = {
  httpOnly: true,
  secure: false, // ยอมให้ส่ง cookie ผ่าน http
  // secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

export function extractDeviceInfo(req: ExpressRequest): string | undefined {
  return req.get('User-Agent');
}

export function extractIpAddress(req: ExpressRequest): string | undefined {
  return req.ip || req.connection.remoteAddress;
}

export function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
): void {
  res.cookie('rt', refreshToken, {
    ...rtCookieOptions,
    maxAge: refreshTokenConfig.cookie.maxAge,
  });
}

export function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie('at', accessToken, {
    ...rtCookieOptions,
    maxAge: parseExpiresInToMs(process.env.JWT_ACCESS_EXPIRES || '30m'),
  });
}
