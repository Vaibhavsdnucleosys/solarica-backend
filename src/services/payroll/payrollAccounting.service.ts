import prisma from "../../config/prisma";
import { EntryType } from "@prisma/client";
import { createVoucherService } from "../accounting/voucher.service";
import { PF_CONSTANTS } from "./statutory/pf.service";

/**
 * Ensures "Payroll" voucher type exists for a company (System defined)
 */
export const ensurePayrollVoucherType = async (companyId: string) => {
    let voucherType = await prisma.voucherType.findFirst({
        where: {
            companyId,
            name: "Payroll",
            category: "JOURNAL"
        }
    });

    if (!voucherType) {
        voucherType = await prisma.voucherType.create({
            data: {
                companyId,
                name: "Payroll",
                code: "PAY",
                category: "JOURNAL",
                prefix: "PAY/",
                startingNumber: 1,
                currentNumber: 1,
                isSystem: true,
                isActive: true
            }
        });
    }

    return voucherType;
};

/**
 * Checks if the "Payroll" voucher type is locked for a company.
 * It is locked if any salary voucher has been APPROVED.
 */
export const isPayrollVoucherTypeLocked = async (companyId: string) => {
    const approvedVoucher = await prisma.salaryVoucher.findFirst({
        where: {
            companyId,
            status: "APPROVED"
        }
    });
    return !!approvedVoucher;
};

/**
 * Helper to find or create a ledger under a specific group name
 */
const findOrCreateLedger = async (companyId: string, name: string, groupName: string, userId: string = "system") => {
    let ledger = await prisma.ledger.findFirst({
        where: {
            companyId,
            name: { equals: name, mode: "insensitive" }
        }
    });

    if (ledger) return ledger;

    const group = await prisma.accountGroup.findFirst({
        where: {
            companyId,
            name: { equals: groupName, mode: "insensitive" }
        }
    });

    if (!group) {
        throw new Error(`Account Group "${groupName}" not found. Please ensure accounting is initialized.`);
    }

    return await prisma.ledger.create({
        data: {
            companyId,
            name,
            groupId: group.id,
            isActive: true,
            isSystem: true,
            createdBy: userId,
            updatedBy: userId
        }
    });
};

/**
 * Posts refined accounting entries for approved payroll (Strict PF & PT Scope)
 */
export const postPayrollJournal = async (companyId: string, month: number, year: number, userId: string) => {
    // 1. Fetch APPROVED vouchers
    const salaryVouchers = await prisma.salaryVoucher.findMany({
        where: {
            companyId,
            month,
            year,
            status: "APPROVED"
        },
        include: {
            items: {
                include: { payHead: true }
            }
        }
    });

    if (salaryVouchers.length === 0) {
        throw new Error("No approved salary vouchers found for the selected period.");
    }

    // 2. Duplicate Check
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, month - 1));
    const refKey = `Payroll ${monthName} ${year}`;
    const existing = await prisma.voucher.findFirst({
        where: { companyId, referenceNumber: refKey }
    });

    if (existing) {
        return existing; // Avoid duplicates
    }

    // 3. Aggregate PF & PT Totals
    let totalEEPF = 0;
    let totalEPF = 0;
    let totalEPS = 0;
    let totalPT = 0;

    for (const voucher of salaryVouchers) {
        for (const item of voucher.items) {
            const statType = item.payHead.statutoryType;
            const amt = item.amount.toNumber();

            switch (statType) {
                case PF_CONSTANTS.STATUTORY_TYPES.EMPLOYEE:
                    totalEEPF += amt;
                    break;
                case PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPF:
                    totalEPF += amt;
                    break;
                case PF_CONSTANTS.STATUTORY_TYPES.EMPLOYER_EPS:
                    totalEPS += amt;
                    break;
                case "PT":
                    totalPT += amt;
                    break;
            }
        }
    }

    // 4. Resolve Ledgers
    const lSalaryPayable = await findOrCreateLedger(companyId, "Salary Payable", "Provisions", userId);
    const lERPFExp = await findOrCreateLedger(companyId, "Employer PF Expense", "Indirect Expenses", userId);

    const lEEPFPayable = await findOrCreateLedger(companyId, "Provident Fund Payable", "Duties & Taxes", userId);
    const lEPFPayable = await findOrCreateLedger(companyId, "Employer EPF Payable", "Duties & Taxes", userId);
    const lEPSPayable = await findOrCreateLedger(companyId, "Employer EPS Payable", "Duties & Taxes", userId);
    const lPTPayable = await findOrCreateLedger(companyId, "Professional Tax Payable", "Duties & Taxes", userId);

    // 5. Build Balanced Entries
    const entries: any[] = [];

    // --- Employee Deductions ---
    // Dr Salary Payable
    // Cr PF Payable & PT Payable
    if (totalEEPF > 0 || totalPT > 0) {
        entries.push({ ledgerId: lSalaryPayable.id, entryType: EntryType.DEBIT, amount: totalEEPF + totalPT, description: `Statutory Deductions ${monthName} ${year}` });
        if (totalEEPF > 0) entries.push({ ledgerId: lEEPFPayable.id, entryType: EntryType.CREDIT, amount: totalEEPF, description: `EE PF Deduction` });
        if (totalPT > 0) entries.push({ ledgerId: lPTPayable.id, entryType: EntryType.CREDIT, amount: totalPT, description: `Professional Tax` });
    }

    // --- Employer Contributions ---
    // Dr Employer PF Expense
    // Cr Employer EPF Payable & Employer EPS Payable
    if (totalEPF > 0 || totalEPS > 0) {
        entries.push({ ledgerId: lERPFExp.id, entryType: EntryType.DEBIT, amount: totalEPF + totalEPS, description: `Employer PF Contribution ${monthName} ${year}` });
        if (totalEPF > 0) entries.push({ ledgerId: lEPFPayable.id, entryType: EntryType.CREDIT, amount: totalEPF, description: `ER EPF Share` });
        if (totalEPS > 0) entries.push({ ledgerId: lEPSPayable.id, entryType: EntryType.CREDIT, amount: totalEPS, description: `ER EPS Share` });
    }

    if (entries.length === 0) {
        return null; // Nothing to post
    }

    // 6. Post
    const voucherType = await ensurePayrollVoucherType(companyId);
    const periodEnd = new Date(year, month, 0);

    return await createVoucherService(companyId, userId, {
        voucherTypeId: voucherType.id,
        voucherDate: periodEnd,
        referenceNumber: refKey,
        narration: `PF & PT Provisions for ${monthName} ${year}`,
        status: "POSTED",
        entries
    });
};

