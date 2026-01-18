import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import ResponseCommon from 'src/common/response.common';
import { Public, CurrentUser } from 'src/shared/decorators';
import { AuthenticatedUser } from 'src/shared/interfaces';

import AuthService from './auth.service';
import { SignupDto } from './dto/signup.dto';
import LoginDto from './dto/login.dto';
import AuthResponseDto from './dto/auth-response.dto';
import {
  MemberRegistrationDto,
  MemberRegistrationResponseDto,
} from './dto/member-registration.dto';
import {
  VerifyOtpDto,
  VerifyOtpResponseDto,
  ResendOtpDto,
  ResendOtpResponseDto,
} from './dto/verify-otp.dto';
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
} from './dto/forgot-password.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import { CreateUserDto } from './dto/simple-signup.dto';
import { AssociationManagerCreationDto } from './dto/association-manager-creation.dto';
import {
  VerifyEmailDto,
  VerifyEmailResponseDto,
  ResendVerificationEmailDto,
  ResendVerificationEmailResponseDto,
} from './dto/verify-email.dto';
import { Roles } from 'src/shared/decorators/roles.decorator';

@ApiTags('Authentication')
@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== REGISTRATION ====================

  @Public()
  @Post('users/create')
  @ApiOperation({
    summary: 'Create basic user with USER role',
    description: 'Creates a basic user account with USER role. Sends OTP for verification.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed or missing required fields' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async simpleSignup(@Body() dto: CreateUserDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.createUser(dto);
    return ResponseCommon.handleSuccess(
      HttpStatus.CREATED,
      'User registered successfully. Please verify your account with the OTP sent.',
      res,
      result,
    );
  }

  @Public()
  @Post('on-board/member')
  @ApiOperation({
    summary: 'Onboard member with documents',
    description: `Complete member onboarding:
    1. Creates user account
    2. Assigns MEMBER role
    3. Saves uploaded documents
    4. Creates membership application
    5. Sends OTP for verification
    6. Notifies managers and admins`,
  })
  @ApiBody({ type: MemberRegistrationDto })
  @ApiResponse({ status: 201, description: 'Member registered successfully', type: MemberRegistrationResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerMember(
    @Body() registerDto: MemberRegistrationDto,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.registerMember(registerDto);
    return ResponseCommon.handleSuccess(HttpStatus.CREATED, result.message, res, result);
  }

  @Post('create-manager')
  @Roles('SYSTEM_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create association manager (System Admin only)',
    description: `Creates a new association manager:
    1. Creates user account
    2. Assigns ASSOCIATION_MANAGER role
    3. Links to specified association
    4. Account is active immediately
    5. Sends welcome email`,
  })
  @ApiBody({ type: AssociationManagerCreationDto })
  @ApiResponse({ status: 201, description: 'Association manager created successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - System Admin only' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createAssociationManager(
    @Body() dto: AssociationManagerCreationDto,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.authService.createAssociationManager(dto);
    return ResponseCommon.handleSuccess(
      HttpStatus.CREATED,
      'Association manager created successfully.',
      res,
      result,
    );
  }

  @Public()
  @Post('signup')
  @ApiOperation({
    summary: 'Basic user registration (deprecated)',
    description: 'Use /signup/simple instead. This endpoint may be removed in future versions.',
    deprecated: true,
  })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signup(@Body() signupDto: SignupDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.signup(signupDto);
    return ResponseCommon.handleSuccess(
      HttpStatus.CREATED,
      'User registered. Please verify your email with the OTP sent.',
      res,
      result,
    );
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Member registration (deprecated)',
    description: 'Use /signup/member instead. This endpoint may be removed in future versions.',
    deprecated: true,
  })
  @ApiBody({ type: MemberRegistrationDto })
  @ApiResponse({ status: 201, description: 'Member registered successfully', type: MemberRegistrationResponseDto })
  async registerMemberDeprecated(
    @Body() registerDto: MemberRegistrationDto,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.registerMember(registerDto);
    return ResponseCommon.handleSuccess(HttpStatus.CREATED, result.message, res, result);
  }

  // ==================== OTP VERIFICATION ====================

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP code',
    description: 'OTP verification endpoint. Supports: 1) Registration OTP (provide email/phone), 2) 2FA Login OTP (provide sessionId from login response)',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully', type: VerifyOtpResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid session or OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.verifyOtp(dto);
    return ResponseCommon.handleSuccess(HttpStatus.OK, result.message, res, result);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP code',
    description: 'Request a new OTP code. Rate limited to 1 request per minute.',
  })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully', type: ResendOtpResponseDto })
  @ApiResponse({ status: 400, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendOtp(@Body() dto: ResendOtpDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.resendOtp(dto);
    return ResponseCommon.handleSuccess(HttpStatus.OK, result.message, res, result);
  }

  // ==================== EMAIL VERIFICATION ====================

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify email using the token sent to the user\'s email. Link expires in 24 hours.',
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully', type: VerifyEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.verifyEmail(dto);
    return ResponseCommon.handleSuccess(HttpStatus.OK, result.message, res, result);
  }

  @Public()
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Request a new email verification link. Rate limited to 1 request per minute.',
  })
  @ApiBody({ type: ResendVerificationEmailDto })
  @ApiResponse({ status: 200, description: 'Verification email sent', type: ResendVerificationEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Email already verified or rate limit exceeded' })
  async resendVerificationEmail(
    @Body() dto: ResendVerificationEmailDto,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.authService.resendVerificationEmail(dto);
    return ResponseCommon.handleSuccess(HttpStatus.OK, result.message, res, result);
  }

  // ==================== LOGIN ====================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate with email or phone number and password. If 2FA is enabled, returns requires2FA=true with sessionId.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful (or 2FA required)', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or verification required' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.login(loginDto);
    
    // Check if 2FA is required
    if (result.requires2FA) {
      return ResponseCommon.handleSuccess(
        HttpStatus.OK, 
        '2FA verification required', 
        res, 
        result
      );
    }
    
    return ResponseCommon.handleSuccess(HttpStatus.OK, 'Login successful', res, result);
  }

  // ==================== PASSWORD RESET ====================

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send a password reset link to the user\'s email.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset email sent', type: ForgotPasswordResponseDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.forgotPassword(dto);
    return ResponseCommon.handleSuccess(HttpStatus.OK, result.message, res, result);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Reset password using the token received via email.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful', type: ResetPasswordResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response): Promise<any> {
    const result = await this.authService.resetPassword(dto);
    return ResponseCommon.handleSuccess(HttpStatus.OK, result.message, res, result);
  }

  // ==================== ASSOCIATIONS (for registration form) ====================

  @Public()
  @Get('associations')
  @ApiOperation({
    summary: 'Get available associations',
    description: 'Get list of active associations for the registration form.',
  })
  @ApiResponse({ status: 200, description: 'Associations retrieved successfully' })
  async getAssociations(@Res() res: Response): Promise<any> {
    const result = await this.authService.getAssociations();
    return ResponseCommon.handleSuccess(HttpStatus.OK, 'Associations retrieved', res, result);
  }

  // ==================== USER PROFILE ====================

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get the authenticated user\'s profile information.',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.authService.getProfile(user.sub);
    return ResponseCommon.handleSuccess(HttpStatus.OK, 'Profile retrieved', res, result);
  }
}
