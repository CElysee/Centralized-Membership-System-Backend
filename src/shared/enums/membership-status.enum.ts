/**
 * Membership subscription status enum
 */
export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  GRACE_PERIOD = 'GRACE_PERIOD',
}

/**
 * Membership type category
 */
export enum MembershipCategory {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  STUDENT = 'STUDENT',
  HONORARY = 'HONORARY',
  LIFETIME = 'LIFETIME',
  ASSOCIATE = 'ASSOCIATE',
}

/**
 * Membership billing cycle
 */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ANNUALLY = 'ANNUALLY',
  LIFETIME = 'LIFETIME',
}

/**
 * Certificate status enum
 */
export enum CertificateStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  REPLACED = 'REPLACED',
}


