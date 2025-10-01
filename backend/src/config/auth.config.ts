export const authConfig = {
  refreshToken: {
    // จำนวนวันที่ refresh token จะหมดอายุ
    expiryDays: 7,
    // จำนวน salt rounds สำหรับ bcrypt hashing
    saltRounds: 12,
    // จำนวน token สูงสุดต่อ user (สามารถเพิ่มได้ในอนาคต)
    maxTokensPerUser: 5,
    // การตั้งค่า cookie
    cookie: {
      // จำนวนวันที่ cookie จะหมดอายุ
      maxAgeDays: 7,
      // คำนวณ maxAge ในหน่วย milliseconds
      get maxAge(): number {
        return 7 * 24 * 3600 * 1000;
      },
    },
  },
  // การตั้งค่า JWT
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'super-access-secret-32+',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '30m',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-32+',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    // การตั้งค่าเพิ่มเติม
    issuer: process.env.JWT_ISSUER || 'your-app-name',
    audience: process.env.JWT_AUDIENCE || 'your-app-users',
  },

  // การตั้งค่า Password Reset
  passwordReset: {
    // เวลาหมดอายุของ reset token (นาที)
    expiresInMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRES || '15', 10),
    // คำนวณเป็น milliseconds
    get expiresInMs(): number {
      return this.expiresInMinutes * 60 * 1000;
    },
    // จำนวน salt rounds สำหรับ bcrypt hashing
    saltRounds: parseInt(process.env.PASSWORD_RESET_SALT_ROUNDS || '12', 10),
  },

  // การตั้งค่าแอป
  app: {
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Export แยกสำหรับการใช้งานที่สะดวก
export const { refreshToken: refreshTokenConfig } = authConfig;
export const { jwt: jwtConfig } = authConfig;
export const { passwordReset: passwordResetConfig } = authConfig;
export const { app: appConfig } = authConfig;
