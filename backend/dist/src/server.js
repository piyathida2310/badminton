"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const loggerMiddleware_1 = __importDefault(require("./middleware/loggerMiddleware"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const prismaClient_1 = require("./services/prismaClient");
const swaggerConfig_1 = require("./config/swaggerConfig");
const authConfig_1 = require("./config/authConfig");
dotenv_1.default.config({
    path: path_1.default.join(__dirname, '..', '.env'),
});
async function bootstrap() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: [/^http:\/\/localhost:\d+$/, 'http://127.0.0.1'],
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(loggerMiddleware_1.default);
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    app.use('/auth', authRoutes_1.default);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.swaggerSpec));
    app.use(errorHandler_1.default);
    await (0, prismaClient_1.connectPrisma)();
    app.listen(authConfig_1.appConfig.port, () => {
        console.log(`🚀 Server is running on port ${authConfig_1.appConfig.port}`);
        console.log('📄 Swagger is available at /api-docs');
    });
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map