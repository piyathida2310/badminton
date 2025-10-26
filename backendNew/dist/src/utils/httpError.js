"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(status, message, code = 'ERROR') {
        super(message);
        this.status = status;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=httpError.js.map