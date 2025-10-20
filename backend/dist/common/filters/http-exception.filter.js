"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        let errorCode = 'UNKNOWN_ERROR';
        let errorMessage = 'An unknown error occurred';
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const responseObj = exceptionResponse;
            if (responseObj.message && Array.isArray(responseObj.message)) {
                errorMessage = responseObj.message[0];
                errorCode = 'VALIDATION_ERROR';
            }
            else if (responseObj.message &&
                typeof responseObj.message === 'string') {
                errorMessage = responseObj.message;
            }
        }
        else if (typeof exceptionResponse === 'string') {
            errorMessage = exceptionResponse;
        }
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                if (errorCode === 'UNKNOWN_ERROR') {
                    errorCode = 'BAD_REQUEST';
                }
                break;
            case common_1.HttpStatus.UNAUTHORIZED:
                errorCode = 'UNAUTHORIZED';
                if (errorMessage === 'An unknown error occurred') {
                    errorMessage = 'Authentication required';
                }
                break;
            case common_1.HttpStatus.FORBIDDEN:
                errorCode = 'FORBIDDEN';
                if (errorMessage === 'An unknown error occurred') {
                    errorMessage = 'Access denied';
                }
                break;
            case common_1.HttpStatus.NOT_FOUND:
                errorCode = 'NOT_FOUND';
                if (errorMessage === 'An unknown error occurred') {
                    errorMessage = 'Resource not found';
                }
                break;
            case common_1.HttpStatus.CONFLICT:
                errorCode = 'CONFLICT';
                break;
            case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
                errorCode = 'INTERNAL_SERVER_ERROR';
                if (errorMessage === 'An unknown error occurred') {
                    errorMessage = 'Internal server error';
                }
                break;
        }
        response.status(status).json({
            error: {
                code: errorCode,
                message: errorMessage,
                status: status,
            },
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map