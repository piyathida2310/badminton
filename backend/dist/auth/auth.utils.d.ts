import type { Request as ExpressRequest, Response } from 'express';
export declare const rtCookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    path: string;
    domain: string | undefined;
};
export declare function extractDeviceInfo(req: ExpressRequest): string | undefined;
export declare function extractIpAddress(req: ExpressRequest): string | undefined;
export declare function setRefreshTokenCookie(res: Response, refreshToken: string): void;
export declare function setAccessTokenCookie(res: Response, accessToken: string): void;
