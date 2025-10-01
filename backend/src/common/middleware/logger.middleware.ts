import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const method = req.method;
    const originalUrl = req.originalUrl;
    const body = req.body as Record<string, unknown> | undefined;
    const userAgent = req.get('User-Agent') || '';
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip =
      req.ip ||
      req.socket?.remoteAddress ||
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
      'unknown';
    this.logger.log(
      `📥 ${method} ${originalUrl} - IP: ${String(ip)} - User-Agent: ${userAgent}`,
    );

    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      if ('password' in sanitizedBody) {
        sanitizedBody.password = '[HIDDEN]';
      }
      this.logger.log(`📄 Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    const startTime = Date.now();
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const statusEmoji = statusCode >= 400 ? '❌' : '✅';

      this.logger.log(
        `${statusEmoji} ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`,
      );
    });
    next();
  }
}
