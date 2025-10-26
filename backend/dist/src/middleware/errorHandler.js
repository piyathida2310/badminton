"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const httpError_1 = require("../utils/httpError");
function errorHandler(err, _req, res, next) {
    if (res.headersSent) {
        next(err);
        return;
    }
    let status = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    if (err instanceof httpError_1.HttpError) {
        status = err.status ?? status;
        code = err.code ?? code;
        message = err.message ?? message;
    }
    else if (isJwtError(err, 'JsonWebTokenError')) {
        status = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid token';
    }
    else if (isJwtError(err, 'TokenExpiredError')) {
        status = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Token expired';
    }
    else if (isStatusError(err)) {
        status = err.status;
        message = err.message;
        code = err.code ?? code;
    }
    res.status(status).json({
        error: {
            code,
            message,
            status,
        },
    });
}
function isJwtError(error, name) {
    return Boolean(error) && typeof error === 'object' && 'name' in error && error.name === name;
}
function isStatusError(error) {
    return (Boolean(error) &&
        typeof error === 'object' &&
        'status' in error &&
        'message' in error &&
        typeof error.status === 'number' &&
        typeof error.message === 'string');
}
//# sourceMappingURL=errorHandler.js.map