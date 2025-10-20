import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRegisterDto, ChangePasswordDto, LoginDto } from './dto';
type TokenResponse = {
    accessToken: string;
    expiresIn: number;
};
export declare class AuthService {
    private users;
    private prisma;
    constructor(users: UsersService, prisma: PrismaService);
    private signAccessToken;
    private parseExpiresIn;
    register(dto: AuthRegisterDto): Promise<TokenResponse>;
    login(dto: LoginDto): Promise<TokenResponse>;
    getUserProfile(userId: string): Promise<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
