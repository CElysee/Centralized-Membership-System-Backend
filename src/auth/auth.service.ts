import * as crypto from 'crypto';

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';


import User from '../database/models/user.model';
import { SignupDto, UserType } from './dto/signup.dto';
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
import EmailService from '../email/email.service';
import Utils from 'src/utils';
import { ConfigService } from '@nestjs/config';
import { IJWTPayload } from './types/auth.type';

@Injectable()
export default class AuthService {
  constructor(

    private jwtService: JwtService,
    @InjectModel(User)
    private userModel: any,
    private emailService: EmailService,
    private configService: ConfigService,
  ) { }

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { fullName, email, phoneNumber, password } = signupDto as UserType;
    const otp = Utils.generateOtp();


    const whereConditions = [] as Array<{ email?: string; phoneNumber?: string }>;
    if (email) {
      whereConditions.push({
        email,
      });
    }
    if (phoneNumber) {
      whereConditions.push({
        phoneNumber,
      });
    }

    const existingUser = await this.userModel.findOne({
      where: {
        [Op.or]: whereConditions,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or phone already exists',
      );
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await this.userModel.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      confirmationSentAt: new Date(),
      otpSentAt: new Date(),
      otpApproved: false,
      otpCode:otp
    });

    const tokens = await this.generateTokens(
      user.id,
      user?.email,
      user?.phoneNumber,
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user?.email,
      phoneNumber: user?.phone,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, phoneNumber, password } = loginDto;

    if (!email && !phoneNumber) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const whereConditions = [] as Array<{ email?: string; phoneNumber?: string }>;
    if (email) {
      whereConditions.push({
        email,
      });
    }
    if (phoneNumber) {
      whereConditions.push({
        phoneNumber,
      });
    }

    const user = await this.userModel.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: whereConditions,
          },
          {
            isActive: true,
          },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.phoneNumber,
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phone,
      ...tokens,
    };
  }

 

 


  private async generateTokens(
    userId: string,
    email?: string,
    phoneNumber?: string,
  ) {
    const payload = {
      sub: userId,
      email,
      phoneNumber,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateToken(token: string) {
    try {
      const payload: IJWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // async forgotPassword(
  //   forgotPasswordDto: ForgotPasswordDto,
  // ): Promise<ForgotPasswordResponseDto> {
  //   const { email } = forgotPasswordDto;

  //   const user = await this.userModel.findOne({
  //     where: {
  //       email,
  //     },
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User with this email does not exist');
  //   }

  //   const resetToken = crypto.randomBytes(32).toString('hex');
  //   const expiresAt = new Date(Date.now() + 30 * 60 * 1000);


  //   const frontendUrl = process.env.FRONTEND_URL;
  //   const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  //   const emailData = {
  //     from: process.env.SMTP_FROM_EMAIL || 'o2labbs@gmail.com',
  //     to: [email],
  //     fromName: 'Tembera Team',
  //     toNames: [user.fullName],
  //     subject: 'Password Reset Request - Tembera',
  //     htmlContent: `
  //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //         <h2 style="color: #333;">Password Reset Request</h2>
  //         <p>Hello ${user.fullName},</p>
  //         <p>You have requested to reset your password for your Tembera account. Click the button below to reset your password:</p>
  //         <div style="text-align: center; margin: 30px 0;">
  //           <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
  //         </div>
  //         <p>Or copy and paste this link into your browser:</p>
  //         <p style="word-break: break-all; color: #666;">${resetUrl}</p>
  //         <p><strong>Important:</strong> This link will expire in 30 minutes for security reasons.</p>
  //         <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
  //         <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  //         <p style="color: #666; font-size: 12px;">This is an automated message from Tembera. Please do not reply to this email.</p>
  //       </div>
  //     `,
  //     textContent: `
  //       Password Reset Request
        
  //       Hello ${user.fullName},
        
  //       You have requested to reset your password for your Tembera account.
        
  //       Please click on the following link to reset your password:
  //       ${resetUrl}
        
  //       Important: This link will expire in 30 minutes for security reasons.
        
  //       If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        
  //       This is an automated message from Tembera.
  //     `,
  //     isReplyable: false,
  //   };

  //   try {
  //     await this.emailService.sendEmail(emailData);
  //   } catch (error) {
  //     console.error('Failed to send password reset email:', error);
  //     throw new InternalServerErrorException('Failed to send password reset email');
  //   }

  //   return {
  //     message:
  //       'If an account with that email exists, we have sent a password reset link.',
  //     expiresIn: '30 minutes',
  //   };
  // }

  // async resetPassword(
  //   resetPasswordDto: ResetPasswordDto,
  // ): Promise<ResetPasswordResponseDto> {
  //   const { token, newPassword, confirmPassword } = resetPasswordDto;

  //   if (newPassword !== confirmPassword) {
  //     throw new BadRequestException('Passwords do not match');
  //   }

  //   const resetToken = await this.passwordResetTokenModel.findOne({
  //     where: {
  //       token,
  //     },
  //     include: [{
  //       model: User,
  //     }],
  //   });

  //   if (!resetToken) {
  //     throw new BadRequestException('Invalid or expired reset token');
  //   }

  //   if (resetToken.expiresAt < new Date()) {
  //     throw new BadRequestException('Reset token has expired');
  //   }

  //   if (resetToken.isUsed) {
  //     throw new BadRequestException('Reset token has already been used');
  //   }

  //   const saltRounds = 12;
  //   const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  //   const { sequelize } = this.userModel;
  //   const transaction = await sequelize?.transaction();

  //   try {
  //     await this.userModel.update(
  //       {
  //         password: hashedPassword,
  //       },
  //       {
  //         where: {
  //           id: resetToken.userId,
  //         },
  //         transaction,
  //       },
  //     );

  //     await this.passwordResetTokenModel.update(
  //       {
  //         isUsed: true,
  //       },
  //       {
  //         where: {
  //           id: resetToken.id,
  //         },
  //         transaction,
  //       },
  //     );

  //     await transaction?.commit();
  //   } catch (error) {
  //     await transaction?.rollback();
  //     throw error;
  //   }

  //   return {
  //     message: 'Password has been successfully reset',
  //   };
  // }

  // async updateProfile(
  //   user: User,
  //   updateProfileDto: UpdateProfileDto,
  // ): Promise<UpdateProfileResponseDto> {
  //   const { fullName, email, phone } = updateProfileDto;

  //   const updateData: Partial<{
  //     fullName: string;
  //     email: string;
  //     phone: string;
  //   }> = {};

  //   if (fullName !== undefined) {
  //     updateData.fullName = fullName;
  //   }

  //   if (email !== undefined) {
  //     if (email !== user.email) {
  //       const existingUserWithEmail = await this.userModel.findOne({
  //         where: {
  //           email,
  //           id: {
  //             [Op.ne]: user.id,
  //           },
  //         },
  //       });

  //       if (existingUserWithEmail) {
  //         throw new ConflictException('Email is already in use by another user');
  //       }
  //     }
  //     updateData.email = email;
  //   }

  //   if (phone !== undefined) {
  //     if (phone !== user.phone) {
  //       const existingUserWithPhone = await this.userModel.findOne({
  //         where: {
  //           phone,
  //           id: {
  //             [Op.ne]: user.id,
  //           },
  //         },
  //       });

  //       if (existingUserWithPhone) {
  //         throw new ConflictException('Phone number is already in use by another user');
  //       }
  //     }
  //     updateData.phone = phone;
  //   }

  //   if (Object.keys(updateData).length === 0) {
  //     throw new BadRequestException('No valid fields provided for update');
  //   }

  //   await user.update(updateData);
  //   await user.reload();

  //   return {
  //     id: user.id,
  //     fullName: user.fullName,
  //     email: user.email,
  //     phone: user.phone,
  //     role: user.role,
  //     message: 'Profile updated successfully',
  //   };
  // }
}
