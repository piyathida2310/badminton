export declare class ErrorResponse {
    error: {
        code: string;
        message: string;
        status: number;
    };
}
export declare class TokenResponseDto {
    success: boolean;
    message: string;
    expiresIn: number;
}
export declare class VerifyTokenResponseDto {
    success: boolean;
    message?: string;
    userId?: string;
}
export declare class VerifyEmailResponseDto {
    success: boolean;
    message: string;
    userId?: string;
}
export declare class LogoutResponseDto {
    success: boolean;
    message: string;
}
export declare class PingResponseDto {
    success: boolean;
    message?: string;
    refreshToken?: string;
}
export declare class UserProfileResponseDto {
    id: string;
    departmentId?: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    prefix?: string | null;
    name: string;
    phone?: string | null;
    description?: string | null;
    isActive: boolean;
    isVerified: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
    departments?: string[];
    departmentName?: string;
    position?: {
        id: string;
        name: string;
        description?: string;
    } | null;
    organization?: {
        id: string;
        name: string;
        logoUrl?: string;
        address: string;
    } | null;
    unreadNotificationCount: number;
    unreadNotifications?: {
        id: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        createdAt: string;
        task?: any;
    }[];
}
