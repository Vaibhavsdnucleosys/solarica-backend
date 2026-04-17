/**
 * Accounting Module Enums
 * TypeScript enums that mirror Prisma enums for type safety
 */

// ============================================
// BALANCE TYPE & ENTRY TYPE (MUST BE AT THE TOP)
// ============================================

export enum BalanceType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT',
}

export enum EntryType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT',
}

// ============================================
// BUSINESS TYPE
// ============================================

export enum BusinessType {
    SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
    PARTNERSHIP = 'PARTNERSHIP',
    LLP = 'LLP',
    PRIVATE_LIMITED = 'PRIVATE_LIMITED',
    PUBLIC_LIMITED = 'PUBLIC_LIMITED',
    OPC = 'OPC',
    NGO = 'NGO',
    TRUST = 'TRUST',
    SOCIETY = 'SOCIETY',
    HUF = 'HUF',
    OTHER = 'OTHER',
}

// ============================================
// COMPANY ROLE
// ============================================

export enum CompanyRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    ACCOUNTANT = 'ACCOUNTANT',
    AUDITOR = 'AUDITOR',
    DATA_ENTRY = 'DATA_ENTRY',
    VIEWER = 'VIEWER',
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
    [CompanyRole.OWNER]: {
        canCreateVoucher: true,
        canPostVoucher: true,
        canReverseVoucher: true,
        canCreateLedger: true,
        canDeleteLedger: true,
        canViewReports: true,
        canLockYear: true,
        canManageUsers: true,
        canDeleteCompany: true,
    },
    [CompanyRole.ADMIN]: {
        canCreateVoucher: true,
        canPostVoucher: true,
        canReverseVoucher: true,
        canCreateLedger: true,
        canDeleteLedger: true,
        canViewReports: true,
        canLockYear: true,
        canManageUsers: true,
        canDeleteCompany: false,
    },
    [CompanyRole.ACCOUNTANT]: {
        canCreateVoucher: true,
        canPostVoucher: true,
        canReverseVoucher: true,
        canCreateLedger: true,
        canDeleteLedger: false,
        canViewReports: true,
        canLockYear: false,
        canManageUsers: false,
        canDeleteCompany: false,
    },
    [CompanyRole.AUDITOR]: {
        canCreateVoucher: false,
        canPostVoucher: false,
        canReverseVoucher: false,
        canCreateLedger: false,
        canDeleteLedger: false,
        canViewReports: true,
        canLockYear: false,
        canManageUsers: false,
        canDeleteCompany: false,
    },
    [CompanyRole.DATA_ENTRY]: {
        canCreateVoucher: true,
        canPostVoucher: false,
        canReverseVoucher: false,
        canCreateLedger: false,
        canDeleteLedger: false,
        canViewReports: false,
        canLockYear: false,
        canManageUsers: false,
        canDeleteCompany: false,
    },
    [CompanyRole.VIEWER]: {
        canCreateVoucher: false,
        canPostVoucher: false,
        canReverseVoucher: false,
        canCreateLedger: false,
        canDeleteLedger: false,
        canViewReports: true,
        canLockYear: false,
        canManageUsers: false,
        canDeleteCompany: false,
    },
} as const;

// ============================================
// ACCOUNT GROUP & NATURE
// ============================================

export enum GroupType {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
    CUSTOM = 'CUSTOM',
}

export enum AccountNature {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    EQUITY = 'EQUITY',
}

// Determines how balance behaves for each nature
export const ACCOUNT_NATURE_CONFIG = {
    [AccountNature.ASSET]: {
        normalBalance: BalanceType.DEBIT,
        increaseBy: EntryType.DEBIT,
        decreaseBy: EntryType.CREDIT,
        balanceSheetGroup: 'ASSETS',
    },
    [AccountNature.LIABILITY]: {
        normalBalance: BalanceType.CREDIT,
        increaseBy: EntryType.CREDIT,
        decreaseBy: EntryType.DEBIT,
        balanceSheetGroup: 'LIABILITIES',
    },
    [AccountNature.INCOME]: {
        normalBalance: BalanceType.CREDIT,
        increaseBy: EntryType.CREDIT,
        decreaseBy: EntryType.DEBIT,
        balanceSheetGroup: 'PROFIT_LOSS',
    },
    [AccountNature.EXPENSE]: {
        normalBalance: BalanceType.DEBIT,
        increaseBy: EntryType.DEBIT,
        decreaseBy: EntryType.CREDIT,
        balanceSheetGroup: 'PROFIT_LOSS',
    },
    [AccountNature.EQUITY]: {
        normalBalance: BalanceType.CREDIT,
        increaseBy: EntryType.CREDIT,
        decreaseBy: EntryType.DEBIT,
        balanceSheetGroup: 'EQUITY',
    },
} as const;

// ============================================
// VOUCHER
// ============================================

export enum VoucherStatus {
    DRAFT = 'DRAFT',
    POSTED = 'POSTED',
    REVERSED = 'REVERSED',
}

export enum VoucherCategory {
    PAYMENT = 'PAYMENT',
    RECEIPT = 'RECEIPT',
    CONTRA = 'CONTRA',
    JOURNAL = 'JOURNAL',
    SALES = 'SALES',
    PURCHASE = 'PURCHASE',
    DEBIT_NOTE = 'DEBIT_NOTE',
    CREDIT_NOTE = 'CREDIT_NOTE',
}

// Voucher category configurations
export const VOUCHER_CATEGORY_CONFIG = {
    [VoucherCategory.PAYMENT]: {
        description: 'For recording payments made',
        requiresBankOrCash: true,
        bankOrCashSide: 'CREDIT' as const,
    },
    [VoucherCategory.RECEIPT]: {
        description: 'For recording payments received',
        requiresBankOrCash: true,
        bankOrCashSide: 'DEBIT' as const,
    },
    [VoucherCategory.CONTRA]: {
        description: 'For bank to cash or cash to bank transfers',
        requiresBankOrCash: true,
        bankOrCashSide: 'BOTH' as const,
    },
    [VoucherCategory.JOURNAL]: {
        description: 'For adjustments and non-cash entries',
        requiresBankOrCash: false,
        bankOrCashSide: null,
    },
    [VoucherCategory.SALES]: {
        description: 'For recording sales',
        requiresBankOrCash: false,
        bankOrCashSide: null,
    },
    [VoucherCategory.PURCHASE]: {
        description: 'For recording purchases',
        requiresBankOrCash: false,
        bankOrCashSide: null,
    },
    [VoucherCategory.DEBIT_NOTE]: {
        description: 'For purchase returns or additional charges to customers',
        requiresBankOrCash: false,
        bankOrCashSide: null,
    },
    [VoucherCategory.CREDIT_NOTE]: {
        description: 'For sales returns or additional discounts to customers',
        requiresBankOrCash: false,
        bankOrCashSide: null,
    },
} as const;

// ============================================
// AUDIT ACTION
// ============================================

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    POST = 'POST',
    REVERSE = 'REVERSE',
    LOCK = 'LOCK',
    UNLOCK = 'UNLOCK',
}

// ============================================
// REPORT TYPES
// ============================================

export enum ReportType {
    DAY_BOOK = 'DAY_BOOK',
    TRIAL_BALANCE = 'TRIAL_BALANCE',
    PROFIT_LOSS = 'PROFIT_LOSS',
    BALANCE_SHEET = 'BALANCE_SHEET',
    CASH_FLOW = 'CASH_FLOW',
    LEDGER_STATEMENT = 'LEDGER_STATEMENT',
    GROUP_SUMMARY = 'GROUP_SUMMARY',
}

