export interface RoleRequest {
  roleName: string;
  description?: string;
  permissionIds: number[];
}
