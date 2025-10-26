"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectPrisma = connectPrisma;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function connectPrisma() {
    await exports.prisma.$connect();
    return exports.prisma;
}
//# sourceMappingURL=prismaClient.js.map