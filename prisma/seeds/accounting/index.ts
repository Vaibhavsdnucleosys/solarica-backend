/**
 * Accounting Module Seeds - Barrel Export
 */

export { seedSystemGroups, getPrimaryGroups, getSecondaryGroups } from './system-groups.seed';
export { seedVoucherTypes, getDefaultVoucherTypes } from './voucher-types.seed';

/**
 * Seeds all default data for a new company
 * This is the main function to call when a company is created
 */
import { seedSystemGroups } from './system-groups.seed';
import { seedVoucherTypes } from './voucher-types.seed';

export async function seedCompanyDefaults(
    companyId: string,
    createdBy: string = 'SYSTEM'
): Promise<void> {
    console.log(`\n========================================`);
    console.log(`Seeding default data for company: ${companyId}`);
    console.log(`========================================\n`);

    // Step 1: Create system groups (chart of accounts)
    await seedSystemGroups(companyId, createdBy);

    // Step 2: Create default voucher types
    await seedVoucherTypes(companyId);

    console.log(`\n========================================`);
    console.log(`Default data seeding completed!`);
    console.log(`========================================\n`);
}
