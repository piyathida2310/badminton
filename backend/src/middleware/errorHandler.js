const { HttpError } = require('../utils/httpError');

// มิดเดิลแวร์จัดการข้อผิดพลาดกลาง ทำหน้าที่แปลง Error ให้เป็น response ที่อ่านง่าย
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';

  if (err instanceof HttpError) {
    status = err.status || status;
    code = err.code || code;
    message = err.message || message;
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  } else if (err.status && err.message) {
    status = err.status;
    message = err.message;
    code = err.code || code;
  }

  res.status(status).json({
    error: {
      code,
      message,
      status,
    },
  });
}

module.exports = errorHandler;
