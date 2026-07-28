export const UserRole = {
  Admin: 'Admin',
  Staff: 'Staff',
  Tenant: 'Tenant',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  userId: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
