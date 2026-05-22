import path from 'path';
import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Badminton Auth API',
    version: '1.0.0',
    description:
      'เอกสารประกอบ API หลังจากรีแฟคเตอร์จาก NestJS เป็น Express.js โดยยังใช้ Prisma เหมือนเดิม',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8000}`,
      description: 'เซิร์ฟเวอร์ทดสอบภายในเครื่อง',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const swaggerOptions: Options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/*.{ts,js}'),
    path.join(__dirname, '../controllers/*.{ts,js}'),
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
