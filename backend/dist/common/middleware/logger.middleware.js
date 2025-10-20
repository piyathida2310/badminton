"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let LoggerMiddleware = class LoggerMiddleware {
    logger = new common_1.Logger('HTTP');
    use(req, res, next) {
        const method = req.method;
        const originalUrl = req.originalUrl;
        const body = req.body;
        const userAgent = req.get('User-Agent') || '';
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = req.ip ||
            req.socket?.remoteAddress ||
            (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
            'unknown';
        this.logger.log(`📥 ${method} ${originalUrl} - IP: ${String(ip)} - User-Agent: ${userAgent}`);
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
            this.logger.log(`${statusEmoji} ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`);
        });
        next();
    }
};
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
//# sourceMappingURL=logger.middleware.js.map