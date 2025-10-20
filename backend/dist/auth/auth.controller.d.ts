import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthRegisterDto } from './dto/auth-registor.dto';
import type { AuthenticatedRequest } from './auth.types';
interface TokenResponse {
    accessToken: string;
    expiresIn: number;
}
interface UserProfile {
    id: number;
    userName: string | null;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: Date;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: AuthRegisterDto): Promise<TokenResponse>;
    login(dto: LoginDto): Promise<TokenResponse>;
    changePassword(dto: ChangePasswordDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    me(req: AuthenticatedRequest): Promise<UserProfile>;
}
export {};
