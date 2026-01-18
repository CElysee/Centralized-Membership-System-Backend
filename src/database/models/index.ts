// Authentication models
export { default as User, UserStatus } from './user.model';
export { default as Otp, OtpType, OtpStatus } from './otp.model';
export { default as Role, RoleType } from './role.model';
export { default as UserRole } from './user-role.model';

// Membership models
export { default as Association, AssociationStatus, AssociationType } from './association.model';
export { default as Member, MemberType, MemberStatus, Gender } from './member.model';
export { default as Company, CompanyType, OwnershipType, CompanyStatus } from './company.model';
export { default as MembershipType, RenewalFrequency } from './membership-type.model';
export { default as Membership, MembershipStatus } from './membership.model';
export { default as Document, DocumentType, DocumentStatus } from './document.model';
export { default as MembershipApplication, ApplicationType } from './membership-application.model';
export { default as ApplicationStatusHistory } from './application-status-history.model';

// Export all models as an array for Sequelize registration
import User from './user.model';
import Otp from './otp.model';
import Role from './role.model';
import UserRole from './user-role.model';
import Association from './association.model';
import Member from './member.model';
import Company from './company.model';
import MembershipType from './membership-type.model';
import Membership from './membership.model';
import Document from './document.model';
import MembershipApplication from './membership-application.model';
import ApplicationStatusHistory from './application-status-history.model';

export const models = [
  User,
  Otp,
  Role,
  UserRole,
  Association,
  Company,
  Member,
  MembershipType,
  Membership,
  Document,
  MembershipApplication,
  ApplicationStatusHistory,
];
