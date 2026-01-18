import { Injectable, CanActivate, ExecutionContext, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { EncryptionService } from 'src/utils/encryption.service';

@Injectable()
/**
 * A guard that checks if the request has a valid JWT token.
 * If the token is valid, the user data is decrypted and added to the request.
 */
export class JwtAuthGuard implements CanActivate {
  /**
   * Creates an instance of JwtAuthGuard.
   * @param {JwtService} jwtService - The JWT service to verify the token.
   */
  constructor(private readonly jwtService: JwtService) { }

  /**
   * Checks if the request has a valid JWT token.
   * If the token is valid, decrypts the user data and adds it to the request.
   * @param {ExecutionContext} context - The context of the request.
   * @returns {boolean | Promise<boolean> | Observable<boolean>}
   * Returns true if the request has a valid token, false otherwise.
   * @throws {Unauthorized Exception} Throws an exception if the Authorization header is missing or the token is invalid.
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requestContext = context.switchToHttp().getRequest();

    requestContext.user = null;

    const authHeader = requestContext.headers.authorization || requestContext.headers.Authorization;

    if (!authHeader) {


      throw new UnauthorizedException("Access Token is required");
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = this.jwtService.verify(token);

      let userData = null;
      if (decoded.user) {
        try {
          userData = EncryptionService.decrypt(decoded.user);
        } catch (error) {
          throw new UnauthorizedException('Invalid token payload');
        }
      } else {
        userData = decoded;
      }

      requestContext.user = userData;
      requestContext.token = token;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}

