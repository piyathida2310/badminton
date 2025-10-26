"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const args = process.argv.slice(2);
const schemaPath = path_1.default.resolve(__dirname, '..', 'prisma', 'schema.prisma');
const prismaCli = require.resolve('prisma/build/index.js');
const prismaArgs = [prismaCli, ...args, `--schema=${schemaPath}`];
console.log(`Using Prisma schema at: ${schemaPath}`);
const child = (0, child_process_1.spawn)(process.execPath, prismaArgs, {
    stdio: 'inherit',
});
child.on('close', (code) => {
    process.exit(code ?? 0);
});
//# sourceMappingURL=runPrisma.js.map