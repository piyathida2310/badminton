import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtConfig } from '../config/authConfig';
import { prisma } from '../services/prismaClient';
import { HttpError } from '../utils/httpError';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/express';

export default async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const request = req as AuthenticatedRequest;
    const authHeader = request.headers.authorization ?? '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new HttpError(401, 'Access token not found', 'TOKEN_NOT_FOUND');
    }

    const decoded = jwt.verify(token, jwtConfig.access.secret) as JwtPayload | string;
    if (!decoded || typeof decoded === 'string') {
      throw new HttpError(401, 'Invalid token', 'INVALID_TOKEN');
    }

    const userId = Number(decoded.sub);
    if (!userId) {
      throw new HttpError(401, 'Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      throw new HttpError(401, 'User not found', 'USER_NOT_FOUND');
    }

    const userPayload: AuthenticatedUser = {
      sub: String(user.id),
      username: user.userName ?? undefined,
      role: user.role,
      email: user.email,
    };

    request.user = userPayload;

    next();
  } catch (error) {
    next(error);
  }
}
