/**
 * Accounting Module Constants
 * Contains all constant values used across the accounting module
 */

// ============================================
// CURRENCY & FORMATTING
// ============================================

export const ACCOUNTING_CONSTANTS = {
    DEFAULT_CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',
    DECIMAL_PLACES: 2,
    MAX_DECIMAL_VALUE: 9999999999999.99, // 15 digits, 2 decimal places
    MIN_DECIMAL_VALUE: 0.01,
} as const;

// ============================================
// VOUCHER SETTINGS
// ============================================

export const VOUCHER_CONSTANTS = {
    MAX_ENTRIES_PER_VOUCHER: 100,
    MIN_ENTRIES_PER_VOUCHER: 2,
    DEFAULT_NARRATION_LENGTH: 500,
} as const;

// ============================================
// FINANCIAL YEAR SETTINGS (INDIA)
// ============================================

export const FINANCIAL_YEAR = {
    START_MONTH: 4, // April
    START_DAY: 1,
    END_MONTH: 3, // March
    END_DAY: 31,
    DEFAULT_FORMAT: 'FY YYYY-YY', // e.g., FY 2024-25
} as const;

// ============================================
// SYSTEM GROUPS (Chart of Accounts - Primary Groups)
// ============================================

export const SYSTEM_GROUPS = {
    // Primary Groups (Level 0)
    PRIMARY: {
        ASSETS: {
            name: 'Assets',
            nature: 'ASSET' as const,
            description: 'All resources owned by the company',
        },
        LIABILITIES: {
            name: 'Liabilities',
            nature: 'LIABILITY' as const,
            description: 'All obligations owed by the company',
        },
        INCOME: {
            name: 'Income',
            nature: 'INCOME' as const,
            description: 'All revenue and earnings',
        },
        EXPENSES: {
            name: 'Expenses',
            nature: 'EXPENSE' as const,
            description: 'All costs and expenditures',
        },
        EQUITY: {
            name: 'Equity',
            nature: 'EQUITY' as const,
            description: "Owner's capital and reserves",
        },
    },
} as const;

// ============================================
// SECONDARY GROUPS (Sub-groups under Primary)
// ============================================

export const SECONDARY_GROUPS = {
    // Under Assets
    CURRENT_ASSETS: {
        name: 'Current Assets',
        parent: 'Assets',
        nature: 'ASSET' as const,
    },
    FIXED_ASSETS: {
        name: 'Fixed Assets',
        parent: 'Assets',
        nature: 'ASSET' as const,
    },
    INVESTMENTS: {
        name: 'Investments',
        parent: 'Assets',
        nature: 'ASSET' as const,
    },
    BANK_ACCOUNTS: {
        name: 'Bank Accounts',
        parent: 'Current Assets',
        nature: 'ASSET' as const,
    },
    CASH_IN_HAND: {
        name: 'Cash-in-Hand',
        parent: 'Current Assets',
        nature: 'ASSET' as const,
    },
    SUNDRY_DEBTORS: {
        name: 'Sundry Debtors',
        parent: 'Current Assets',
        nature: 'ASSET' as const,
    },
    STOCK_IN_HAND: {
        name: 'Stock-in-Hand',
        parent: 'Current Assets',
        nature: 'ASSET' as const,
    },
    DEPOSITS: {
        name: 'Deposits (Asset)',
        parent: 'Current Assets',
        nature: 'ASSET' as const,
    },
    LOANS_ADVANCES_ASSET: {
        name: 'Loans & Advances (Asset)',
        parent: 'Current Assets',
        nature: 'ASSET' as const,
    },

    // Under Liabilities
    CURRENT_LIABILITIES: {
        name: 'Current Liabilities',
        parent: 'Liabilities',
        nature: 'LIABILITY' as const,
    },
    LOANS_LIABILITY: {
        name: 'Loans (Liability)',
        parent: 'Liabilities',
        nature: 'LIABILITY' as const,
    },
    SUNDRY_CREDITORS: {
        name: 'Sundry Creditors',
        parent: 'Current Liabilities',
        nature: 'LIABILITY' as const,
    },
    DUTIES_AND_TAXES: {
        name: 'Duties & Taxes',
        parent: 'Current Liabilities',
        nature: 'LIABILITY' as const,
    },
    PROVISIONS: {
        name: 'Provisions',
        parent: 'Current Liabilities',
        nature: 'LIABILITY' as const,
    },

    // Under Income
    SALES_ACCOUNTS: {
        name: 'Sales Accounts',
        parent: 'Income',
        nature: 'INCOME' as const,
        affectsGrossProfit: true,
    },
    DIRECT_INCOME: {
        name: 'Direct Income',
        parent: 'Income',
        nature: 'INCOME' as const,
        affectsGrossProfit: true,
    },
    INDIRECT_INCOME: {
        name: 'Indirect Income',
        parent: 'Income',
        nature: 'INCOME' as const,
        affectsGrossProfit: false,
    },

    // Under Expenses
    PURCHASE_ACCOUNTS: {
        name: 'Purchase Accounts',
        parent: 'Expenses',
        nature: 'EXPENSE' as const,
        affectsGrossProfit: true,
    },
    DIRECT_EXPENSES: {
        name: 'Direct Expenses',
        parent: 'Expenses',
        nature: 'EXPENSE' as const,
        affectsGrossProfit: true,
    },
    INDIRECT_EXPENSES: {
        name: 'Indirect Expenses',
        parent: 'Expenses',
        nature: 'EXPENSE' as const,
        affectsGrossProfit: false,
    },

    // Under Equity
    CAPITAL_ACCOUNT: {
        name: 'Capital Account',
        parent: 'Equity',
        nature: 'EQUITY' as const,
    },
    RESERVES_AND_SURPLUS: {
        name: 'Reserves & Surplus',
        parent: 'Equity',
        nature: 'EQUITY' as const,
    },
} as const;

// ============================================
// DEFAULT VOUCHER TYPES
// ============================================

export const DEFAULT_VOUCHER_TYPES = [
    {
        name: 'Payment',
        code: 'PMT',
        category: 'PAYMENT' as const,
        prefix: 'PMT/',
    },
    {
        name: 'Receipt',
        code: 'RCT',
        category: 'RECEIPT' as const,
        prefix: 'RCT/',
    },
    {
        name: 'Contra',
        code: 'CNT',
        category: 'CONTRA' as const,
        prefix: 'CNT/',
    },
    {
        name: 'Journal',
        code: 'JNL',
        category: 'JOURNAL' as const,
        prefix: 'JNL/',
    },
    {
        name: 'Sales',
        code: 'SLS',
        category: 'SALES' as const,
        prefix: 'SLS/',
    },
    {
        name: 'Purchase',
        code: 'PUR',
        category: 'PURCHASE' as const,
        prefix: 'PUR/',
    },
    {
        name: 'Debit Note',
        code: 'DN',
        category: 'DEBIT_NOTE' as const,
        prefix: 'DN/',
    },
    {
        name: 'Credit Note',
        code: 'CN',
        category: 'CREDIT_NOTE' as const,
        prefix: 'CN/',
    },
] as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ACCOUNTING_ERRORS = {
    // Voucher Errors
    VOUCHER_NOT_BALANCED: 'Voucher is not balanced. Total debits must equal total credits.',
    VOUCHER_MIN_ENTRIES: 'Voucher must have at least 2 entries.',
    VOUCHER_ALREADY_POSTED: 'Cannot modify a posted voucher. Please reverse it instead.',
    VOUCHER_ALREADY_REVERSED: 'This voucher has already been reversed.',
    VOUCHER_NOT_POSTED: 'Only posted vouchers can be reversed.',
    VOUCHER_INVALID_DATE: 'Voucher date must be within the selected financial year.',

    // Financial Year Errors
    FY_LOCKED: 'This financial year is locked. No changes allowed.',
    FY_NOT_ACTIVE: 'Please select an active financial year.',
    FY_ALREADY_EXISTS: 'A financial year with this name already exists.',

    // Ledger Errors
    LEDGER_HAS_TRANSACTIONS: 'Cannot delete ledger with existing transactions.',
    LEDGER_IS_SYSTEM: 'System ledgers cannot be deleted.',
    LEDGER_NOT_FOUND: 'Ledger not found.',

    // Group Errors
    GROUP_HAS_LEDGERS: 'Cannot delete group with ledgers. Move or delete ledgers first.',
    GROUP_HAS_CHILDREN: 'Cannot delete group with sub-groups.',
    GROUP_IS_SYSTEM: 'System groups cannot be deleted.',

    // General Errors
    COMPANY_NOT_FOUND: 'Company not found.',
    UNAUTHORIZED_ACCESS: 'You do not have access to this company.',
    INVALID_AMOUNT: 'Amount must be greater than zero.',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const ACCOUNTING_SUCCESS = {
    VOUCHER_CREATED: 'Voucher created successfully.',
    VOUCHER_POSTED: 'Voucher posted successfully.',
    VOUCHER_REVERSED: 'Voucher reversed successfully.',
    LEDGER_CREATED: 'Ledger created successfully.',
    GROUP_CREATED: 'Account group created successfully.',
    COMPANY_CREATED: 'Company created successfully with default chart of accounts.',
    FY_CREATED: 'Financial year created successfully.',
    FY_LOCKED: 'Financial year locked successfully.',
} as const;

