import type ms from 'ms';

export interface RefreshTokenConfig {
  expiryDays: number;
  saltRounds: number;
  maxTokensPerUser: number;
  cookie: {
    maxAgeDays: number;
    readonly maxAge: number;
  };
}

export interface JwtTokenConfig {
  secret: string;
  expiresIn: ms.StringValue | number;
}

export interface JwtConfig {
  access: JwtTokenConfig;
  refresh: JwtTokenConfig;
  issuer: string;
  audience: string;
}

export interface PasswordResetConfig {
  expiresInMinutes: number;
  readonly expiresInMs: number;
  saltRounds: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface AuthConfig {
  refreshToken: RefreshTokenConfig;
  jwt: JwtConfig;
  passwordReset: PasswordResetConfig;
  app: AppConfig;
}

const defaultAccessExpires: ms.StringValue = '7d';
const defaultRefreshExpires: ms.StringValue = '7d';

export const authConfig: AuthConfig = {
  refreshToken: {
    expiryDays: 7,
    saltRounds: 12,
    maxTokensPerUser: 5,
    cookie: {
      maxAgeDays: 7,
      get maxAge(): number {
        return 7 * 24 * 3600 * 1000;
      },
    },
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'super-access-secret-32+',
      expiresIn: (process.env.JWT_ACCESS_EXPIRES as ms.StringValue | undefined) || defaultAccessExpires,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-32+',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES as ms.StringValue | undefined) || defaultRefreshExpires,
    },
    issuer: process.env.JWT_ISSUER || 'your-app-name',
    audience: process.env.JWT_AUDIENCE || 'your-app-users',
  },
  passwordReset: {
    expiresInMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRES || '15', 10),
    get expiresInMs(): number {
      return this.expiresInMinutes * 60 * 1000;
    },
    saltRounds: parseInt(process.env.PASSWORD_RESET_SALT_ROUNDS || '12', 10),
  },
  app: {
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

export const refreshTokenConfig = authConfig.refreshToken;
export const jwtConfig = authConfig.jwt;
export const passwordResetConfig = authConfig.passwordReset;
export const appConfig = authConfig.app;