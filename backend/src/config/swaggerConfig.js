const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

// ไฟล์นี้สร้างสเปค Swagger เพื่อใช้คู่กับ swagger-ui-express
// เรากำหนด meta-data, security scheme และตำแหน่งไฟล์ที่มี JSDoc comment
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
      url: 'http://localhost:' + (process.env.PORT || 8000),
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

const swaggerOptions = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = {
  swaggerSpec,
};
