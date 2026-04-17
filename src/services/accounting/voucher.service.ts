/**
 * Voucher Service
 * Core accounting logic for transactions
 */

import prisma from '../../config/prisma';
import {
    createVoucherModel,
    getVoucherByIdModel,
    getVouchersModel,
    getNextVoucherSequenceModel
} from '../../api/model/accounting/voucher.model';
import { getLedgerByIdModel } from '../../api/model/accounting/ledger.model';
import { validateCompanyAccessService } from './company.service';
import { ACCOUNTING_ERRORS } from '../../utils/accounting/constants';
import { EntryType, BalanceType } from '@prisma/client';
import { getFinancialYearByDateModel } from '../../api/model/accounting/financial-year.model';


/**
 * Create and post a voucher
 * This is the heart of the double-entry system
 */
export const createVoucherService = async (
    companyId: string,
    userId: string,
    data: any
) => {
    // 1. Security Check
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    // 2. Double Entry Validation
    const totalDebit = data.entries
        .filter((e: any) => e.entryType === EntryType.DEBIT)
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    const totalCredit = data.entries
        .filter((e: any) => e.entryType === EntryType.CREDIT)
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Voucher is not balanced. Total Debits must equal Total Credits.');
    }

    // Resolve Financial Year from voucher date
    const financialYear = await getFinancialYearByDateModel(
        companyId,
        new Date(data.voucherDate)
    );

    if (!financialYear) {
        throw new Error('No financial year found for voucher date');
    }

    // 2.5 Generate Invoice Number for Sales Vouchers
    let generatedInvoiceNumber: string | null = null;
    const vType = await prisma.voucherType.findUnique({
        where: { id: data.voucherTypeId },
        include: { company: true }
    });

    if (vType?.category === 'SALES') {
        generatedInvoiceNumber = await generateInvoiceNumberForCompany(companyId, vType.company.name);
    }






    // 3. Process in Transaction
    return await prisma.$transaction(async (tx) => {
        // A. Generate Voucher Number
        const voucherNumber = await getNextVoucherSequenceModel(data.voucherTypeId, tx);

        // B. Create the Voucher and Entries
        const voucher = await createVoucherModel({
            ...data,
            companyId,
            financialYearId: financialYear.id,
            voucherNumber,
            invoiceNumber: generatedInvoiceNumber || data.invoiceNumber || null,
            totalDebit,
            totalCredit,
            createdBy: userId,
        }, tx);

        // C. Update Ledger Balances
        for (const entry of data.entries) {
            const ledger = await tx.ledger.findUnique({
                where: { id: entry.ledgerId },
                include: { group: true }
            });

            if (!ledger) throw new Error(`Ledger ${entry.ledgerId} not found`);

            // SECURITY CHECK: Does this ledger belong to THIS company?
            if (ledger.companyId !== companyId) {
                throw new Error(`Unauthorized ledger access: Ledger ${ledger.name} does not belong to this company.`);
            }

            // Calculate new current balance using signed arithmetic
            // Strategy: DEBIT is (+), CREDIT is (-)
            let currentSignedBalance = Number(ledger.currentBalance);
            if (ledger.currentBalanceType === BalanceType.CREDIT) {
                currentSignedBalance = -currentSignedBalance;
            }

            // Apply entry change
            const amount = Number(entry.amount);
            if (entry.entryType === EntryType.DEBIT) {
                currentSignedBalance += amount;
            } else {
                currentSignedBalance -= amount;
            }

            // Map back to magnitude and BalanceType
            const finalMagnitude = Math.abs(currentSignedBalance);
            const finalType = currentSignedBalance >= 0 ? BalanceType.DEBIT : BalanceType.CREDIT;

            await tx.ledger.update({
                where: { id: entry.ledgerId },
                data: {
                    currentBalance: finalMagnitude,
                    currentBalanceType: finalType
                }
            });
        }

        // D. Audit Log
        await tx.accountingAuditLog.create({
            data: {
                companyId,
                entityType: 'Voucher',
                entityId: voucher.id,
                action: 'CREATE',
                performedBy: userId,
                description: `Created ${voucher.voucherType.name} voucher ${voucherNumber}`,
            }
        });

        return voucher;
    }, {
        timeout: 10000 // Extended timeout for complex double-entry updates
    });
};

/**
 * Post a draft voucher
 * Changes status from DRAFT → POSTED
 */
export const postVoucherService = async (
    voucherId: string,
    userId: string
) => {
    // 1. Fetch voucher
    const voucher = await prisma.voucher.findUnique({
        where: { id: voucherId },
        include: { entries: true },
    });

    if (!voucher) {
        throw new Error('Voucher not found');
    }

    // 2. Only DRAFT vouchers can be posted
    if (voucher.status !== 'DRAFT') {
        throw new Error('Only draft vouchers can be posted');
    }

    // 3. Validate entries
    if (!voucher.entries || voucher.entries.length === 0) {
        throw new Error('Cannot post voucher without entries');
    }

    // 4. Update status → POSTED
    const postedVoucher = await prisma.voucher.update({
        where: { id: voucherId },
        data: {
            status: 'POSTED',
            postedAt: new Date(),
            postedBy: userId,
            updatedBy: userId,
        },
        include: {
            entries: {
                include: { ledger: true },
            },
            voucherType: true,
        },
    });

    return postedVoucher;
};


/**
 * Get all vouchers for a company
 */
export const getVouchersService = async (companyId: string, userId: string, filters: any) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    return await getVouchersModel({ ...filters, companyId });
};

/**
 * Get single voucher details
 */
export const getVoucherByIdService = async (voucherId: string, userId: string) => {
    const voucher = await getVoucherByIdModel(voucherId);
    if (!voucher) throw new Error('Voucher not found');

    const hasAccess = await validateCompanyAccessService(voucher.companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    return voucher;
    return voucher;
};

/**
 * Update a voucher
 * Strategy: Revert old balances -> Update Voucher -> Delete Old Entries -> Create New Entries -> Apply New Balances
 */
export const updateVoucherService = async (
    voucherId: string,
    userId: string,
    data: any
) => {
    // 1. Validation
    const oldVoucher = await getVoucherByIdModel(voucherId);
    if (!oldVoucher) throw new Error('Voucher not found');

    const hasAccess = await validateCompanyAccessService(oldVoucher.companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    if (oldVoucher.status === 'POSTED' && data.status === 'DRAFT') {
        // Converting POSTED to DRAFT? Might need special handling, but for now allow it effectively un-posting it in terms of business logic, 
        // but technically we re-calculate everything anyway.
    }

    // Double Entry Validation for NEW data
    const totalDebit = data.entries
        .filter((e: any) => e.entryType === EntryType.DEBIT)
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    const totalCredit = data.entries
        .filter((e: any) => e.entryType === EntryType.CREDIT)
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Voucher is not balanced. Total Debits must equal Total Credits.');
    }

    return await prisma.$transaction(async (tx) => {
        // A. Revert OLD Balances
        // Iterate through simplified old entries (we need to know ledgerId, amount, entryType)
        for (const entry of oldVoucher.entries) {
            await updateLedgerBalanceHelper(tx, oldVoucher.companyId, entry.ledgerId, Number(entry.amount), entry.entryType, true);
        }

        // B. Update Voucher Core Data
        await import('../../api/model/accounting/voucher.model').then(m => m.updateVoucherModel(voucherId, {
            ...data,
            companyId: oldVoucher.companyId, // Ensure companyId doesn't change
            voucherNumber: oldVoucher.voucherNumber, // Usually number shouldn't change, OR data.voucherNumber if allowed
            totalDebit,
            totalCredit,
            updatedBy: userId,
            entries: undefined // Don't update entries via this call yet
        }, tx));

        // C. Replace Entries
        // Delete old
        await tx.voucherEntry.deleteMany({
            where: { voucherId }
        });

        // Create new
        await tx.voucherEntry.createMany({
            data: data.entries.map((entry: any) => ({
                companyId: oldVoucher.companyId,
                voucherId: voucherId,
                ledgerId: entry.ledgerId,
                entryType: entry.entryType,
                amount: entry.amount,
                description: entry.description,
            }))
        });

        // Delete old items
        await tx.voucherItem.deleteMany({
            where: { voucherId }
        });

        // Create new items if present
        if (data.items && data.items.length > 0) {
            await tx.voucherItem.createMany({
                data: data.items.map((item: any) => ({
                    voucherId: voucherId,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                }))
            });
        }

        // D. Apply NEW Balances
        for (const entry of data.entries) {
            await updateLedgerBalanceHelper(tx, oldVoucher.companyId, entry.ledgerId, Number(entry.amount), entry.entryType, false);
        }

        // E. Audit Log
        await tx.accountingAuditLog.create({
            data: {
                companyId: oldVoucher.companyId,
                entityType: 'Voucher',
                entityId: voucherId,
                action: 'UPDATE',
                performedBy: userId,
                description: `Updated voucher ${oldVoucher.voucherNumber}`,
            }
        });

        // Return updated voucher
        return await tx.voucher.findUnique({
            where: { id: voucherId },
            include: { entries: true }
        });
    }, {
        timeout: 10000
    });
};

/**
 * Delete a voucher
 */
export const deleteVoucherService = async (voucherId: string, userId: string) => {
    // 1. Validation
    const voucher = await getVoucherByIdModel(voucherId);
    if (!voucher) throw new Error('Voucher not found');

    const hasAccess = await validateCompanyAccessService(voucher.companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    return await prisma.$transaction(async (tx) => {
        // A. Revert Balances
        for (const entry of voucher.entries) {
            await updateLedgerBalanceHelper(tx, voucher.companyId, entry.ledgerId, Number(entry.amount), entry.entryType, true);
        }

        // B. Delete Voucher (Cascade deletes entries)
        await import('../../api/model/accounting/voucher.model').then(m => m.deleteVoucherModel(voucherId, tx));

        // C. Audit Log
        await tx.accountingAuditLog.create({
            data: {
                companyId: voucher.companyId,
                entityType: 'Voucher',
                entityId: voucherId,
                action: 'DELETE',
                performedBy: userId,
                description: `Deleted voucher ${voucher.voucherNumber}`,
            }
        });

        return { success: true, message: 'Voucher deleted successfully' };
    });
};


/**
 * Helper: Update Ledger Balance (Shared Logic)
 * isReversal = true means we are REMOVING the effect of this entry (e.g. deleting voucher or updating old values)
 */
const updateLedgerBalanceHelper = async (
    tx: any,
    companyId: string,
    ledgerId: string,
    amount: number,
    entryType: EntryType,
    isReversal: boolean
) => {
    const ledger = await tx.ledger.findUnique({
        where: { id: ledgerId },
        include: { group: true }
    });

    if (!ledger) throw new Error(`Ledger ${ledgerId} not found`);
    if (ledger.companyId !== companyId) throw new Error(`Unauthorized ledger access`);

    let newBalance = Number(ledger.currentBalance);

    // Nature Mapping
    const nature = ledger.group.nature;
    const isNormalDebit = nature === 'ASSET' || nature === 'EXPENSE';

    // Logic Matrix
    // Normal Debit (Asset): Debit(+) Credit(-)
    // Normal Credit (Liab): Credit(+) Debit(-)

    // If Reversal, flip the valid amount sign effectively
    // Instead of complex if-else nests, let's define "Impact"
    // Impact = +1 (Increase Balance) or -1 (Decrease Balance)

    let impact = 0; // 1 or -1

    if (isNormalDebit) {
        if (entryType === EntryType.DEBIT) impact = 1;
        else impact = -1;
    } else {
        if (entryType === EntryType.CREDIT) impact = 1;
        else impact = -1;
    }

    if (isReversal) {
        impact = impact * -1; // Flip impact
    }

    // Apply
    if (impact === 1) {
        newBalance += amount;
    } else {
        newBalance -= amount;
    }

    // Handle Balance Type Flip (e.g. Bank going negative)
    let newType: BalanceType = ledger.currentBalanceType;

    // Note: The system stores balance as absolute positive number with a Type flag?
    // Let's check existing create logic:
    // "if (newBalance < 0) ... newBalance = Math.abs(newBalance)"
    // This implies ledger.currentBalance is always positive absolute value.

    // Wait, if I simply do `newBalance += amount`, and currentBalance was 100 Dr, and I credit 200...
    // My logic above assumes newBalance is a signed integer?
    // No, the existing code:
    // "let newBalance = Number(ledger.currentBalance);"
    // "newBalance = entry.entryType === EntryType.DEBIT ? newBalance + ... : newBalance - ..."
    // This implies `ledger.currentBalance` *conceptually* follows the `currentBalanceType`?
    // Actually NO. The existing code says:
    // type: CREDIT, bal: 100.
    // If I Debit 50 (Liability Decrease).
    // existing logic: "Liability ... Debit - ... newBalance - amount".
    // So 100 - 50 = 50. Correct.

    // But what if type: DEBIT, bal: 100.
    // Debit 50.
    // existing logic: "Asset ... Debit + ... 100 + 50 = 150". Correct.

    // The issue is if the Type flips.
    // Existing logic:
    /*
        let newType: BalanceType = ledger.currentBalanceType;
        if (newBalance < 0) {
            newType = ledger.currentBalanceType === BalanceType.DEBIT 
                ? BalanceType.CREDIT 
                : BalanceType.DEBIT;
            newBalance = Math.abs(newBalance);
        }
    */
    // This checks if the mathematical operation resulted in a negative value relative to its "Normal" state?
    // No, relative to its CURRENT state.

    // CRITICAL CORRECTION:
    // The existing logic inside `createVoucherService` assumes `ledger.currentBalance` is the magnitude.
    // And it assumes the operation (+ or -) is applied relative to the `currentBalanceType`.
    // Wait, the existing code looked at `ledger.group.nature` (Normal Debit vs Normal Credit).
    // And assumed if `isNormalDebit` (Asset), then Debit increases.
    // It DID NOT seemingly check `ledger.currentBalanceType` to decide + or -.
    // It calculated `newBalance` purely based on Group Nature.

    // LET'S TRACE the existing code bug/feature:
    /*
            const nature = ledger.group.nature;
            const isNormalDebit = nature === 'ASSET' || nature === 'EXPENSE';

            if (isNormalDebit) {
                // Asset/Expense: Debit +, Credit -
                newBalance = entry.entryType === EntryType.DEBIT
                    ? newBalance + Number(entry.amount)
                    : newBalance - Number(entry.amount);
            }
    */
    // If I have an Asset (Bank) with Overdraft (Credit Balance of 100).
    // `isNormalDebit` is TRUE.
    // If I DEBIT 50 (Deposit money).
    // `newBalance = 100 + 50 = 150`.
    // RESULT: Credit Balance 150. (WRONG).
    // Deposits should REDUCE the overdraft (Credit Balance).

    // CONCLUSION: The existing `createVoucherService` logic might be FLAGGING incorrect behavior for abnormal balances?
    // OR `ledger.currentBalance` is signed?
    // Schema says: `currentBalance Decimal @default(0)`. `currentBalanceType BalanceType`.
    // Usually in these systems, if Type is opposite to Nature, it's effectively negative.

    // I MUST handle this correctly in my helper.
    // I should probably follow the "Signed Balance" approach for calculation, then convert back to Mag+Type.

    // Standardize: DEBIT is Positive (+), CREDIT is Negative (-).

    // 1. Get Current Signed Balance
    let currentSignedBalance = Number(ledger.currentBalance);
    if (ledger.currentBalanceType === BalanceType.CREDIT) {
        currentSignedBalance = -currentSignedBalance;
    }

    // 2. Apply Change (Debit +, Credit -)
    // If Reversal, invert the change.
    let change = amount;
    if (entryType === EntryType.CREDIT) change = -change;
    if (isReversal) change = -change;

    const finalSignedBalance = currentSignedBalance + change;

    // 3. Convert back to Mag + Type
    const finalMagnitude = Math.abs(finalSignedBalance);
    const finalType = finalSignedBalance >= 0 ? BalanceType.DEBIT : BalanceType.CREDIT;

    // Update
    await tx.ledger.update({
        where: { id: ledgerId },
        data: {
            currentBalance: finalMagnitude,
            currentBalanceType: finalType
        }
    });
};
/**
 * Generate Invoice Number for Company
 * Format: [PREFIX]-[YY][SEQUENCE]
 */
async function generateInvoiceNumberForCompany(companyId: string, companyName: string): Promise<string | null> {
    const prefixes: Record<string, string> = {
        'systems': 'SSPL',
        'energy': 'SEPL',
        'fabtech': 'SFPL',
        'industry': 'SIPL',
        'industries': 'SIPL',
        'greenwheels': 'SGPL',
        'solarica': 'SEPL',
        'ulhasnagar': 'SEPL'
    };

    let prefix = 'INV';
    const lowerName = companyName.toLowerCase();
    for (const [key, val] of Object.entries(prefixes)) {
        if (lowerName.includes(key)) {
            prefix = val;
            break;
        }
    }

    const yearPart = new Date().getFullYear().toString().slice(-2);
    const searchPrefix = `${prefix}-${yearPart}`;

    // Find the latest invoice number for this company and year
    const lastVoucher = await prisma.voucher.findFirst({
        where: {
            companyId,
            invoiceNumber: {
                startsWith: searchPrefix
            }
        },
        orderBy: {
            invoiceNumber: 'desc'
        }
    });

    let nextSeq = 1;
    if (lastVoucher && lastVoucher.invoiceNumber) {
        const lastPart = lastVoucher.invoiceNumber.slice(searchPrefix.length);
        const lastNum = parseInt(lastPart, 10);
        if (!isNaN(lastNum)) {
            nextSeq = lastNum + 1;
        }
    }

    return `${searchPrefix}${nextSeq.toString().padStart(2, '0')}`;
}

/**
 * Get available invoice numbers for delivery challan
 * Returns sales vouchers that don't have a linked invoice yet
 */
export const getAvailableInvoiceNumbersService = async (companyId: string, userId: string) => {
    // Get all companies this user has access to
    const userCompanies = await prisma.companyUser.findMany({
        where: { userId }
    });
    const companyIds = userCompanies.map(uc => uc.companyId);

    // If companyId is provided and user has access to it, ensure it's in the list
    if (companyId && !companyIds.includes(companyId)) {
        const hasSpecificAccess = await validateCompanyAccessService(companyId, userId);
        if (hasSpecificAccess) companyIds.push(companyId);
    }

    const vouchers = await prisma.voucher.findMany({
        where: {
            companyId: { in: companyIds },
            invoiceNumber: { not: null },
            voucherType: { category: 'SALES' }
        },
        select: {
            id: true,
            invoiceNumber: true,
            partyLedgerId: true,
            voucherDate: true,
            totalDebit: true,
            companyId: true,
            company: {
                select: { name: true }
            },
            Ledger: {
                select: { name: true, address: true, phone: true, gstin: true }
            }
        },
        orderBy: {
            invoiceNumber: 'desc'
        }
    });

    return vouchers;
};

/**
 * Get voucher details by invoice number for auto-fill
 */
export const getVoucherByInvoiceNumberService = async (companyId: string, userId: string, invoiceNumber: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    const voucher = await prisma.voucher.findFirst({
        where: {
            companyId,
            invoiceNumber
        },
        include: {
            entries: { include: { ledger: true } },
            VoucherItem: true,
            Ledger: true
        }
    });

    if (!voucher) throw new Error('Voucher not found');

    // Attempt to find source Proforma Invoice from narration
    let sourcePI = null;
    if (voucher.narration) {
        // Look for pattern "Based on Proforma Invoice: SEI-2613" or similar
        const piMatch = voucher.narration.match(/Proforma Invoice:?\s*([A-Z0-9-]+)/i);
        if (piMatch && piMatch[1]) {
            const piNumber = piMatch[1].trim();
            sourcePI = await prisma.invoice.findFirst({
                where: {
                    invoiceNumber: piNumber,
                    isProforma: true
                }
            });
        }
    }

    return {
        ...voucher,
        sourcePI
    };
};

