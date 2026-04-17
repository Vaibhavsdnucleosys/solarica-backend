/**
 * Accounting Module Seed - System Groups
 * Creates the default chart of accounts when a new company is created
 */

import { PrismaClient, AccountNature, GroupType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// PRIMARY GROUPS (Level 0)
// ============================================

const PRIMARY_GROUPS = [
    {
        name: 'Assets',
        nature: 'ASSET' as AccountNature,
        groupType: 'PRIMARY' as GroupType,
        level: 0,
    },
    {
        name: 'Liabilities',
        nature: 'LIABILITY' as AccountNature,
        groupType: 'PRIMARY' as GroupType,
        level: 0,
    },
    {
        name: 'Income',
        nature: 'INCOME' as AccountNature,
        groupType: 'PRIMARY' as GroupType,
        level: 0,
    },
    {
        name: 'Expenses',
        nature: 'EXPENSE' as AccountNature,
        groupType: 'PRIMARY' as GroupType,
        level: 0,
    },
    {
        name: 'Equity',
        nature: 'EQUITY' as AccountNature,
        groupType: 'PRIMARY' as GroupType,
        level: 0,
    },
];

// ============================================
// SECONDARY GROUPS (Level 1 & 2)
// ============================================

interface SecondaryGroup {
    name: string;
    nature: AccountNature;
    parent: string;
    level: number;
    affectsGrossProfit?: boolean;
}

const SECONDARY_GROUPS: SecondaryGroup[] = [
    // Under Assets (Level 1)
    { name: 'Current Assets', nature: 'ASSET', parent: 'Assets', level: 1 },
    { name: 'Fixed Assets', nature: 'ASSET', parent: 'Assets', level: 1 },
    { name: 'Investments', nature: 'ASSET', parent: 'Assets', level: 1 },

    // Under Current Assets (Level 2)
    { name: 'Bank Accounts', nature: 'ASSET', parent: 'Current Assets', level: 2 },
    { name: 'Cash-in-Hand', nature: 'ASSET', parent: 'Current Assets', level: 2 },
    { name: 'Sundry Debtors', nature: 'ASSET', parent: 'Current Assets', level: 2 },
    { name: 'Stock-in-Hand', nature: 'ASSET', parent: 'Current Assets', level: 2 },
    { name: 'Deposits (Asset)', nature: 'ASSET', parent: 'Current Assets', level: 2 },
    { name: 'Loans & Advances (Asset)', nature: 'ASSET', parent: 'Current Assets', level: 2 },

    // Under Liabilities (Level 1)
    { name: 'Current Liabilities', nature: 'LIABILITY', parent: 'Liabilities', level: 1 },
    { name: 'Loans (Liability)', nature: 'LIABILITY', parent: 'Liabilities', level: 1 },

    // Under Current Liabilities (Level 2)
    { name: 'Sundry Creditors', nature: 'LIABILITY', parent: 'Current Liabilities', level: 2 },
    { name: 'Duties & Taxes', nature: 'LIABILITY', parent: 'Current Liabilities', level: 2 },
    { name: 'Provisions', nature: 'LIABILITY', parent: 'Current Liabilities', level: 2 },

    // Under Loans (Liability) (Level 2)
    { name: 'Secured Loans', nature: 'LIABILITY', parent: 'Loans (Liability)', level: 2 },
    { name: 'Unsecured Loans', nature: 'LIABILITY', parent: 'Loans (Liability)', level: 2 },
    { name: 'Bank OD A/c', nature: 'LIABILITY', parent: 'Loans (Liability)', level: 2 },

    // Under Income (Level 1)
    { name: 'Sales Accounts', nature: 'INCOME', parent: 'Income', level: 1, affectsGrossProfit: true },
    { name: 'Direct Income', nature: 'INCOME', parent: 'Income', level: 1, affectsGrossProfit: true },
    { name: 'Indirect Income', nature: 'INCOME', parent: 'Income', level: 1, affectsGrossProfit: false },

    // Under Expenses (Level 1)
    { name: 'Purchase Accounts', nature: 'EXPENSE', parent: 'Expenses', level: 1, affectsGrossProfit: true },
    { name: 'Direct Expenses', nature: 'EXPENSE', parent: 'Expenses', level: 1, affectsGrossProfit: true },
    { name: 'Indirect Expenses', nature: 'EXPENSE', parent: 'Expenses', level: 1, affectsGrossProfit: false },

    // Under Equity (Level 1)
    { name: 'Capital Account', nature: 'EQUITY', parent: 'Equity', level: 1 },
    { name: 'Reserves & Surplus', nature: 'EQUITY', parent: 'Equity', level: 1 },
];

// ============================================
// SEED FUNCTION
// ============================================

/**
 * Creates system groups for a company
 * Called when a new company is created
 */
export async function seedSystemGroups(
    companyId: string,
    createdBy: string = 'SYSTEM'
): Promise<void> {
    console.log(`Creating system groups for company: ${companyId}`);

    // Create a map to store group IDs for parent references
    const groupIdMap: Record<string, string> = {};

    // Step 1: Create Primary Groups (Level 0)
    for (const group of PRIMARY_GROUPS) {
        const created = await prisma.accountGroup.create({
            data: {
                companyId,
                name: group.name,
                nature: group.nature,
                groupType: group.groupType,
                level: group.level,
                isSystem: true,
                isActive: true,
                createdBy,
                updatedBy: createdBy,
            },
        });

        groupIdMap[group.name] = created.id;
        console.log(`  Created primary group: ${group.name}`);
    }

    // Step 2: Create Secondary Groups (Level 1 & 2)
    // Sort by level to ensure parents are created before children
    const sortedSecondary = [...SECONDARY_GROUPS].sort((a, b) => a.level - b.level);

    for (const group of sortedSecondary) {
        const parentId = groupIdMap[group.parent];

        if (!parentId) {
            console.warn(`  Warning: Parent group "${group.parent}" not found for "${group.name}"`);
            continue;
        }

        const created = await prisma.accountGroup.create({
            data: {
                companyId,
                name: group.name,
                nature: group.nature,
                groupType: 'SECONDARY',
                parentId,
                level: group.level,
                affectsGrossProfit: group.affectsGrossProfit || false,
                isSystem: true,
                isActive: true,
                createdBy,
                updatedBy: createdBy,
            },
        });

        groupIdMap[group.name] = created.id;
        console.log(`  Created secondary group: ${group.name}`);
    }

    console.log(`System groups created successfully for company: ${companyId}`);
    console.log(`Total groups created: ${Object.keys(groupIdMap).length}`);
}

/**
 * Get all primary groups for reference
 */
export function getPrimaryGroups() {
    return PRIMARY_GROUPS;
}

/**
 * Get all secondary groups for reference
 */
export function getSecondaryGroups() {
    return SECONDARY_GROUPS;
}

// ============================================
// STANDALONE EXECUTION
// ============================================

// This allows the script to be run directly for testing
if (require.main === module) {
    const testCompanyId = process.argv[2];

    if (!testCompanyId) {
        console.log('Usage: npx ts-node system-groups.seed.ts <companyId>');
        process.exit(1);
    }

    seedSystemGroups(testCompanyId)
        .then(() => {
            console.log('Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}
