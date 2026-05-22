import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to configure headers (relaxing CSP) and enforce Basic Authentication
 * specifically for Swagger / OpenAPI UI routes on production.
 */
export default function swaggerAuth(req: Request, res: Response, next: NextFunction): void {
  // 1. Relax Content-Security-Policy (CSP) headers specifically for Swagger UI
  // This allows inline styles and scripts required by swagger-ui-express to render properly.
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *"
  );

  // 2. Enforce HTTP Basic Authentication on Production
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Badminton Swagger API Docs"');
      res.status(401).send('Authentication required');
      return;
    }

    const [scheme, credentials] = authHeader.split(' ');
    if (scheme.toLowerCase() !== 'basic' || !credentials) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Badminton Swagger API Docs"');
      res.status(401).send('Authentication required');
      return;
    }

    const decoded = Buffer.from(credentials, 'base64').toString('utf8');
    const [user, pass] = decoded.split(':');

    // Default username and password. You can change these values here or via env variables.
    const expectedUser = process.env.SWAGGER_USER || 'faicream';
    const expectedPass = process.env.SWAGGER_PASSWORD || 'faicream2313';

    if (user === expectedUser && pass === expectedPass) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Badminton Swagger API Docs"');
      res.status(401).send('Authentication required');
    }
    return;
  }

  next();
}
