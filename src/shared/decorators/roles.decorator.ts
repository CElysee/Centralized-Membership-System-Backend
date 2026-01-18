import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of role names required to access the route
 * @example
 * @Roles('admin', 'manager')
 * @Get('users')
 * getUsers() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);


