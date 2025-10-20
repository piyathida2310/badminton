import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(email: string, firstName: string, lastName: string, passwordHash: string, role?: Role, userName?: string): Promise<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        password: string;
        age: number | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        rank: number | null;
        playType: import("@prisma/client").$Enums.PlayType | null;
    }>;
    findByUsername(userName: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findByEmail(email: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(userId: number, data: any): Promise<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        password: string;
        age: number | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        rank: number | null;
        playType: import("@prisma/client").$Enums.PlayType | null;
    }>;
    findById(userId: number): Promise<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    } | null>;
    findAll(): Promise<{
        id: number;
        email: string;
        userName: string | null;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    }[]>;
}
