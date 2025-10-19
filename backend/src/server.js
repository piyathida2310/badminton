const path = require('path');
const dotenv = require('dotenv');

// โหลดไฟล์ .env ก่อน require โมดูลที่ใช้ค่าเหล่านี้
dotenv.config({
  path: path.join(__dirname, '..', '.env'),
});

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
// ไฟล์หลักของแอป รับหน้าที่ประกอบมิดเดิลแวร์ เราท์ และเริ่มต้นเซิร์ฟเวอร์ Express
const authRoutes = require('./routes/authRoutes');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');
const { connectPrisma } = require('./services/prismaClient');
const { swaggerSpec } = require('./config/swaggerConfig');
const { appConfig } = require('./config/authConfig');

async function bootstrap() {
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

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  await connectPrisma();
  app.listen(appConfig.port, () => {
    console.log(`🚀 Server is running on port ${appConfig.port}`);
    console.log(`📄 Swagger is available at /api-docs`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
