import * as crypto from 'crypto';

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';

import User, { UserStatus } from '../database/models/user.model';
import Role, { RoleType } from '../database/models/role.model';
import UserRole from '../database/models/user-role.model';
import Association from '../database/models/association.model';
import Member, { MemberStatus, MemberType } from '../database/models/member.model';
import Company, { CompanyStatus } from '../database/models/company.model';
import MembershipType from '../database/models/membership-type.model';
import Document from '../database/models/document.model';
import MembershipApplication, { ApplicationType } from '../database/models/membership-application.model';
import ApplicationStatusHistory from '../database/models/application-status-history.model';

import { SignupDto, UserType } from './dto/signup.dto';
import LoginDto from './dto/login.dto';
import AuthResponseDto from './dto/auth-response.dto';
import { MemberRegistrationDto, MemberRegistrationResponseDto } from './dto/member-registration.dto';
import {
  VerifyOtpDto,
  VerifyOtpResponseDto,
  ResendOtpDto,
  ResendOtpResponseDto,
} from './dto/verify-otp.dto';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from './dto/forgot-password.dto';
import { ResetPasswordDto, ResetPasswordResponseDto } from './dto/reset-password.dto';
import { CreateUserDto } from './dto/simple-signup.dto';
import { AssociationManagerCreationDto } from './dto/association-manager-creation.dto';
import {
  VerifyEmailDto,
  VerifyEmailResponseDto,
  ResendVerificationEmailDto,
  ResendVerificationEmailResponseDto,
} from './dto/verify-email.dto';
import { IJWTPayload } from './types/auth.type';

import EmailService from '../email/email.service';
import LoggerService from 'src/logger/logger.service';
import Utils from 'src/utils';
import {
  applicationSubmittedToManagerTemplate,
  applicationSubmittedToApplicantTemplate,
} from 'src/email/templates/application-submitted.template';
import {
  emailVerificationTemplate,
  emailVerificationTextTemplate,
} from 'src/email/templates/email-verification.template';
import { ApplicationStatus } from 'src/shared';

@Injectable()
export default class AuthService {
  private readonly logger = new LoggerService('auth');
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

  constructor(
    private jwtService: JwtService,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Role)
    private roleModel: typeof Role,
    @InjectModel(UserRole)
    private userRoleModel: typeof UserRole,
    @InjectModel(Association)
    private associationModel: typeof Association,
    @InjectModel(Member)
    private memberModel: typeof Member,
    @InjectModel(Company)
    private companyModel: typeof Company,
    @InjectModel(MembershipType)
    private membershipTypeModel: typeof MembershipType,
    @InjectModel(Document)
    private documentModel: typeof Document,
    @InjectModel(MembershipApplication)
    private applicationModel: typeof MembershipApplication,
    @InjectModel(ApplicationStatusHistory)
    private applicationHistoryModel: typeof ApplicationStatusHistory,
    private emailService: EmailService,
    private configService: ConfigService,
    private sequelize: Sequelize,
  ) {}

  /**
   * Basic signup (for testing/admin creation)
   * @deprecated Use simpleSignup, registerMember, or createAssociationManager instead
   */
  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { fullName, email, phoneNumber, password } = signupDto as UserType;
    const otp = Utils.generateOtp();

    this.logger.info('Signup attempt', { email, phoneNumber });

    const whereConditions = [] as Array<{ email?: string; phoneNumber?: string }>;
    if (email) whereConditions.push({ email });
    if (phoneNumber) whereConditions.push({ phoneNumber });

    const existingUser = await this.userModel.findOne({
      where: { [Op.or]: whereConditions },
    });

    if (existingUser) {
      this.logger.warn('Signup failed - user exists', { email, phoneNumber });
      throw new ConflictException('User with this email or phone already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      confirmationSentAt: new Date(),
      otpSentAt: new Date(),
      otpApproved: false,
      otpCode: otp,
      status: UserStatus.PENDING_VERIFICATION,
    } as any);

    // Send OTP email
    if (email) {
      await this.sendOtpEmail(email, fullName, otp);
    }

    // Send email verification link
    if (email) {
      try {
        await this.sendVerificationEmail(user);
      } catch (error) {
        // Log error but don't fail registration
        this.logger.error(`Failed to send verification email: ${error.message}`);
      }
    }

    const tokens = await this.generateTokens(user.id, user?.email, user?.phoneNumber, []);

    this.logger.info('User created successfully', { userId: user.id });
    this.logger.audit('USER_SIGNUP', {
      userId: user.id,
      status: 'SUCCESS',
      metadata: { email: user.email },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Simple signup with default USER role
   */
  async createUser(dto: CreateUserDto): Promise<AuthResponseDto> {
    this.logger.info('Create user attempt', { email: dto.email, phoneNumber: dto.phoneNumber });

    // Validate that at least one identifier is provided
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Either email or phone number must be provided');
    }

    const transaction = await this.sequelize.transaction();

    try {
      // Check if user already exists
      const whereConditions = [] as Array<{ email?: string; phoneNumber?: string }>;
      if (dto.email) whereConditions.push({ email: dto.email });
      if (dto.phoneNumber) whereConditions.push({ phoneNumber: dto.phoneNumber });

      const existingUser = await this.userModel.findOne({
        where: { [Op.or]: whereConditions },
        transaction,
      });

      if (existingUser) {
        throw new ConflictException('User with this email or phone number already exists');
      }

      // Get the USER role
      const userRole = await this.roleModel.findOne({
        where: { name: RoleType.USER },
        transaction,
      });

      if (!userRole) {
        throw new NotFoundException('User role not configured. Please contact administrator.');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const otp = Utils.generateOtp();
      const fullName = `${dto.firstName} ${dto.lastName}`;

      const user = await this.userModel.create(
        {
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          password: hashedPassword,
          confirmationSentAt: new Date(),
          otpSentAt: new Date(),
          otpApproved: false,
          otpCode: otp,
          status: UserStatus.PENDING_VERIFICATION,
        } as any,
        { transaction },
      );

      // Assign USER role
      await this.userRoleModel.create(
        {
          userId: user.id,
          roleId: userRole.id,
        } as any,
        { transaction },
      );

      // Send OTP email
      if (dto.email) {
        await this.sendOtpEmail(dto.email, fullName, otp);
      }

      await transaction.commit();

      // Send email verification link (after commit)
      if (dto.email) {
        try {
          await this.sendVerificationEmail(user);
        } catch (error) {
          // Log error but don't fail registration
          this.logger.error(`Failed to send verification email: ${error.message}`);
        }
      }

      const tokens = await this.generateTokens(user.id, user?.email, user?.phoneNumber, [userRole.name]);

      this.logger.info('User creation went successful', { userId: user.id });
      this.logger.audit('USER_CREATION', {
        userId: user.id,
        status: 'SUCCESS',
        metadata: { email: user.email, phoneNumber: user.phoneNumber },
      });

      return {
        id: user.id,
        fullName: user.fullName,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      await transaction.rollback();
      this.logger.error(`User Creatoion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create an association manager
   * Only callable by System Admin
   */
  async createAssociationManager(dto: AssociationManagerCreationDto): Promise<AuthResponseDto> {
    this.logger.info('Creating association manager', {
      email: dto.email,
      associationId: dto.associationId,
    });

    // Validate that at least one identifier is provided
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Either email or phone number must be provided');
    }

    const transaction = await this.sequelize.transaction();

    try {
      // Check if user already exists
      const whereConditions = [] as Array<{ email?: string; phoneNumber?: string }>;
      if (dto.email) whereConditions.push({ email: dto.email });
      if (dto.phoneNumber) whereConditions.push({ phoneNumber: dto.phoneNumber });

      const existingUser = await this.userModel.findOne({
        where: { [Op.or]: whereConditions },
        transaction,
      });

      if (existingUser) {
        throw new ConflictException('User with this email or phone number already exists');
      }

      // Verify association exists
      const association = await this.associationModel.findByPk(dto.associationId, { transaction });
      if (!association) {
        throw new NotFoundException('Association not found');
      }

      // Get the ASSOCIATION_MANAGER role
      const managerRole = await this.roleModel.findOne({
        where: { name: RoleType.ASSOCIATION_MANAGER },
        transaction,
      });

      if (!managerRole) {
        throw new NotFoundException('Association Manager role not configured. Please contact administrator.');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const otp = Utils.generateOtp();
      const fullName = `${dto.firstName} ${dto.lastName}`;

      const user = await this.userModel.create(
        {
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          password: hashedPassword,
          associationId: dto.associationId,
          confirmationSentAt: new Date(),
          otpSentAt: new Date(),
          otpApproved: false,
          otpCode: otp,
          status: UserStatus.ACTIVE, // Managers are active immediately
          emailVerified: dto.email ? true : false, // Auto-verify for managers
          phoneVerified: dto.phoneNumber ? true : false,
        } as any,
        { transaction },
      );

      // Assign ASSOCIATION_MANAGER role
      await this.userRoleModel.create(
        {
          userId: user.id,
          roleId: managerRole.id,
        } as any,
        { transaction },
      );

      // Send welcome email
      if (dto.email) {
        await this.emailService.sendEmail({
          from: this.configService.get<string>('EMAIL_FROM') || 'noreply@cms.com',
          fromName: 'CMS System',
          to: [dto.email],
          toNames: [fullName],
          subject: 'Welcome to CMS - Association Manager Account',
          htmlContent: `
            <p>Hello ${fullName},</p>
            <p>Your association manager account has been created for <strong>${association.name}</strong>.</p>
            <p>You can now log in and manage membership applications.</p>
            <p>Best regards,<br/>The CMS Team</p>
          `,
          textContent: `Hello ${fullName}, Your association manager account has been created for ${association.name}. You can now log in and manage membership applications. Best regards, The CMS Team`,
        });
      }

      await transaction.commit();

      const tokens = await this.generateTokens(user.id, user?.email, user?.phoneNumber, [managerRole.name]);

      this.logger.info('Association manager created successfully', {
        userId: user.id,
        associationId: dto.associationId,
      });
      this.logger.audit('ASSOCIATION_MANAGER_CREATED', {
        userId: user.id,
        status: 'SUCCESS',
        metadata: {
          email: user.email,
          associationId: dto.associationId,
          associationName: association.name,
        },
      });

      return {
        id: user.id,
        fullName: user.fullName,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      await transaction.rollback();
      this.logger.error(`Association manager creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Member registration with document upload and application creation
   */
  async registerMember(dto: MemberRegistrationDto): Promise<MemberRegistrationResponseDto> {
    this.logger.info('Member registration attempt', { 
      email: dto.email, 
      associationId: dto.associationId,
      applicationType: dto.applicationType,
    });

    const transaction = await this.sequelize.transaction();

    try {
      // 1. Check if user already exists
      const existingUser = await this.userModel.findOne({
        where: { [Op.or]: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }] },
        transaction,
      });

      if (existingUser) {
        throw new ConflictException('User with this email or phone number already exists');
      }

      // 2. Verify association exists
      const association = await this.associationModel.findByPk(dto.associationId, { transaction });
      if (!association) {
        throw new NotFoundException('Association not found');
      }

      // 3. Verify membership type exists and is active
      const membershipType = await this.membershipTypeModel.findOne({
        where: {
          id: dto.membershipTypeId,
          associationId: dto.associationId,
          isActive: true,
        },
        transaction,
      });

      if (!membershipType) {
        throw new NotFoundException('Membership type not found or inactive');
      }

      // 4. Get the MEMBER role
      const memberRole = await this.roleModel.findOne({
        where: { name: RoleType.MEMBER },
        transaction,
      });

      if (!memberRole) {
        throw new NotFoundException('Member role not configured. Please contact administrator.');
      }

      // 5. Create user
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const otp = Utils.generateOtp();

      const user = await this.userModel.create(
        {
          fullName: dto.fullName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          password: hashedPassword,
          status: UserStatus.PENDING_VERIFICATION,
          confirmationSentAt: new Date(),
          otpCode: otp,
          otpSentAt: new Date(),
        } as any,
        { transaction },
      );

      // 6. Assign MEMBER role
      await this.userRoleModel.create(
        { userId: user.id, roleId: memberRole.id } as any,
        { transaction },
      );

      // 7. Handle Company creation for corporate applications
      let company: Company | null = null;
      if (dto.applicationType === 'CORPORATE') {
        if (!dto.companyName) {
          throw new BadRequestException('Company name is required for corporate applications');
        }

        // Check if company already exists by TIN
        if (dto.companyTin) {
          company = await this.companyModel.findOne({
            where: { tin: dto.companyTin },
            transaction,
          });
        }

        // Create new company if not found
        if (!company) {
          company = await this.companyModel.create(
            {
              name: dto.companyName,
              tin: dto.companyTin,
              registrationNumber: dto.companyRegistrationNumber,
              companyType: dto.companyType as any,
              ownershipType: dto.companyOwnershipType as any,
              activitySector: dto.companyActivitySector,
              website: dto.companyWebsite,
              permanentEmployees: dto.permanentEmployees || 0,
              partTimeEmployees: dto.partTimeEmployees || 0,
              description: dto.companyDescription,
              addressData: {
                province: dto.province,
                district: dto.district,
                sector: dto.sector,
                cell: dto.cell,
                village: dto.village,
                streetName: dto.streetName,
                poBox: dto.poBox,
                specificLocation: dto.specificLocation,
              },
              status: CompanyStatus.ACTIVE,
            } as any,
            { transaction },
          );

          this.logger.info('Company created', { companyId: company.id, companyName: company.name });
        }
      }

      // 8. Create Member record
      const member = await this.memberModel.create(
        {
          userId: user.id,
          nationalId: dto.nationalId,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender as any,
          educationLevel: dto.educationLevel,
          workingExperience: dto.workingExperience,
          specialization: dto.specialization,
          companyId: company?.id,
          addressData: {
            province: dto.province,
            district: dto.district,
            sector: dto.sector,
            cell: dto.cell,
            village: dto.village,
            streetName: dto.streetName,
            poBox: dto.poBox,
            specificLocation: dto.specificLocation,
          },
          memberType: dto.applicationType === 'CORPORATE' ? MemberType.CORPORATE : MemberType.INDIVIDUAL,
          status: MemberStatus.PENDING,
        } as any,
        { transaction },
      );

      this.logger.info('Member record created', { 
        memberId: member.id, 
        memberNumber: member.memberNumber,
        memberType: member.memberType,
      });

      // 9. Create membership application
      const applicationNumber = this.generateApplicationNumber();
      
      // Prepare personal data JSON
      const personalData: any = {
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth,
        nationalId: dto.nationalId,
        educationLevel: dto.educationLevel,
        workingExperience: dto.workingExperience,
        specialization: dto.specialization,
      };

      // Prepare company data JSON (for corporate)
      const companyData: any = dto.applicationType === 'CORPORATE' ? {
        companyName: dto.companyName,
        companyTin: dto.companyTin,
        companyRegistrationNumber: dto.companyRegistrationNumber,
        companyType: dto.companyType,
        companyOwnershipType: dto.companyOwnershipType,
        companyActivitySector: dto.companyActivitySector,
        companyWebsite: dto.companyWebsite,
        permanentEmployees: dto.permanentEmployees,
        partTimeEmployees: dto.partTimeEmployees,
        companyDescription: dto.companyDescription,
      } : undefined;

      // Prepare address data JSON
      const addressData: any = {
        province: dto.province,
        district: dto.district,
        sector: dto.sector,
        cell: dto.cell,
        village: dto.village,
        streetName: dto.streetName,
        poBox: dto.poBox,
        specificLocation: dto.specificLocation,
      };

      const application = await this.applicationModel.create(
        {
          applicationNumber,
          userId: user.id,
          memberId: member.id,
          associationId: dto.associationId,
          membershipTypeId: dto.membershipTypeId,
          companyId: company?.id,
          applicationType: dto.applicationType as ApplicationType,
          status: ApplicationStatus.SUBMITTED,
          submittedAt: new Date(),
          personalData,
          companyData,
          addressData,
          applicationData: dto.applicationData || {},
        } as any,
        { transaction },
      );

      this.logger.info('Application created', { 
        applicationId: application.id, 
        applicationNumber: application.applicationNumber,
      });

      // 10. Save uploaded documents and link to application
      const documentIds: string[] = [];
      for (const doc of dto.documents) {
        const document = await this.documentModel.create(
          {
            userId: user.id,
            applicationId: application.id,
            documentType: doc.documentType,
            fileName: doc.fileName,
            originalName: doc.originalName,
            filePath: doc.filePath,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
          } as any,
          { transaction },
        );
        documentIds.push(document.id);
      }

      // Update application with document IDs
      await application.update({ documentIds }, { transaction });

      // 11. Create initial application status history entry
      await this.applicationHistoryModel.create(
        {
          applicationId: application.id,
          previousStatus: null,
          newStatus: ApplicationStatus.SUBMITTED,
          changedBy: user.id,
          notes: 'Application submitted by applicant',
          changedAt: new Date(),
        } as any,
        { transaction },
      );

      await transaction.commit();

      // 12. Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber, [RoleType.MEMBER]);

      // 13. Send notifications (async)
      this.sendOtpEmail(user.email!, user.fullName, otp).catch((err) => {
        this.logger.error('Failed to send OTP email', err.stack);
      });

      this.sendVerificationEmail(user).catch((err) => {
        this.logger.error('Failed to send verification email', err.stack);
      });

      this.sendApplicationNotifications(user, association, application).catch((err) => {
        this.logger.error('Failed to send application notifications', err.stack);
      });

      this.logger.info('Member registration successful', { 
        userId: user.id, 
        memberId: member.id,
        applicationId: application.id,
      });
      
      this.logger.audit('MEMBER_REGISTRATION', {
        userId: user.id,
        resourceId: application.id,
        resourceType: 'MembershipApplication',
        status: 'SUCCESS',
        metadata: {
          memberId: member.id,
          memberNumber: member.memberNumber,
          applicationType: dto.applicationType,
          companyId: company?.id,
        },
      });

      return {
        userId: user.id,
        memberId: member.id,
        memberNumber: member.memberNumber,
        fullName: user.fullName,
        email: user.email!,
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        applicationType: dto.applicationType,
        applicationStatus: application.status,
        companyId: company?.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        message: 'Registration successful. Please verify your email with the OTP sent.',
      };
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Member registration failed', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Verify OTP code
   */
  /**
   * Unified OTP verification method
   * Handles both:
   * 1. Registration OTP verification (via email/phone)
   * 2. 2FA login OTP verification (via sessionId)
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    let user: User | null;
    let is2FALogin = false;

    // Determine verification type and find user
    if (dto.sessionId) {
      // 2FA Login verification
      this.logger.info('2FA OTP verification attempt', { sessionId: dto.sessionId });
      is2FALogin = true;

      user = await this.userModel.findByPk(dto.sessionId, {
        include: [{ model: Role, through: { attributes: [] } }],
      });

      if (!user) {
        this.logger.warn('2FA verification failed - user not found', { sessionId: dto.sessionId });
        throw new UnauthorizedException('Invalid session or OTP expired');
      }

      // Check if user is active (2FA users must be active)
      if (!user.isActive) {
        this.logger.warn('2FA verification failed - user inactive', { userId: user.id });
        throw new UnauthorizedException('User account is inactive');
      }
    } else {
      // Registration OTP verification
      this.logger.info('Registration OTP verification attempt', { 
        email: dto.email, 
        phoneNumber: dto.phoneNumber 
      });

      if (!dto.email && !dto.phoneNumber) {
        throw new BadRequestException('Email, phone number, or sessionId is required');
      }

      const whereConditions: any = {};
      if (dto.email) whereConditions.email = dto.email;
      if (dto.phoneNumber) whereConditions.phoneNumber = dto.phoneNumber;

      user = await this.userModel.findOne({
        where: whereConditions,
        include: [{ model: Role, through: { attributes: [] } }],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Verify OTP code
    if (!user.otpCode || user.otpCode !== dto.otpCode) {
      this.logger.warn('OTP verification failed - invalid OTP', { userId: user.id, is2FALogin });
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Check OTP expiry (10 minutes)
    const otpSentAt = user.otpSentAt;
    if (otpSentAt) {
      const expiryTime = new Date(otpSentAt.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
      if (new Date() > expiryTime) {
        this.logger.warn('OTP verification failed - expired', { userId: user.id, is2FALogin });
        throw new UnauthorizedException(
          is2FALogin 
            ? 'OTP has expired. Please login again.' 
            : 'OTP has expired. Please request a new one.'
        );
      }
    }

    // Update user based on verification type
    if (is2FALogin) {
      // 2FA Login - just clear OTP and update login tracking
      await user.update({
        otpApproved: true,
        otpCode: undefined,
        otpApprovedAt: new Date(),
        loginCount: (user.loginCount || 0) + 1,
        lastSignedDate: new Date(),
      });

      this.logger.info('2FA verification successful - login complete', { userId: user.id });
      this.logger.audit('USER_LOGIN_2FA', {
        userId: user.id,
        status: 'SUCCESS',
        metadata: { twoFAVerified: true },
      });
    } else {
      // Registration - activate account and mark email/phone as verified
      await user.update({
        otpApproved: true,
        otpApprovedAt: new Date(),
        otpCode: undefined,
        emailVerifiedAt: dto.email ? new Date() : user.emailVerifiedAt,
        phoneVerifiedAt: dto.phoneNumber ? new Date() : user.phoneVerifiedAt,
        emailVerified: dto.email ? true : user.emailVerified,
        phoneVerified: dto.phoneNumber ? true : user.phoneVerified,
        status: user.status === UserStatus.PENDING_VERIFICATION ? UserStatus.ACTIVE : user.status,
      });

      this.logger.info('Registration OTP verified successfully', { userId: user.id });
      this.logger.audit('OTP_VERIFICATION', {
        userId: user.id,
        status: 'SUCCESS',
        metadata: { email: dto.email, phoneNumber: dto.phoneNumber },
      });
    }

    // Generate tokens
    const roleNames = user.roles?.map((r) => r.name) || [];
    const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber, roleNames);

    return {
      success: true,
      message: is2FALogin 
        ? 'Login successful - 2FA verified' 
        : 'OTP verified successfully',
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Resend OTP code
   */
  async resendOtp(dto: ResendOtpDto): Promise<ResendOtpResponseDto> {
    this.logger.info('Resend OTP request', { email: dto.email, phoneNumber: dto.phoneNumber });

    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Email or phone number is required');
    }

    const whereConditions: any = {};
    if (dto.email) whereConditions.email = dto.email;
    if (dto.phoneNumber) whereConditions.phoneNumber = dto.phoneNumber;

    const user = await this.userModel.findOne({ where: whereConditions });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check rate limiting (minimum 1 minute between resends)
    if (user.otpSentAt) {
      const timeSinceLastOtp = Date.now() - user.otpSentAt.getTime();
      if (timeSinceLastOtp < 60000) {
        throw new BadRequestException('Please wait at least 1 minute before requesting a new OTP');
      }
    }

    const otp = Utils.generateOtp();
    await user.update({
      otpCode: otp,
      otpSentAt: new Date(),
      otpApproved: false,
    });

    // Send OTP email
    if (dto.email) {
      await this.sendOtpEmail(dto.email, user.fullName, otp);
    }

    this.logger.info('OTP resent', { userId: user.id });

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: this.OTP_EXPIRY_MINUTES,
    };
  }

  /**
   * Login with email or phone number
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto | any> {
    const { email, phoneNumber, password } = loginDto;

    this.logger.info('Login attempt', { email, phoneNumber });

    if (!email && !phoneNumber) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const whereConditions = [] as Array<{ email?: string; phoneNumber?: string }>;
    if (email) whereConditions.push({ email });
    if (phoneNumber) whereConditions.push({ phoneNumber });
    
    //first check if the user with email or phone number exist
    
    const user = await this.userModel.findOne({
      where: {
        [Op.and]: [
          { [Op.or]: whereConditions },
          { isActive: true },
        ],
      },
      include: [{ model: Role, through: { attributes: [] } }],
    });
    
    if (!user) {
      this.logger.warn('Login failed - user not found', { email, phoneNumber });
      throw new UnauthorizedException(`User with email or phone number ${email || phoneNumber} is not found`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn('Login failed - invalid password', { userId: user.id });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification if email login
    if (email && !user.emailVerified) {
      this.logger.warn('Login failed - email not verified', { userId: user.id });
      throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // Check phone verification if phone login
    if (phoneNumber && !user.phoneVerified) {
      this.logger.warn('Login failed - phone not verified', { userId: user.id });
      throw new UnauthorizedException('Please verify your phone number before logging in.');
    }

    // Check if 2FA is enabled
    if (user.twoFaSecurity) {
      this.logger.info('2FA required for user', { userId: user.id });
      
      // Generate OTP
      const otp = Utils.generateOtp();

      // Store OTP in database
      await user.update({
        otpCode: otp,
        otpSentAt: new Date(),
        otpApproved: false,
      });

      // Send OTP via email or SMS
      if (user.email) {
        await this.sendOtpEmail(user.email, user.fullName, otp).catch((err) => {
          this.logger.error('Failed to send 2FA OTP email', err.stack);
        });
      }

      // Return 2FA required response
      return {
        requires2FA: true,
        sessionId: user.id, // Use user ID as session identifier
        message: 'Two-factor authentication required. An OTP has been sent to your registered contact.',
        email: user.email ? this.maskEmail(user.email) : undefined,
        phoneNumber: user.phoneNumber ? this.maskPhoneNumber(user.phoneNumber) : undefined,
        expiresInMinutes: 10,
      };
    }

    // No 2FA required - proceed with normal login
    // Update login tracking
    await user.update({
      loginCount: (user.loginCount || 0) + 1,
      lastSignedDate: new Date(),
    });

    const roleNames = user.roles?.map((r) => r.name) || [];
    const tokens = await this.generateTokens(user.id, user.email, user.phoneNumber, roleNames);

    this.logger.info('Login successful', { userId: user.id });
    this.logger.audit('USER_LOGIN', { userId: user.id, status: 'SUCCESS' });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      ...tokens,
    };
  }

  /**
   * Forgot password - send reset token
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    this.logger.info('Forgot password request', { email: dto.email });

    const user = await this.userModel.findOne({ where: { email: dto.email } });

    // Always return success message to prevent email enumeration
    if (!user) {
      return {
        message: 'If an account with that email exists, we have sent a password reset link.',
        expiresIn: '30 minutes',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await user.update({
      resetToken,
      resetTokenExpiresAt: resetTokenExpiry,
    });

    // Send reset email
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendEmail({
      to: [user.email!],
      toNames: [user.fullName],
      from: this.configService.get('SMTP_FROM_EMAIL') || 'noreply@cms.com',
      fromName: 'Membership System',
      subject: 'Password Reset Request',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.fullName},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      textContent: `Password Reset Request\n\nHello ${user.fullName},\n\nReset your password: ${resetUrl}\n\nExpires in 30 minutes.`,
      isReplyable: false,
    });

    this.logger.info('Password reset email sent', { userId: user.id });

    return {
      message: 'If an account with that email exists, we have sent a password reset link.',
      expiresIn: '30 minutes',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    this.logger.info('Password reset attempt');

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findOne({
      where: {
        resetToken: dto.token,
        resetTokenExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await user.update({
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    });

    this.logger.info('Password reset successful', { userId: user.id });
    this.logger.audit('PASSWORD_RESET', { userId: user.id, status: 'SUCCESS' });

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Get available associations for registration
   */
  async getAssociations(): Promise<Association[]> {
    return this.associationModel.findAll({
      where: { status: 'ACTIVE' },
      attributes: ['id', 'name', 'code', 'description', 'logoUrl', 'email', 'website'],
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel.findByPk(userId, {
      attributes: { exclude: ['password', 'otpCode', 'resetToken'] },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Validate access token
   */
  async validateToken(token: string): Promise<IJWTPayload> {
    try {
      const payload: IJWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Generate JWT tokens with roles
   */
  private async generateTokens(
    userId: string,
    email?: string,
    phoneNumber?: string,
    roles: string[] = [],
  ) {
    const payload = { sub: userId, email, phoneNumber, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Generate unique application number
   */
  private generateApplicationNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `APP-${timestamp}-${random}`;
  }

  /**
   * Send OTP email
   */
  private async sendOtpEmail(email: string, fullName: string, otp: string): Promise<void> {
    await this.emailService.sendEmail({
      to: [email],
      toNames: [fullName],
      from: this.configService.get('SMTP_FROM_EMAIL') || 'noreply@cms.com',
      fromName: 'Membership System',
      subject: 'Your Verification Code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${fullName},</p>
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background-color: #f0f0f0; padding: 15px 30px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p>This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      textContent: `Your verification code is: ${otp}\n\nExpires in ${this.OTP_EXPIRY_MINUTES} minutes.`,
      isReplyable: false,
    });
  }

  /**
   * Send notifications about new application
   */
  private async sendApplicationNotifications(
    user: User,
    association: Association,
    application: MembershipApplication,
  ): Promise<void> {
    const submittedAt = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    const emailData = {
      applicantName: user.fullName,
      applicantEmail: user.email!,
      applicationNumber: application.applicationNumber,
      associationName: association.name,
      submittedAt,
      reviewLink: `${this.configService.get('FRONTEND_URL')}/admin/applications/${application.id}`,
    };

    // Send to applicant
    const applicantTemplate = applicationSubmittedToApplicantTemplate(emailData);
    await this.emailService.sendEmail({
      to: [user.email!],
      toNames: [user.fullName],
      from: this.configService.get('SMTP_FROM_EMAIL') || 'noreply@cms.com',
      fromName: 'Membership System',
      subject: applicantTemplate.subject,
      htmlContent: applicantTemplate.html,
      textContent: applicantTemplate.text,
      isReplyable: false,
    });

    // Send to managers/admins
    const managersAndAdmins = await this.userModel.findAll({
      include: [{
        model: Role,
        where: { name: { [Op.in]: [RoleType.ASSOCIATION_MANAGER, RoleType.SYSTEM_ADMIN] } },
        through: { attributes: [] },
      }],
    });

    const managerTemplate = applicationSubmittedToManagerTemplate(emailData);
    for (const manager of managersAndAdmins) {
      if (manager.email) {
        await this.emailService.sendEmail({
          to: [manager.email],
          toNames: [manager.fullName],
          from: this.configService.get('SMTP_FROM_EMAIL') || 'noreply@cms.com',
          fromName: 'Membership System',
          subject: managerTemplate.subject,
          htmlContent: managerTemplate.html,
          textContent: managerTemplate.text,
          isReplyable: false,
        });
      }
    }
  }

  /**
   * Send email verification link
   */
  private async sendVerificationEmail(user: User): Promise<void> {
    if (!user.email) {
      this.logger.warn('Cannot send verification email - user has no email', { userId: user.id });
      return;
    }

    // Generate email verification token (JWT with 24-hour expiry)
    const verificationToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'email_verification',
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: `${this.EMAIL_VERIFICATION_EXPIRY_HOURS}h`,
      },
    );

    // Update user with confirmation token
    await user.update({
      confirmationToken: verificationToken,
      confirmationSentAt: new Date(),
    });

    // Build verification link
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    // Send email
    const htmlContent = emailVerificationTemplate(user.fullName, verificationLink);
    const textContent = emailVerificationTextTemplate(user.fullName, verificationLink);

    await this.emailService.sendEmail({
      from: this.configService.get<string>('EMAIL_FROM') || 'tresoramizero1@gmail.com',
      fromName: 'CMS System',
      to: [user.email],
      toNames: [user.fullName],
      subject: 'Verify Your Email Address - CMS',
      htmlContent,
      textContent,
    });

    this.logger.info('Verification email sent', { userId: user.id, email: user.email });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    this.logger.info('Email verification attempt');

    try {
      // Verify and decode token
      const payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // Check if token is for email verification
      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid verification token');
      }

      // Find user
      const user = await this.userModel.findByPk(payload.sub);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if already verified
      if (user.emailVerified) {
        return {
          message: 'Email already verified',
          userId: user.id,
          email: user.email!,
        };
      }

      // Check if token matches the one sent
      if (user.confirmationToken !== dto.token) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      // Update user
      await user.update({
        emailVerified: true,
        emailVerifiedAt: new Date(),
        confirmationToken: undefined,
        status: user.status === UserStatus.PENDING_VERIFICATION ? UserStatus.ACTIVE : user.status,
      });

      this.logger.info('Email verified successfully', { userId: user.id });
      this.logger.audit('EMAIL_VERIFIED', {
        userId: user.id,
        status: 'SUCCESS',
        metadata: { email: user.email },
      });

      return {
        message: 'Email verified successfully',
        userId: user.id,
        email: user.email!,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Verification link has expired. Please request a new one.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid verification token');
      }
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    dto: ResendVerificationEmailDto,
  ): Promise<ResendVerificationEmailResponseDto> {
    this.logger.info('Resending verification email', { email: dto.email });

    const user = await this.userModel.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      // For security, don't reveal if email exists
      return {
        message: 'If your email is registered, you will receive a verification link shortly.',
      };
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Rate limiting - check if email was sent recently (within last 1 minute)
    if (user.confirmationSentAt) {
      const timeSinceLastSent = Date.now() - user.confirmationSentAt.getTime();
      const oneMinuteInMs = 60 * 1000;

      if (timeSinceLastSent < oneMinuteInMs) {
        const secondsRemaining = Math.ceil((oneMinuteInMs - timeSinceLastSent) / 1000);
        throw new BadRequestException(
          `Please wait ${secondsRemaining} seconds before requesting another verification email`,
        );
      }
    }

    // Send verification email
    await this.sendVerificationEmail(user);

    this.logger.info('Verification email resent', { userId: user.id });
    this.logger.audit('VERIFICATION_EMAIL_RESENT', {
      userId: user.id,
      status: 'SUCCESS',
      metadata: { email: user.email },
    });

    return {
      message: 'Verification email sent successfully. Please check your inbox.',
    };
  }

  /**
   * Helper method to mask email address
   * Example: user@example.com -> u***@example.com
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 1) {
      return email; // Don't mask if too short
    }
    const maskedLocal = localPart[0] + '***';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Helper method to mask phone number
   * Example: +250788123456 -> +***3456
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) {
      return phoneNumber; // Don't mask if too short
    }
    const lastFour = phoneNumber.slice(-4);
    return `+***${lastFour}`;
  }
}
