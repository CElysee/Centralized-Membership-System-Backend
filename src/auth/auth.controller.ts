import {
  Controller,
  Post,
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

import User from 'src/database/models/user.model';

import AuthService from './auth.service';
import { SignupDto } from './dto/signup.dto';
import LoginDto from './dto/login.dto';
import AuthResponseDto from './dto/auth-response.dto';
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
} from './dto/forgot-password.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import {
  UpdateProfileDto,
  UpdateProfileResponseDto,
} from './dto/update-profile.dto';
import CurrentUser from './decorators/current-user.decorator';
import ResponseCommon from 'src/common/response.common';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
  })
  @ApiBody({
    type: SignupDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user already exists',
  })
  async signup(@Body() signupDto: SignupDto,@Res() res: Response): Promise<any> {
    const createdUser = await this.authService.signup(signupDto);
    return ResponseCommon.handleSuccess(
      HttpStatus.CREATED,
      'User successfully registered',
      res,
      createdUser
    )
  }



  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User authentication',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  // @Public()
  // @Post('forgot-password')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Request password reset',
  // })
  // @ApiBody({
  //   type: ForgotPasswordDto,
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password reset email sent successfully',
  //   type: ForgotPasswordResponseDto,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad request - validation failed',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'User not found',
  // })
  // async forgotPassword(
  //   @Body() forgotPasswordDto: ForgotPasswordDto,
  // ): Promise<ForgotPasswordResponseDto> {
  //   return this.authService.forgotPassword(forgotPasswordDto);
  // }

  // @Public()
  // @Post('reset-password')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Reset password with token',
  // })
  // @ApiBody({
  //   type: ResetPasswordDto,
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password reset successfully',
  //   type: ResetPasswordResponseDto,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad request - invalid token or validation failed',
  // })
  // async resetPassword(
  //   @Body() resetPasswordDto: ResetPasswordDto,
  // ): Promise<ResetPasswordResponseDto> {
  //   return this.authService.resetPassword(resetPasswordDto);
  // }

  // @ApiBearerAuth()
  // @Post('update-profile')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Update user profile',
  // })
  // @ApiBody({
  //   type: UpdateProfileDto,
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Profile updated successfully',
  //   type: UpdateProfileResponseDto,
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad request - validation failed or no fields to update',
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Unauthorized - invalid token or user account deactivated',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'User not found',
  // })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Conflict - email or phone already in use',
  // })
  // async updateProfile(
  //   @CurrentUser() user: User,
  //     @Body() updateProfileDto: UpdateProfileDto,
  // ): Promise<UpdateProfileResponseDto> {
  //   return this.authService.updateProfile(user, updateProfileDto);
  // }
}
