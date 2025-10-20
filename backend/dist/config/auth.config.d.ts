export declare const authConfig: {
    refreshToken: {
        expiryDays: number;
        saltRounds: number;
        maxTokensPerUser: number;
        cookie: {
            maxAgeDays: number;
            readonly maxAge: number;
        };
    };
    jwt: {
        access: {
            secret: string;
            expiresIn: string;
        };
        refresh: {
            secret: string;
            expiresIn: string;
        };
        issuer: string;
        audience: string;
    };
    passwordReset: {
        expiresInMinutes: number;
        readonly expiresInMs: number;
        saltRounds: number;
    };
    app: {
        port: number;
        nodeEnv: string;
    };
};
export declare const refreshTokenConfig: {
    expiryDays: number;
    saltRounds: number;
    maxTokensPerUser: number;
    cookie: {
        maxAgeDays: number;
        readonly maxAge: number;
    };
};
export declare const jwtConfig: {
    access: {
        secret: string;
        expiresIn: string;
    };
    refresh: {
        secret: string;
        expiresIn: string;
    };
    issuer: string;
    audience: string;
};
export declare const passwordResetConfig: {
    expiresInMinutes: number;
    readonly expiresInMs: number;
    saltRounds: number;
};
export declare const appConfig: {
    port: number;
    nodeEnv: string;
};
