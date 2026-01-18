export interface IJWTPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}
