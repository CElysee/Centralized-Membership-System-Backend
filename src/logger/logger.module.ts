import { Global, Module } from '@nestjs/common';

/**
 * Global Logger Module
 * 
 * Note: LoggerService is manually instantiated in each service/module
 * with a specific context:
 * 
 * @example
 * // In your service
 * private readonly logger = new LoggerService('AuthService');
 * 
 * // Then use it
 * this.logger.info('User logged in', { userId: '123' });
 * this.logger.error('Login failed', error.stack);
 * this.logger.audit('USER_LOGIN', { userId: '123' });
 */
@Global()
@Module({
  // LoggerService is not registered as a provider
  // It's manually instantiated with context in each service
})
export default class LoggerModule {}
