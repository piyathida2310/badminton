import path from 'path';
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const schemaPath = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
const prismaCli = require.resolve('prisma/build/index.js');
const prismaArgs = [prismaCli, ...args, `--schema=${schemaPath}`];

console.log(`Using Prisma schema at: ${schemaPath}`);

const child = spawn(process.execPath, prismaArgs, {
  stdio: 'inherit',
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
