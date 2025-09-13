export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  secondOrMoreNames?: string;
  firstLastName?: string;
  secondLastName?: string;
  marriedLastName?: string;
  telephone?: string;
  address?: string;
}
