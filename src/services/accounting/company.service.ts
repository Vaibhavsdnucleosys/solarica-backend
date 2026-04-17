/**
 * Company Service
 * Business logic for Company operations
 * 
 * This is where the seed files are used!
 * When a company is created, we automatically create:
 * - Default Account Groups (Chart of Accounts)
 * - Default Voucher Types
 * - First Financial Year
 */

import prisma from '../../config/prisma';
import { BusinessType } from '@prisma/client';
import {
    createCompanyModel,
    addCompanyUserModel,
    getCompanyByIdModel,
    getCompaniesByUserIdModel,
    checkUserCompanyAccessModel,
    getUserRoleInCompanyModel,
    updateCompanyModel,
    deleteCompanyModel,
    createFinancialYearModel,
} from '../../api/model/accounting';
import {
    generateFinancialYearName,
    getFinancialYearStartDate,
    getFinancialYearEndDate,
} from '../../utils/accounting/helpers';
import { ACCOUNTING_ERRORS, ACCOUNTING_SUCCESS } from '../../utils/accounting/constants';

// ============================================
// INTERFACES
// ============================================

interface CreateCompanyInput {
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
    baseCurrencySymbol?: string;
    baseCurrencyFormalName?: string;
    booksBeginningFrom: Date;
    enableGST?: boolean;
    enableTDS?: boolean;
    enableInventory?: boolean;
}

// ============================================
// CREATE COMPANY (Main Function)
// ============================================

/**
 * Create a new company with all default data
 * 
 * This function:
 * 1. Creates the Company record
 * 2. Adds the creator as OWNER
 * 3. Creates the first Financial Year
 * 4. Seeds default Account Groups (Chart of Accounts)
 * 5. Seeds default Voucher Types
 */
export const createCompanyService = async (
    userId: string,
    input: CreateCompanyInput
) => {
    // Use a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
        console.log(`Creating company: ${input.name}`);

        // =============================================
        // STEP 1: Create the Company
        // =============================================
        const company = await createCompanyModel(
            {
                name: input.name,
                legalName: input.legalName,
                displayName: input.displayName || input.name,
                businessType: input.businessType,
                industry: input.industry,
                gstin: input.gstin,
                pan: input.pan,
                tan: input.tan,
                cin: input.cin,
                email: input.email,
                phone: input.phone,
                website: input.website,
                addressLine1: input.addressLine1,
                addressLine2: input.addressLine2,
                city: input.city,
                state: input.state,
                country: input.country,
                pincode: input.pincode,
                baseCurrency: input.baseCurrency,
                baseCurrencySymbol: input.baseCurrencySymbol,
                baseCurrencyFormalName: input.baseCurrencyFormalName,
                booksBeginningFrom: input.booksBeginningFrom,
                enableGST: input.enableGST,
                enableTDS: input.enableTDS,
                enableInventory: input.enableInventory,
                ownerId: userId,
            },
            tx
        );

        console.log(`  Company created with ID: ${company.id}`);

        // =============================================
        // STEP 2: Add creator as OWNER
        // =============================================
        await addCompanyUserModel(company.id, userId, 'OWNER', tx);

        console.log(`  Added user ${userId} as OWNER`);

        // =============================================
        // STEP 3: Create First Financial Year
        // =============================================
        const fyStartDate = getFinancialYearStartDate(input.booksBeginningFrom);
        const fyEndDate = getFinancialYearEndDate(input.booksBeginningFrom);
        const fyName = generateFinancialYearName(fyStartDate);

        const financialYear = await tx.financialYear.create({
            data: {
                companyId: company.id,
                yearName: fyName,
                startDate: fyStartDate,
                endDate: fyEndDate,
                isActive: true,
                isLocked: false,
            },
        });

        console.log(`  Created Financial Year: ${fyName}`);

        // =============================================
        // STEP 4: Seed Default Account Groups
        // =============================================
        console.log("  Seeding default Account Groups...");
        const groupIdMap = await seedSystemGroupsInTransaction(tx, company.id, userId);
        console.log(`  Created default Account Groups (Chart of Accounts). Groups count: ${Object.keys(groupIdMap).length}`);

        // =============================================
        // STEP 5: Seed Default Ledgers (Cash & P-L)
        // =============================================
        console.log("  Seeding default Ledgers...");
        try {
            await seedDefaultLedgersInTransaction(tx, company.id, userId, groupIdMap);
            console.log(`  Created default Ledgers (Cash, P&L)`);
        } catch (e: any) {
            console.error("  Error seeding ledgers:", e);
            throw e;
        }

        // =============================================
        // STEP 6: Seed Default Voucher Types
        // =============================================
        console.log("  Seeding default Voucher Types...");
        try {
            await seedVoucherTypesInTransaction(tx, company.id);
            console.log(`  Created default Voucher Types`);
        } catch (e: any) {
            console.error("  Error seeding voucher types:", e);
            throw e;
        }

        // =============================================
        // STEP 7: Create Audit Log
        // =============================================
        await tx.accountingAuditLog.create({
            data: {
                companyId: company.id,
                entityType: 'Company',
                entityId: company.id,
                action: 'CREATE',
                performedBy: userId,
                description: 'Company created with default chart of accounts and ledgers',
            },
        });

        console.log(`Company creation completed: ${company.name}`);

        return {
            company,
            financialYear,
            message: ACCOUNTING_SUCCESS.COMPANY_CREATED,
        };
    }, {
        maxWait: 5000,
        timeout: 20000,
    });
};

// ============================================
// SEED FUNCTIONS (Used inside transaction)
// ============================================

/**
 * Seed system groups within a transaction
 */
async function seedSystemGroupsInTransaction(
    tx: any,
    companyId: string,
    createdBy: string
) {
    // Primary Groups (Level 0)
    const primaryGroups = [
        { name: 'Assets', nature: 'ASSET' as const },
        { name: 'Liabilities', nature: 'LIABILITY' as const },
        { name: 'Income', nature: 'INCOME' as const },
        { name: 'Expenses', nature: 'EXPENSE' as const },
        { name: 'Equity', nature: 'EQUITY' as const },
    ];

    const groupIdMap: Record<string, string> = {};

    // Create primary groups
    for (const group of primaryGroups) {
        const created = await tx.accountGroup.create({
            data: {
                companyId,
                name: group.name,
                nature: group.nature,
                groupType: 'PRIMARY',
                level: 0,
                isSystem: true,
                isActive: true,
                createdBy,
                updatedBy: createdBy,
            },
        });
        groupIdMap[group.name] = created.id;
    }

    // Secondary Groups (Level 1)
    const secondaryGroups = [
        // Under Assets
        { name: 'Current Assets', nature: 'ASSET' as const, parent: 'Assets' },
        { name: 'Fixed Assets', nature: 'ASSET' as const, parent: 'Assets' },
        { name: 'Investments', nature: 'ASSET' as const, parent: 'Assets' },

        // Under Liabilities
        { name: 'Current Liabilities', nature: 'LIABILITY' as const, parent: 'Liabilities' },
        { name: 'Loans (Liability)', nature: 'LIABILITY' as const, parent: 'Liabilities' },

        // Under Income
        { name: 'Sales Accounts', nature: 'INCOME' as const, parent: 'Income', affectsGrossProfit: true },
        { name: 'Direct Income', nature: 'INCOME' as const, parent: 'Income', affectsGrossProfit: true },
        { name: 'Indirect Income', nature: 'INCOME' as const, parent: 'Income' },

        // Under Expenses
        { name: 'Purchase Accounts', nature: 'EXPENSE' as const, parent: 'Expenses', affectsGrossProfit: true },
        { name: 'Direct Expenses', nature: 'EXPENSE' as const, parent: 'Expenses', affectsGrossProfit: true },
        { name: 'Indirect Expenses', nature: 'EXPENSE' as const, parent: 'Expenses' },

        // Under Equity
        { name: 'Capital Account', nature: 'EQUITY' as const, parent: 'Equity' },
        { name: 'Reserves & Surplus', nature: 'EQUITY' as const, parent: 'Equity' },
    ];

    for (const group of secondaryGroups) {
        const created = await tx.accountGroup.create({
            data: {
                companyId,
                name: group.name,
                nature: group.nature,
                groupType: 'SECONDARY',
                parentId: groupIdMap[group.parent],
                level: 1,
                affectsGrossProfit: (group as any).affectsGrossProfit || false,
                isSystem: true,
                isActive: true,
                createdBy,
                updatedBy: createdBy,
            },
        });
        groupIdMap[group.name] = created.id;
    }

    // Tertiary Groups (Level 2)
    const tertiaryGroups = [
        // Under Current Assets
        { name: 'Bank Accounts', nature: 'ASSET' as const, parent: 'Current Assets' },
        { name: 'Cash-in-Hand', nature: 'ASSET' as const, parent: 'Current Assets' },
        { name: 'Sundry Debtors', nature: 'ASSET' as const, parent: 'Current Assets' },
        { name: 'Stock-in-Hand', nature: 'ASSET' as const, parent: 'Current Assets' },
        { name: 'Deposits (Asset)', nature: 'ASSET' as const, parent: 'Current Assets' },
        { name: 'Loans & Advances (Asset)', nature: 'ASSET' as const, parent: 'Current Assets' },

        // Under Current Liabilities
        { name: 'Sundry Creditors', nature: 'LIABILITY' as const, parent: 'Current Liabilities' },
        { name: 'Duties & Taxes', nature: 'LIABILITY' as const, parent: 'Current Liabilities' },
        { name: 'Provisions', nature: 'LIABILITY' as const, parent: 'Current Liabilities' },

        // Under Loans (Liability)
        { name: 'Secured Loans', nature: 'LIABILITY' as const, parent: 'Loans (Liability)' },
        { name: 'Unsecured Loans', nature: 'LIABILITY' as const, parent: 'Loans (Liability)' },
        { name: 'Bank OD A/c', nature: 'LIABILITY' as const, parent: 'Loans (Liability)' },
    ];

    for (const group of tertiaryGroups) {
        const created = await tx.accountGroup.create({
            data: {
                companyId,
                name: group.name,
                nature: group.nature,
                groupType: 'SECONDARY',
                parentId: groupIdMap[group.parent],
                level: 2,
                isSystem: true,
                isActive: true,
                createdBy,
                updatedBy: createdBy,
            },
        });
        groupIdMap[group.name] = created.id;
    }

    return groupIdMap;
}

/**
 * Seed default ledgers within a transaction
 */
async function seedDefaultLedgersInTransaction(
    tx: any,
    companyId: string,
    createdBy: string,
    groupIdMap: Record<string, string>
) {
    // Check if Cash-in-Hand exists
    const cashGroupId = groupIdMap['Cash-in-Hand'];

    if (!cashGroupId) {
        console.warn("WARNING: Cash-in-Hand group not found during ledger seeding. Skipping Cash ledger.");
    } else {
        // Create Cash Ledger
        try {
            await tx.ledger.create({
                data: {
                    companyId,
                    name: 'Cash',
                    groupId: cashGroupId,
                    isSystem: true,
                    isCashAccount: true,
                    createdBy,
                    updatedBy: createdBy
                }
            });
        } catch (e) {
            console.error("Failed to create Cash ledger:", e);
        }
    }

    // Create P&L Ledger (under Equity or a specific group)
    const equityGroupId = groupIdMap['Equity'];
    if (equityGroupId) {
        try {
            await tx.ledger.create({
                data: {
                    companyId,
                    name: 'Profit & Loss A/c',
                    groupId: equityGroupId,
                    isSystem: true,
                    createdBy,
                    updatedBy: createdBy
                }
            });
        } catch (e) {
            console.error("Failed to create P&L ledger:", e);
        }
    } else {
        console.warn("WARNING: Equity group not found during ledger seeding. Skipping P&L ledger.");
    }
}

/**
 * Seed voucher types within a transaction
 */
async function seedVoucherTypesInTransaction(tx: any, companyId: string) {
    const voucherTypes = [
        { name: 'Payment', code: 'PMT', category: 'PAYMENT' as const, prefix: 'PMT/' },
        { name: 'Receipt', code: 'RCT', category: 'RECEIPT' as const, prefix: 'RCT/' },
        { name: 'Contra', code: 'CNT', category: 'CONTRA' as const, prefix: 'CNT/' },
        { name: 'Journal', code: 'JNL', category: 'JOURNAL' as const, prefix: 'JNL/' },
        { name: 'Sales', code: 'SLS', category: 'SALES' as const, prefix: 'SLS/' },
        { name: 'Purchase', code: 'PUR', category: 'PURCHASE' as const, prefix: 'PUR/' },
        { name: 'Debit Note', code: 'DN', category: 'DEBIT_NOTE' as const, prefix: 'DN/' },
        { name: 'Credit Note', code: 'CN', category: 'CREDIT_NOTE' as const, prefix: 'CN/' },
    ];

    for (const vt of voucherTypes) {
        await tx.voucherType.create({
            data: {
                companyId,
                name: vt.name,
                code: vt.code,
                category: vt.category,
                prefix: vt.prefix,
                startingNumber: 1,
                currentNumber: 1,
                isSystem: true,
                isActive: true,
            },
        });
    }
}

// ============================================
// GET COMPANIES
// ============================================

/**
 * Get all companies for a user
 */
export const getUserCompaniesService = async (userId: string) => {
    const companies = await getCompaniesByUserIdModel(userId);

    return companies.map((company) => ({
        id: company.id,
        name: company.name,
        displayName: company.displayName,
        businessType: company.businessType,
        role: company.users[0]?.role || (company.ownerId === userId ? 'OWNER' : null),
        isActive: company.isActive,
        isLocked: company.isLocked,
        activeFinancialYear: company.financialYears[0]?.yearName || null,
        voucherCount: company._count.vouchers,
        createdAt: company.createdAt,
    }));
};

/**
 * Get company details by ID
 */
export const getCompanyByIdService = async (companyId: string, userId: string) => {
    // Check access
    const hasAccess = await checkUserCompanyAccessModel(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const company = await getCompanyByIdModel(companyId);
    if (!company) {
        throw new Error(ACCOUNTING_ERRORS.COMPANY_NOT_FOUND);
    }

    const role = await getUserRoleInCompanyModel(companyId, userId);

    return {
        ...company,
        userRole: role,
    };
};

// ============================================
// UPDATE COMPANY
// ============================================

/**
 * Update company details
 */
export const updateCompanyService = async (
    companyId: string,
    userId: string,
    data: Partial<CreateCompanyInput>
) => {
    // Check access
    const role = await getUserRoleInCompanyModel(companyId, userId);
    if (!role || !['OWNER', 'ADMIN'].includes(role)) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await updateCompanyModel(companyId, data);
};

// ============================================
// DELETE COMPANY
// ============================================

/**
 * Delete (soft) a company
 * Only OWNER can delete
 */
export const deleteCompanyService = async (companyId: string, userId: string) => {
    // Only owner can delete
    const role = await getUserRoleInCompanyModel(companyId, userId);
    if (role !== 'OWNER') {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await deleteCompanyModel(companyId);
};

// ============================================
// ACCESS VALIDATION
// ============================================

/**
 * Check if user has access to a company
 */
export const validateCompanyAccessService = async (
    companyId: string,
    userId: string
): Promise<boolean> => {
    return await checkUserCompanyAccessModel(companyId, userId);
};

/**
 * Get user's role in a company
 */
export const getUserCompanyRoleService = async (
    companyId: string,
    userId: string
) => {
    return await getUserRoleInCompanyModel(companyId, userId);
};

