import { NextFunction, Request, Response } from 'express';

const SENSITIVE_FIELDS = new Set(['password', 'confirmPassword', 'oldPassword', 'newPassword']);

export default function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { method, originalUrl } = req;
  const requestBody = req.body && typeof req.body === 'object' ? { ...req.body } : null;
  const userAgent = req.get('User-Agent') ?? '';
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip =
    req.ip ||
    req.socket?.remoteAddress ||
    (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
    'unknown';

  console.log(`📥 ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`);

  if (requestBody && Object.keys(requestBody).length > 0) {
    for (const field of Object.keys(requestBody)) {
      if (SENSITIVE_FIELDS.has(field)) {
        requestBody[field] = '[HIDDEN]';
      }
    }
    console.log(`📄 Request Body: ${JSON.stringify(requestBody)}`);
  }

  const startTime = Date.now();
  res.on('finish', () => {
    const { statusCode } = res;
    const responseTime = Date.now() - startTime;
    const statusEmoji = statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`);
  });

  next();
}
