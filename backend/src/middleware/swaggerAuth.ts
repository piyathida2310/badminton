import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/authConfig';

const EXPECTED_USER = process.env.SWAGGER_USER || 'admin';
const EXPECTED_PASS = process.env.SWAGGER_PASSWORD || 'judjang_secure_swagger_2026';
const JWT_SECRET = jwtConfig.access.secret || 'swagger-fallback-secret-2026';

/**
 * Generates a premium, formal, and beautiful HTML Login UI for Judjang API Docs.
 */
function getLoginHtml(errorMessage?: string): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>เข้าสู่ระบบ API Docs | Judjang.online</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      --card-bg: rgba(30, 41, 59, 0.7);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Outfit', -apple-system, sans-serif;
    }
    
    body {
      background: var(--bg-gradient);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: var(--text-main);
      overflow-x: hidden;
    }
    
    .login-container {
      width: 100%;
      max-width: 440px;
      position: relative;
    }
    
    .login-container::before {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(0,0,0,0) 70%);
      top: -150px;
      left: -150px;
      z-index: -1;
    }
    
    .login-container::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%);
      bottom: -150px;
      right: -150px;
      z-index: -1;
    }
    
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .logo-area {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(37, 99, 235, 0.1);
      border: 1.5px solid rgba(37, 99, 235, 0.3);
      color: #3b82f6;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 6px 16px;
      border-radius: 30px;
      margin-bottom: 16px;
    }
    
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(120deg, #ffffff 40%, #93c5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      color: var(--text-muted);
      font-size: 13.5px;
      line-height: 1.5;
    }
    
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }
    
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #cbd5e1;
      margin-bottom: 8px;
      letter-spacing: 0.2px;
    }
    
    input {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 15px;
      color: #ffffff;
      transition: all 0.25s ease;
      outline: none;
    }
    
    input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
      background: rgba(15, 23, 42, 0.8);
    }
    
    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #f87171;
      font-size: 13.5px;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      text-align: center;
      animation: shake 0.4s linear;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    
    button {
      width: 100%;
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 14px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 10px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    
    button:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    .footer-text {
      text-align: center;
      margin-top: 32px;
      font-size: 12px;
      color: rgba(148, 163, 184, 0.4);
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="card">
      <div class="logo-area">
        <div class="logo-badge">Judjang API Portal</div>
        <h1>เข้าสู่ระบบ API Docs</h1>
        <p class="subtitle">กรุณากรอกรหัสผ่านเพื่อเข้าใช้งานระบบเอกสารประกอบการพัฒนา</p>
      </div>
      
      ${errorMessage ? `<div class="error-msg">${errorMessage}</div>` : ''}
      
      <form method="POST">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" placeholder="ระบุ Username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="ระบุ Password" required autocomplete="current-password">
        </div>
        <button type="submit">ยืนยันและเข้าสู่ระบบ</button>
      </form>
      
      <div class="footer-text">
        © 2026 Judjang.online. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Middleware to secure Swagger paths with a premium login page.
 */
export default function swaggerAuth(req: Request, res: Response, next: NextFunction): void {
  // Relax CSP specifically for Swagger UI
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *"
  );

  // Extract path and strip trailing slashes for comparison consistency
  const originalPath = req.originalUrl.split('?')[0].replace(/\/$/, '');

  // Determine base paths
  let basePath = '/api-docs';
  if (originalPath.startsWith('/api/api-docs')) {
    basePath = '/api/api-docs';
  }
  const loginPath = `${basePath}/login`;

  // If not on production, redirect login to main docs or bypass authentication entirely
  if (process.env.NODE_ENV !== 'production') {
    if (originalPath === loginPath) {
      res.redirect(`${basePath}/`);
      return;
    }
    return next();
  }

  // 1. Handle GET login page
  if (req.method === 'GET' && originalPath === loginPath) {
    res.status(200).send(getLoginHtml());
    return;
  }

  // 2. Handle POST login credentials
  if (req.method === 'POST' && originalPath === loginPath) {
    const { username, password } = req.body;
    if (username === EXPECTED_USER && password === EXPECTED_PASS) {
      // Create session JWT token valid for 24h
      const token = jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '24h' });

      // Determine secure cookie flag (true on HTTPS or non-localhost environments)
      const isSecure = req.protocol === 'https' || !req.headers.host?.includes('localhost');

      // Set cookie
      res.cookie('swagger_session', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect back to Swagger docs main landing page
      res.redirect(`${basePath}/`);
      return;
    } else {
      res.status(401).send(getLoginHtml('Username หรือ Password ไม่ถูกต้อง'));
      return;
    }
  }

  // 3. Verify session cookie for accessing other Swagger paths
  const sessionToken = req.cookies?.swagger_session;
  if (!sessionToken) {
    res.redirect(loginPath);
    return;
  }

  try {
    jwt.verify(sessionToken, JWT_SECRET);
    next();
  } catch (error) {
    // If token is invalid or expired, clear the cookie and redirect to login
    res.clearCookie('swagger_session');
    res.redirect(loginPath);
    return;
  }
}
