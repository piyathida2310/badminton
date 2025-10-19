// ไฟล์นี้รวบรวมการตั้งค่าเกี่ยวกับระบบยืนยันตัวตนและแอปทั้งหมด
// จุดประสงค์คือให้โค้ดส่วนอื่นเรียกใช้ค่าคงที่เดียวกัน เพื่อลดความสับสน
const authConfig = {
  refreshToken: {
    expiryDays: 7,
    saltRounds: 12,
    maxTokensPerUser: 5,
    cookie: {
      maxAgeDays: 7,
      get maxAge() {
        return 7 * 24 * 3600 * 1000;
      },
    },
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'super-access-secret-32+',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '30m',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-32+',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    issuer: process.env.JWT_ISSUER || 'your-app-name',
    audience: process.env.JWT_AUDIENCE || 'your-app-users',
  },
  passwordReset: {
    expiresInMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRES || '15', 10),
    get expiresInMs() {
      return this.expiresInMinutes * 60 * 1000;
    },
    saltRounds: parseInt(process.env.PASSWORD_RESET_SALT_ROUNDS || '12', 10),
  },
  app: {
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// ส่งออกค่าเดียวกันในรูปแบบที่ใช้งานสะดวก
const { refreshToken: refreshTokenConfig } = authConfig;
const { jwt: jwtConfig } = authConfig;
const { passwordReset: passwordResetConfig } = authConfig;
const { app: appConfig } = authConfig;

module.exports = {
  authConfig,
  refreshTokenConfig,
  jwtConfig,
  passwordResetConfig,
  appConfig,
};
