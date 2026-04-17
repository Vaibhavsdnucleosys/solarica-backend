/**
 * Accounting Module Helper Functions
 * Utility functions for common accounting operations
 */

import { Decimal } from '@prisma/client/runtime/library';
import { ACCOUNTING_CONSTANTS, FINANCIAL_YEAR } from './constants';
import { AccountNature, BalanceType, EntryType, ACCOUNT_NATURE_CONFIG } from './enums';

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Format a number as Indian currency (₹)
 */
export const formatCurrency = (
    amount: number | Decimal,
    currency: string = ACCOUNTING_CONSTANTS.DEFAULT_CURRENCY
): string => {
    const numAmount = typeof amount === 'number' ? amount : Number(amount);

    if (currency === 'INR') {
        // Indian numbering system (lakhs, crores)
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: ACCOUNTING_CONSTANTS.DECIMAL_PLACES,
            maximumFractionDigits: ACCOUNTING_CONSTANTS.DECIMAL_PLACES,
        }).format(numAmount);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: ACCOUNTING_CONSTANTS.DECIMAL_PLACES,
        maximumFractionDigits: ACCOUNTING_CONSTANTS.DECIMAL_PLACES,
    }).format(numAmount);
};

/**
 * Format amount with Dr/Cr suffix
 */
export const formatAmountWithType = (
    amount: number | Decimal,
    balanceType: BalanceType
): string => {
    const formattedAmount = formatCurrency(Math.abs(Number(amount)));
    return `${formattedAmount} ${balanceType === BalanceType.DEBIT ? 'Dr' : 'Cr'}`;
};

// ============================================
// DATE HELPERS
// ============================================

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

/**
 * Format date for voucher display (DD-MMM-YYYY)
 */
export const formatVoucherDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

/**
 * Generate financial year name (e.g., "FY 2024-25")
 */
export const generateFinancialYearName = (startDate: Date): string => {
    const startYear = startDate.getFullYear();
    const endYear = (startYear + 1).toString().slice(-2);
    return `FY ${startYear}-${endYear}`;
};

/**
 * Get financial year start date for a given date
 */
export const getFinancialYearStartDate = (date: Date = new Date()): Date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed

    // If before April, FY started in previous year
    if (month < FINANCIAL_YEAR.START_MONTH) {
        return new Date(year - 1, FINANCIAL_YEAR.START_MONTH - 1, FINANCIAL_YEAR.START_DAY);
    }

    return new Date(year, FINANCIAL_YEAR.START_MONTH - 1, FINANCIAL_YEAR.START_DAY);
};

/**
 * Get financial year end date for a given date
 */
export const getFinancialYearEndDate = (date: Date = new Date()): Date => {
    const startDate = getFinancialYearStartDate(date);
    const endYear = startDate.getFullYear() + 1;
    return new Date(endYear, FINANCIAL_YEAR.END_MONTH - 1, FINANCIAL_YEAR.END_DAY);
};

/**
 * Check if a date is within a financial year
 */
export const isDateInFinancialYear = (
    date: Date,
    fyStartDate: Date,
    fyEndDate: Date
): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const start = new Date(fyStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(fyEndDate);
    end.setHours(23, 59, 59, 999);

    return checkDate >= start && checkDate <= end;
};

// ============================================
// BALANCE CALCULATIONS
// ============================================

/**
 * Calculate the closing balance for a ledger
 */
export const calculateClosingBalance = (
    openingBalance: number,
    openingBalanceType: BalanceType,
    totalDebits: number,
    totalCredits: number,
    accountNature: AccountNature
): { balance: number; balanceType: BalanceType } => {
    const config = ACCOUNT_NATURE_CONFIG[accountNature];

    // Convert opening balance to signed value
    let signedOpening = openingBalance;
    if (openingBalanceType !== config.normalBalance) {
        signedOpening = -openingBalance;
    }

    // Calculate net movement
    let netMovement: number;
    if (config.increaseBy === 'DEBIT') {
        netMovement = totalDebits - totalCredits;
    } else {
        netMovement = totalCredits - totalDebits;
    }

    // Calculate closing balance
    const closingBalance = signedOpening + netMovement;

    // Determine balance type
    const balanceType = closingBalance >= 0 ? config.normalBalance :
        (config.normalBalance === BalanceType.DEBIT ? BalanceType.CREDIT : BalanceType.DEBIT);

    return {
        balance: Math.abs(closingBalance),
        balanceType,
    };
};

/**
 * Check if a voucher is balanced (total debits = total credits)
 */
export const isVoucherBalanced = (
    totalDebit: number | Decimal,
    totalCredit: number | Decimal
): boolean => {
    const debit = typeof totalDebit === 'number' ? totalDebit : Number(totalDebit);
    const credit = typeof totalCredit === 'number' ? totalCredit : Number(totalCredit);

    // Use a small epsilon for floating-point comparison
    return Math.abs(debit - credit) < 0.01;
};

/**
 * Calculate the effect of an entry on a ledger balance
 */
export const calculateEntryEffect = (
    entryType: EntryType,
    amount: number,
    accountNature: AccountNature
): { effect: 'INCREASE' | 'DECREASE'; signedAmount: number } => {
    const config = ACCOUNT_NATURE_CONFIG[accountNature];

    if (entryType === config.increaseBy) {
        return { effect: 'INCREASE', signedAmount: amount };
    } else {
        return { effect: 'DECREASE', signedAmount: -amount };
    }
};

// ============================================
// VOUCHER HELPERS
// ============================================

/**
 * Generate voucher number with prefix
 */
export const generateVoucherNumber = (
    prefix: string | null,
    currentNumber: number,
    suffix: string | null = null
): string => {
    const paddedNumber = currentNumber.toString().padStart(4, '0');
    const parts = [prefix, paddedNumber, suffix].filter(Boolean);
    return parts.join('');
};

/**
 * Validate voucher entries
 */
export const validateVoucherEntries = (
    entries: Array<{ entryType: EntryType; amount: number }>
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check minimum entries
    if (entries.length < 2) {
        errors.push('Voucher must have at least 2 entries.');
    }

    // Check for at least one debit and one credit
    const hasDebit = entries.some((e) => e.entryType === EntryType.DEBIT);
    const hasCredit = entries.some((e) => e.entryType === EntryType.CREDIT);

    if (!hasDebit || !hasCredit) {
        errors.push('Voucher must have at least one debit and one credit entry.');
    }

    // Check all amounts are positive
    const hasNegative = entries.some((e) => e.amount <= 0);
    if (hasNegative) {
        errors.push('All entry amounts must be greater than zero.');
    }

    // Check balance
    const totalDebit = entries
        .filter((e) => e.entryType === EntryType.DEBIT)
        .reduce((sum, e) => sum + e.amount, 0);

    const totalCredit = entries
        .filter((e) => e.entryType === EntryType.CREDIT)
        .reduce((sum, e) => sum + e.amount, 0);

    if (!isVoucherBalanced(totalDebit, totalCredit)) {
        errors.push('Voucher is not balanced. Total debits must equal total credits.');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// ============================================
// NUMBER HELPERS
// ============================================

/**
 * Round to specified decimal places
 */
export const roundToDecimal = (
    value: number,
    decimals: number = ACCOUNTING_CONSTANTS.DECIMAL_PLACES
): number => {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
};

/**
 * Convert amount to words (for Indian currency)
 */
export const amountToWords = (amount: number): string => {
    const ones = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
    ];

    if (amount === 0) return 'Zero Rupees Only';

    const convertLessThanThousand = (n: number): string => {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    let words = '';
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    const thousand = Math.floor((amount % 100000) / 1000);
    const remainder = Math.floor(amount % 1000);

    if (crore > 0) words += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) words += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) words += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) words += convertLessThanThousand(remainder);

    // Handle paise
    const paise = Math.round((amount - Math.floor(amount)) * 100);
    if (paise > 0) {
        words += ' Rupees and ' + convertLessThanThousand(paise) + ' Paise Only';
    } else {
        words += ' Rupees Only';
    }

    return words.trim();
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate GSTIN format
 */
export const isValidGSTIN = (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
};

/**
 * Validate PAN format
 */
export const isValidPAN = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
};

/**
 * Validate positive decimal amount
 */
export const isValidAmount = (amount: number): boolean => {
    return (
        typeof amount === 'number' &&
        !isNaN(amount) &&
        amount > 0 &&
        amount <= ACCOUNTING_CONSTANTS.MAX_DECIMAL_VALUE
    );
};

