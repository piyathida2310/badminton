export declare class PermissionDto {
    id: string;
    name: string;
    description: string | null;
}
export declare class RoleWithPermissionsDto {
    id: string;
    name: string;
    nameValue: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    permissions: PermissionDto[];
}
