export interface User {
  userID: number;
  username: string;
  password: string;
  firstName: string;
  secondOrMoreNames?: string;
  firstLastName: string;
  secondLastName?: string;
  marriedName?: string;
  email: string;
  telephone?: string;
  address?: string;
  roleID: number;
  role?: Role;
}
