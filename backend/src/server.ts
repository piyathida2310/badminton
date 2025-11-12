import path from 'path';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import loggerMiddleware from './middleware/loggerMiddleware';
import errorHandler from './middleware/errorHandler';
import { connectPrisma } from './services/prismaClient';
import { swaggerSpec } from './config/swaggerConfig';
import { appConfig } from './config/authConfig';
import { checkBucket } from './config/minioManage';
import rulesRouter from './routes/rulesRoutes'
import tournamentRouter from './routes/tournamentRoutes'

dotenv.config({
  path: path.join(__dirname, '..', '.env'),
});
 checkBucket();
async function bootstrap(): Promise<void> {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: [/^http:\/\/localhost:\d+$/, 'http://127.0.0.1'],
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(loggerMiddleware);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);
  app.use('/api', rulesRouter);
  app.use('/api', tournamentRouter);



  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  await connectPrisma();
  app.listen(appConfig.port, () => {
    console.log(`🚀 Server is running on port ${appConfig.port}`);
    console.log('📄 Swagger is available at /api-docs');
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
