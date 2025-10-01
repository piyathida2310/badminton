import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = 'An unknown error occurred';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      if (responseObj.message && Array.isArray(responseObj.message)) {
        errorMessage = responseObj.message[0];
        errorCode = 'VALIDATION_ERROR';
      } else if (
        responseObj.message &&
        typeof responseObj.message === 'string'
      ) {
        errorMessage = responseObj.message;
      }
    } else if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        if (errorCode === 'UNKNOWN_ERROR') {
          errorCode = 'BAD_REQUEST';
        }
        break;
      case HttpStatus.UNAUTHORIZED:
        errorCode = 'UNAUTHORIZED';
        if (errorMessage === 'An unknown error occurred') {
          errorMessage = 'Authentication required';
        }
        break;
      case HttpStatus.FORBIDDEN:
        errorCode = 'FORBIDDEN';
        if (errorMessage === 'An unknown error occurred') {
          errorMessage = 'Access denied';
        }
        break;
      case HttpStatus.NOT_FOUND:
        errorCode = 'NOT_FOUND';
        if (errorMessage === 'An unknown error occurred') {
          errorMessage = 'Resource not found';
        }
        break;
      case HttpStatus.CONFLICT:
        errorCode = 'CONFLICT';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
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
}
