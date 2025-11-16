import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  let status = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';

  if (err instanceof HttpError) {
    status = err.status ?? status;
    code = err.code ?? code;
    message = err.message ?? message;
  } else if (isJwtError(err, 'JsonWebTokenError')) {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (isJwtError(err, 'TokenExpiredError')) {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  } else if (isStatusError(err)) {
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

type JwtErrorName = 'JsonWebTokenError' | 'TokenExpiredError';

function isJwtError(error: unknown, name: JwtErrorName): error is { name: JwtErrorName } {
  return Boolean(error) && typeof error === 'object' && 'name' in error && (error as { name: string }).name === name;
}

function isStatusError(error: unknown): error is { status: number; message: string; code?: string } {
  return (
    Boolean(error) &&
    typeof error === 'object' &&
    'status' in error &&
    'message' in error &&
    typeof (error as { status: unknown }).status === 'number' &&
    typeof (error as { message: unknown }).message === 'string'
  );
}
