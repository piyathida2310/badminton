"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Badminton Auth API',
        version: '1.0.0',
        description: 'เอกสารประกอบ API หลังจากรีแฟคเตอร์จาก NestJS เป็น Express.js โดยยังใช้ Prisma เหมือนเดิม',
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
const swaggerOptions = {
    swaggerDefinition,
    apis: [
        path_1.default.join(__dirname, '../routes/*.ts'),
        path_1.default.join(__dirname, '../controllers/*.ts'),
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
//# sourceMappingURL=swaggerConfig.js.map