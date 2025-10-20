export declare class CreateUserDto {
    email: string;
    password: string;
    roleIds?: string[];
    prefix?: string;
}
export declare class UpdateUserDto {
    email?: string;
}
export declare class NewpassWordDto {
    email: string;
    currentPassword: string;
    newPassword: string;
}
export declare class ResponeNewpassWordDto {
    status: number;
    message: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    roles: Array<{
        role: {
            id: string;
            name: string;
            description: string;
        };
    }>;
}
export declare class UserProfileDto {
    sub: string;
    email: string;
}
