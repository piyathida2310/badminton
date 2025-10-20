export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class BaseResponseDto {
    success: boolean;
    message?: string;
}
export declare class ErrorResponseDto extends BaseResponseDto {
    success: false;
    errorCode?: string;
    errors?: string[];
}
