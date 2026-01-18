/**
 * System roles enum
 */
export enum SystemRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  ASSOCIATION_MANAGER = 'ASSOCIATION_MANAGER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  MEMBER = 'MEMBER',
  USER = 'USER',
}

// Legacy alias for backward compatibility
export enum UserRoles {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  ASSOCIATION_MANAGER = 'ASSOCIATION_MANAGER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  MEMBER = 'MEMBER',
  USER = 'USER',
}

/**
 * Permission categories
 */
export enum PermissionCategory {
  USERS = 'USERS',
  MEMBERS = 'MEMBERS',
  APPLICATIONS = 'APPLICATIONS',
  MEMBERSHIPS = 'MEMBERSHIPS',
  PAYMENTS = 'PAYMENTS',
  INVOICES = 'INVOICES',
  CERTIFICATES = 'CERTIFICATES',
  WORKFLOWS = 'WORKFLOWS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
}

/**
 * Permission actions
 */
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  MANAGE = 'MANAGE',
}


