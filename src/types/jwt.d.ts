export interface JwtPayload {
  id: string;
  email: string;
  role: 'MANAGER' | 'CLIENT';
  managerId?: number;
  clientId?: number;
}
