const path = require('path');
const { spawn } = require('child_process');

// สคริปต์เล็ก ๆ นี้ใช้รันคำสั่ง Prisma โดยบังคับให้ใช้ schema ในโฟลเดอร์ prisma เสมอ
const args = process.argv.slice(2);
const schemaPath = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
const prismaCli = require.resolve('prisma/build/index.js');
const prismaArgs = [prismaCli, ...args, `--schema=${schemaPath}`];

console.log(`Using Prisma schema at: ${schemaPath}`);

const child = spawn(process.execPath, prismaArgs, {
  stdio: 'inherit',
});

child.on('close', (code) => {
  process.exit(code);
});
