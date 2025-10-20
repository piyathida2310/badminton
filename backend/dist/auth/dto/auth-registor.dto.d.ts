export declare enum Role {
    ORGANIZER = "ORGANIZER",
    PLAYER = "PLAYER"
}
export declare class AuthRegisterDto {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    username?: string;
    role: Role;
}
