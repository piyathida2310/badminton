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
import  { rateLimit } from 'express-rate-limit';
import rulesRouter from './routes/rulesRoutes'
import tournamentRouter from './routes/tournamentRoutes'
import competitionRouter from './routes/competitionRoutes'
import userRouter from './routes/userRoutes'
import registerRouter from './routes/registerRoutes'
import matchRouter from './routes/matchRoutes'
import summaryRouter from './routes/summaryRoutes'
import { updateManualGroups } from './controllers/tournamentController';
import { ensureOpenAIConnection } from './config/openAI';
import authMiddleware from './middleware/authMiddleware';

dotenv.config({
  path: path.join(__dirname, '..', '.env'),
});

async function bootstrap(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1); // 1 คือจำนวนชั้นของ Proxy (Traefik + Nginx)
  const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 นาที
  max: 1200, // จำกัด 100 ครั้งต่อ IP
  message: "Too many requests, please try again later.",
});

app.use(limiter);

  app.use(helmet());
  app.use(
    cors({
      origin: [/^http:\/\/localhost:\d+$/, 'http://127.0.0.1', 'https://judjang.online'],
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
  app.use('/rules', rulesRouter);
  app.use('/tournament', tournamentRouter);
  app.put('/manual-update-groups/:id', authMiddleware, updateManualGroups);
  app.use('/compet', competitionRouter);
  app.use('/users', userRouter);
  app.use('/', registerRouter);
  app.use('/', matchRouter);
  app.use('/', summaryRouter);



  app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
