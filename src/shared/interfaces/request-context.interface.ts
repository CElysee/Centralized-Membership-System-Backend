/**
 * Extended request interface with custom properties
 */
export interface RequestContext {
  correlationId: string;
  user?: AuthenticatedUser;
  token?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Authenticated user payload from JWT
 */
export interface AuthenticatedUser {
  sub: string;           // User ID
  email?: string;
  phoneNumber?: string;
  roles?: string[];
  permissions?: string[];
  iat?: number;          // Issued at
  exp?: number;          // Expiration
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}


