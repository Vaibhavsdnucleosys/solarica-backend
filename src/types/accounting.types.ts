/**
 * Accounting Module Type Definitions
 * TypeScript interfaces for all accounting entities
 */

import { Decimal } from '@prisma/client/runtime/library';
import {
    AccountNature,
    BalanceType,
    BusinessType,
    CompanyRole,
    EntryType,
    GroupType,
    VoucherCategory,
    VoucherStatus,
    AuditAction,
} from '../utils/accounting/enums';

// ============================================
// COMPANY TYPES
// ============================================

export interface ICompany {
    id: string;
    name: string;
    legalName?: string;
    displayName: string;
    businessType: BusinessType;
    industry?: string;
    gstin?: string;
    pan?: string;
    tan?: string;
    cin?: string;
    email?: string;
    phone?: string;
    website?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country: string;
    pincode?: string;
    baseCurrency: string;
    financialYearStart: string;
    booksBeginningFrom: Date;
    enableGST: boolean;
    enableTDS: boolean;
    enableInventory: boolean;
    ownerId: string;
    isActive: boolean;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateCompanyDTO {
    name: string;
    legalName?: string;
    displayName?: string;
    businessType?: BusinessType;
    industry?: string;
    gstin?: string;
    pan?: string;
    tan?: string;
    cin?: string;
    email?: string;
    phone?: string;
    website?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    baseCurrency?: string;
    booksBeginningFrom: Date;
    enableGST?: boolean;
    enableTDS?: boolean;
    enableInventory?: boolean;
}

export interface ICompanyUser {
    id: string;
    companyId: string;
    userId: string;
    role: CompanyRole;
    isActive: boolean;
    joinedAt: Date;
}

// ============================================
// FINANCIAL YEAR TYPES
// ============================================

export interface IFinancialYear {
    id: string;
    companyId: string;
    yearName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isLocked: boolean;
    lockedAt?: Date;
    lockedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateFinancialYearDTO {
    yearName?: string;
    startDate: Date;
    endDate: Date;
}

// ============================================
// ACCOUNT GROUP TYPES
// ============================================

export interface IAccountGroup {
    id: string;
    companyId: string;
    name: string;
    code?: string;
    parentId?: string;
    groupType: GroupType;
    nature: AccountNature;
    affectsGrossProfit: boolean;
    level: number;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface ICreateAccountGroupDTO {
    name: string;
    code?: string;
    parentId?: string;
    nature: AccountNature;
    affectsGrossProfit?: boolean;
}

export interface IAccountGroupWithChildren extends IAccountGroup {
    children: IAccountGroupWithChildren[];
    ledgers?: ILedger[];
}

// ============================================
// LEDGER TYPES
// ============================================

export interface ILedger {
    id: string;
    companyId: string;
    groupId: string;
    name: string;
    code?: string;
    description?: string;
    openingBalance: Decimal;
    openingBalanceType: BalanceType;
    currentBalance: Decimal;
    currentBalanceType: BalanceType;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    gstin?: string;
    pan?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
    isBankAccount: boolean;
    isCashAccount: boolean;
    isPartyAccount: boolean;
    isTaxAccount: boolean;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface ICreateLedgerDTO {
    groupId: string;
    name: string;
    code?: string;
    description?: string;
    openingBalance?: number;
    openingBalanceType?: BalanceType;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    gstin?: string;
    pan?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
    isBankAccount?: boolean;
    isCashAccount?: boolean;
    isPartyAccount?: boolean;
    isTaxAccount?: boolean;
}

export interface ILedgerWithGroup extends ILedger {
    group: IAccountGroup;
}

// ============================================
// VOUCHER TYPE TYPES
// ============================================

export interface IVoucherType {
    id: string;
    companyId: string;
    name: string;
    code: string;
    category: VoucherCategory;
    prefix?: string;
    suffix?: string;
    startingNumber: number;
    currentNumber: number;
    isSystem: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateVoucherTypeDTO {
    name: string;
    code: string;
    category: VoucherCategory;
    prefix?: string;
    suffix?: string;
    startingNumber?: number;
}

// ============================================
// VOUCHER TYPES
// ============================================

export interface IVoucher {
    id: string;
    companyId: string;
    voucherTypeId: string;
    financialYearId: string;
    voucherNumber: string;
    voucherDate: Date;
    referenceNumber?: string;
    referenceDate?: Date;
    narration?: string;
    status: VoucherStatus;
    postedAt?: Date;
    postedBy?: string;
    isReversed: boolean;
    reversedAt?: Date;
    reversedBy?: string;
    reversalVoucherId?: string;
    originalVoucherId?: string;
    totalDebit: Decimal;
    totalCredit: Decimal;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface IVoucherEntry {
    id: string;
    companyId: string;
    voucherId: string;
    ledgerId: string;
    entryType: EntryType;
    amount: Decimal;
    description?: string;
    createdAt: Date;
}

export interface ICreateVoucherDTO {
    voucherTypeId: string;
    financialYearId: string;
    voucherDate: Date;
    referenceNumber?: string;
    referenceDate?: Date;
    narration?: string;
    entries: ICreateVoucherEntryDTO[];
}

export interface ICreateVoucherEntryDTO {
    ledgerId: string;
    entryType: EntryType;
    amount: number;
    description?: string;
}

export interface IVoucherWithEntries extends IVoucher {
    voucherType: IVoucherType;
    financialYear: IFinancialYear;
    entries: Array<IVoucherEntry & { ledger: ILedger }>;
}

// ============================================
// OPENING BALANCE TYPES
// ============================================

export interface IOpeningBalance {
    id: string;
    companyId: string;
    ledgerId: string;
    financialYearId: string;
    amount: Decimal;
    balanceType: BalanceType;
    createdAt: Date;
    createdBy: string;
}

export interface ICreateOpeningBalanceDTO {
    ledgerId: string;
    financialYearId: string;
    amount: number;
    balanceType: BalanceType;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface IAuditLog {
    id: string;
    companyId: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    changes?: Record<string, any>;
    description?: string;
    performedBy: string;
    performedAt: Date;
    ipAddress?: string;
    voucherId?: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface IDayBookEntry {
    voucherNumber: string;
    voucherDate: Date;
    voucherType: string;
    particulars: string;
    debitAmount: number;
    creditAmount: number;
    narration?: string;
}

export interface ITrialBalanceEntry {
    ledgerName: string;
    groupName: string;
    openingDebit: number;
    openingCredit: number;
    periodDebit: number;
    periodCredit: number;
    closingDebit: number;
    closingCredit: number;
}

export interface ITrialBalance {
    asOnDate: Date;
    financialYear: string;
    entries: ITrialBalanceEntry[];
    totals: {
        openingDebit: number;
        openingCredit: number;
        periodDebit: number;
        periodCredit: number;
        closingDebit: number;
        closingCredit: number;
    };
}

export interface IProfitLossItem {
    groupName: string;
    amount: number;
    subItems: Array<{
        ledgerName: string;
        amount: number;
    }>;
}

export interface IProfitLoss {
    period: {
        from: Date;
        to: Date;
    };
    income: {
        directIncome: IProfitLossItem[];
        indirectIncome: IProfitLossItem[];
        totalDirectIncome: number;
        totalIndirectIncome: number;
        totalIncome: number;
    };
    expenses: {
        directExpenses: IProfitLossItem[];
        indirectExpenses: IProfitLossItem[];
        totalDirectExpenses: number;
        totalIndirectExpenses: number;
        totalExpenses: number;
    };
    grossProfit: number;
    netProfit: number;
}

// Schedule III Balance Sheet Line Item
export interface IBalanceSheetLineItem {
    items: Array<{
        id: string;
        name: string;
        amount: number;
    }>;
    total: number;
    noteNo: number | null;
}

// Schedule III (Companies Act 2013) Balance Sheet Format
export interface IBalanceSheet {
    companyName: string;
    asOnDate: Date;
    previousYearDate: Date;

    equityAndLiabilities: {
        shareholdersFunds: {
            shareCapital: IBalanceSheetLineItem;
            reservesAndSurplus: IBalanceSheetLineItem;
            moneyReceivedAgainstShareWarrants: IBalanceSheetLineItem;
            total: number;
        };
        shareApplicationMoneyPendingAllotment: { total: number; noteNo: number | null };
        nonCurrentLiabilities: {
            longTermBorrowings: IBalanceSheetLineItem;
            deferredTaxLiabilities: IBalanceSheetLineItem;
            otherLongTermLiabilities: IBalanceSheetLineItem;
            longTermProvisions: IBalanceSheetLineItem;
            total: number;
        };
        currentLiabilities: {
            shortTermBorrowings: IBalanceSheetLineItem;
            tradePayables: IBalanceSheetLineItem;
            otherCurrentLiabilities: IBalanceSheetLineItem;
            shortTermProvisions: IBalanceSheetLineItem;
            total: number;
        };
        total: number;
    };

    assets: {
        nonCurrentAssets: {
            fixedAssets: {
                tangibleAssets: IBalanceSheetLineItem;
                intangibleAssets: IBalanceSheetLineItem;
                capitalWorkInProgress: IBalanceSheetLineItem;
                intangibleAssetsUnderDevelopment: IBalanceSheetLineItem;
                fixedAssetsHeldForSale: IBalanceSheetLineItem;
                total: number;
            };
            nonCurrentInvestments: IBalanceSheetLineItem;
            deferredTaxAssets: IBalanceSheetLineItem;
            longTermLoansAndAdvances: IBalanceSheetLineItem;
            otherNonCurrentAssets: IBalanceSheetLineItem;
            total: number;
        };
        currentAssets: {
            currentInvestments: IBalanceSheetLineItem;
            inventories: IBalanceSheetLineItem;
            tradeReceivables: IBalanceSheetLineItem;
            cashAndCashEquivalents: IBalanceSheetLineItem;
            shortTermLoansAndAdvances: IBalanceSheetLineItem;
            otherCurrentAssets: IBalanceSheetLineItem;
            total: number;
        };
        total: number;
    };

    totals: {
        totalEquityAndLiabilities: number;
        totalAssets: number;
        isBalanced: boolean;
        difference: number;
    };
}

export interface ILedgerStatement {
    ledger: ILedger;
    period: {
        from: Date;
        to: Date;
    };
    openingBalance: {
        amount: number;
        type: BalanceType;
    };
    transactions: Array<{
        date: Date;
        voucherNumber: string;
        voucherType: string;
        particulars: string;
        debit: number;
        credit: number;
        balance: number;
        balanceType: BalanceType;
    }>;
    closingBalance: {
        amount: number;
        type: BalanceType;
    };
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface IDashboardSummary {
    totalAssets: number;
    totalLiabilities: number;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
    bankBalance: number;
    receivables: number;
    payables: number;
    vouchersToday: number;
    vouchersThisMonth: number;
}

export interface ITopParty {
    id: string;
    name: string;
    amount: number;
}

