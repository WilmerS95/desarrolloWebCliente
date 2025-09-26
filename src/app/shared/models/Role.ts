import { AppRolePermission } from './AppRolePermission';

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  permissions?: AppRolePermission[];
}
