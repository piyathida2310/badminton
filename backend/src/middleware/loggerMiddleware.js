// มิดเดิลแวร์นี้ใช้บันทึกข้อมูลคำร้อง HTTP เพื่อช่วยดีบักและสอนนักเรียนว่าเกิดอะไรขึ้นในระบบ
function loggerMiddleware(req, res, next) {
  const method = req.method;
  const originalUrl = req.originalUrl;
  const body = req.body && typeof req.body === 'object' ? { ...req.body } : null;
  const userAgent = req.get('User-Agent') || '';
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip =
    req.ip ||
    req.socket?.remoteAddress ||
    (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
    'unknown';

  console.log(`📥 ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`);

  if (body && Object.keys(body).length > 0) {
    if (body.password) {
      body.password = '[HIDDEN]';
    }
    if (body.confirmPassword) {
      body.confirmPassword = '[HIDDEN]';
    }
    if (body.oldPassword) {
      body.oldPassword = '[HIDDEN]';
    }
    if (body.newPassword) {
      body.newPassword = '[HIDDEN]';
    }
    console.log(`📄 Request Body: ${JSON.stringify(body)}`);
  }

  const startTime = Date.now();
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const responseTime = Date.now() - startTime;
    const statusEmoji = statusCode >= 400 ? '❌' : '✅';
    console.log(
      `${statusEmoji} ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`,
    );
  });

  next();
}

module.exports = loggerMiddleware;
