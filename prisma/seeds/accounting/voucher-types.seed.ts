/**
 * Accounting Module Seed - Default Voucher Types
 * Creates the default voucher types when a new company is created
 */

import { PrismaClient, VoucherCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// DEFAULT VOUCHER TYPES
// ============================================

interface VoucherTypeDefinition {
    name: string;
    code: string;
    category: VoucherCategory;
    prefix: string;
    description: string;
}

const DEFAULT_VOUCHER_TYPES: VoucherTypeDefinition[] = [
    {
        name: 'Payment',
        code: 'PMT',
        category: 'PAYMENT',
        prefix: 'PMT/',
        description: 'For recording cash or bank payments made',
    },
    {
        name: 'Receipt',
        code: 'RCT',
        category: 'RECEIPT',
        prefix: 'RCT/',
        description: 'For recording cash or bank receipts received',
    },
    {
        name: 'Contra',
        code: 'CNT',
        category: 'CONTRA',
        prefix: 'CNT/',
        description: 'For bank to cash or cash to bank transfers',
    },
    {
        name: 'Journal',
        code: 'JNL',
        category: 'JOURNAL',
        prefix: 'JNL/',
        description: 'For adjustments and non-cash entries',
    },
    {
        name: 'Sales',
        code: 'SLS',
        category: 'SALES',
        prefix: 'SLS/',
        description: 'For recording sales transactions',
    },
    {
        name: 'Purchase',
        code: 'PUR',
        category: 'PURCHASE',
        prefix: 'PUR/',
        description: 'For recording purchase transactions',
    },
    {
        name: 'Debit Note',
        code: 'DN',
        category: 'DEBIT_NOTE',
        prefix: 'DN/',
        description: 'For purchase returns or additional charges',
    },
    {
        name: 'Credit Note',
        code: 'CN',
        category: 'CREDIT_NOTE',
        prefix: 'CN/',
        description: 'For sales returns or additional discounts',
    },
];

// ============================================
// SEED FUNCTION
// ============================================

/**
 * Creates default voucher types for a company
 * Called when a new company is created
 */
export async function seedVoucherTypes(companyId: string): Promise<void> {
    console.log(`Creating default voucher types for company: ${companyId}`);

    for (const voucherType of DEFAULT_VOUCHER_TYPES) {
        await prisma.voucherType.create({
            data: {
                companyId,
                name: voucherType.name,
                code: voucherType.code,
                category: voucherType.category,
                prefix: voucherType.prefix,
                startingNumber: 1,
                currentNumber: 1,
                isSystem: true,
                isActive: true,
            },
        });

        console.log(`  Created voucher type: ${voucherType.name} (${voucherType.code})`);
    }

    console.log(`Default voucher types created successfully for company: ${companyId}`);
    console.log(`Total voucher types created: ${DEFAULT_VOUCHER_TYPES.length}`);
}

/**
 * Get all default voucher types for reference
 */
export function getDefaultVoucherTypes() {
    return DEFAULT_VOUCHER_TYPES;
}

// ============================================
// STANDALONE EXECUTION
// ============================================

// This allows the script to be run directly for testing
if (require.main === module) {
    const testCompanyId = process.argv[2];

    if (!testCompanyId) {
        console.log('Usage: npx ts-node voucher-types.seed.ts <companyId>');
        process.exit(1);
    }

    seedVoucherTypes(testCompanyId)
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
