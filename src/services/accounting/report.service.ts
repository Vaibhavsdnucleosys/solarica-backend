/**
 * Report Service
 * Calculations for Trial Balance, P&L, Balance Sheet, and Ledger Statements
 */

import prisma from '../../config/prisma';
import { validateCompanyAccessService } from './company.service';
import { ACCOUNTING_ERRORS } from '../../utils/accounting/constants';
import { AccountNature, BalanceType } from '@prisma/client';

/**
 * Trial Balance
 * Returns a summary of all ledgers grouped by their primary nature
 */
export const getTrialBalanceService = async (companyId: string, userId: string) => {
    // 1. Security Check
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    // 2. Fetch all groups and ledgers
    const groups = await prisma.accountGroup.findMany({
        where: { companyId, isActive: true },
        include: {
            ledgers: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    currentBalance: true,
                    currentBalanceType: true
                }
            }
        }
    });

    // 3. Aggregate by Nature
    const report: any = {
        ASSET: { groups: [], totalDebit: 0, totalCredit: 0 },
        LIABILITY: { groups: [], totalDebit: 0, totalCredit: 0 },
        INCOME: { groups: [], totalDebit: 0, totalCredit: 0 },
        EXPENSE: { groups: [], totalDebit: 0, totalCredit: 0 },
        EQUITY: { groups: [], totalDebit: 0, totalCredit: 0 }
    };

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    groups.forEach(group => {
        const groupData = {
            id: group.id,
            name: group.name,
            ledgers: group.ledgers.map(l => ({
                id: l.id,
                name: l.name,
                debit: l.currentBalanceType === 'DEBIT' ? Number(l.currentBalance) : 0,
                credit: l.currentBalanceType === 'CREDIT' ? Number(l.currentBalance) : 0
            }))
        };

        const groupDebit = groupData.ledgers.reduce((sum, l) => sum + l.debit, 0);
        const groupCredit = groupData.ledgers.reduce((sum, l) => sum + l.credit, 0);

        const target = report[group.nature];
        if (target) {
            target.groups.push({ ...groupData, totalDebit: groupDebit, totalCredit: groupCredit });
            target.totalDebit += groupDebit;
            target.totalCredit += groupCredit;

            grandTotalDebit += groupDebit;
            grandTotalCredit += groupCredit;
        }
    });

    return {
        summary: report,
        grandTotals: {
            debit: grandTotalDebit,
            credit: grandTotalCredit,
            difference: Math.abs(grandTotalDebit - grandTotalCredit),
            isBalanced: Math.abs(grandTotalDebit - grandTotalCredit) < 0.01
        }
    };
};

/**
 * Profit & Loss Statement
 */
export const getProfitAndLossService = async (companyId: string, userId: string, startDate?: Date, endDate?: Date) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    // For a simple P&L, we look at current balances of Income and Expenses
    // In a more advanced P&L, we would sum voucher entries between startDate and endDate

    const ledgers = await prisma.ledger.findMany({
        where: {
            companyId,
            isActive: true,
            group: {
                nature: { in: ['INCOME', 'EXPENSE'] }
            }
        },
        include: {
            group: true
        }
    });

    let totalDirectIncome = 0;
    let totalIndirectIncome = 0;
    let totalDirectExpense = 0;
    let totalIndirectExpense = 0;

    const sections: any = {
        directIncome: [],
        indirectIncome: [],
        directExpense: [],
        indirectExpense: []
    };

    ledgers.forEach(ledger => {
        const amount = Number(ledger.currentBalance);
        const item = { id: ledger.id, name: ledger.name, amount };

        if (ledger.group.nature === 'INCOME') {
            if (ledger.group.affectsGrossProfit) {
                totalDirectIncome += amount;
                sections.directIncome.push(item);
            } else {
                totalIndirectIncome += amount;
                sections.indirectIncome.push(item);
            }
        } else { // EXPENSE
            if (ledger.group.affectsGrossProfit) {
                totalDirectExpense += amount;
                sections.directExpense.push(item);
            } else {
                totalIndirectExpense += amount;
                sections.indirectExpense.push(item);
            }
        }
    });

    const grossProfit = totalDirectIncome - totalDirectExpense;
    const netProfit = (grossProfit + totalIndirectIncome) - totalIndirectExpense;

    return {
        sections,
        calculations: {
            totalDirectIncome,
            totalDirectExpense,
            grossProfit,
            totalIndirectIncome,
            totalIndirectExpense,
            netProfit,
            isLoss: netProfit < 0
        }
    };
};

/**
 * Balance Sheet - Schedule III (Companies Act 2013) Format
 * Returns data structured for statutory Balance Sheet presentation
 */
export const getBalanceSheetService = async (
    companyId: string,
    userId: string,
    asOnDate?: Date
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    // Get company info for financial year
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, financialYearStart: true, booksBeginningFrom: true }
    });

    // Get P&L for Net Profit (Reserves & Surplus)
    const pandl = await getProfitAndLossService(companyId, userId);
    const netProfit = pandl.calculations.netProfit;

    // Get all ledgers with their groups for categorization
    const ledgers = await prisma.ledger.findMany({
        where: {
            companyId,
            isActive: true,
            group: {
                nature: { in: ['ASSET', 'LIABILITY', 'EQUITY'] }
            }
        },
        include: {
            group: {
                include: {
                    parent: true
                }
            }
        }
    });

    // Helper to calculate ledger value based on nature
    const calculateValue = (ledger: any): number => {
        const amount = Number(ledger.currentBalance);
        if (ledger.group.nature === 'ASSET' && ledger.currentBalanceType === 'CREDIT') return -amount;
        if (ledger.group.nature !== 'ASSET' && ledger.currentBalanceType === 'DEBIT') return -amount;
        return amount;
    };

    // Categorize ledgers into Schedule III format
    // A. EQUITY AND LIABILITIES
    const shareholdersFunds = {
        shareCapital: { items: [] as any[], total: 0, noteNo: 1 },
        reservesAndSurplus: { items: [] as any[], total: 0, noteNo: 2 },
        moneyReceivedAgainstShareWarrants: { items: [] as any[], total: 0, noteNo: null }
    };

    const nonCurrentLiabilities = {
        longTermBorrowings: { items: [] as any[], total: 0, noteNo: 3 },
        deferredTaxLiabilities: { items: [] as any[], total: 0, noteNo: null },
        otherLongTermLiabilities: { items: [] as any[], total: 0, noteNo: null },
        longTermProvisions: { items: [] as any[], total: 0, noteNo: null }
    };

    const currentLiabilities = {
        shortTermBorrowings: { items: [] as any[], total: 0, noteNo: null },
        tradePayables: { items: [] as any[], total: 0, noteNo: 4 },
        otherCurrentLiabilities: { items: [] as any[], total: 0, noteNo: 5 },
        shortTermProvisions: { items: [] as any[], total: 0, noteNo: 6 }
    };

    // B. ASSETS
    const nonCurrentAssets = {
        fixedAssets: {
            tangibleAssets: { items: [] as any[], total: 0, noteNo: 7 },
            intangibleAssets: { items: [] as any[], total: 0, noteNo: null },
            capitalWorkInProgress: { items: [] as any[], total: 0, noteNo: null },
            intangibleAssetsUnderDevelopment: { items: [] as any[], total: 0, noteNo: null },
            fixedAssetsHeldForSale: { items: [] as any[], total: 0, noteNo: null }
        },
        nonCurrentInvestments: { items: [] as any[], total: 0, noteNo: null },
        deferredTaxAssets: { items: [] as any[], total: 0, noteNo: null },
        longTermLoansAndAdvances: { items: [] as any[], total: 0, noteNo: 8 },
        otherNonCurrentAssets: { items: [] as any[], total: 0, noteNo: null }
    };

    const currentAssets = {
        currentInvestments: { items: [] as any[], total: 0, noteNo: null },
        inventories: { items: [] as any[], total: 0, noteNo: 9 },
        tradeReceivables: { items: [] as any[], total: 0, noteNo: 10 },
        cashAndCashEquivalents: { items: [] as any[], total: 0, noteNo: 11 },
        shortTermLoansAndAdvances: { items: [] as any[], total: 0, noteNo: 12 },
        otherCurrentAssets: { items: [] as any[], total: 0, noteNo: 13 }
    };

    // Categorize each ledger based on group name patterns
    ledgers.forEach(ledger => {
        const val = calculateValue(ledger);
        const groupName = ledger.group.name.toLowerCase();
        const parentName = ledger.group.parent?.name?.toLowerCase() || '';
        const item = { id: ledger.id, name: ledger.name, amount: val };

        // EQUITY categorization
        if (ledger.group.nature === 'EQUITY') {
            if (groupName.includes('capital') || groupName.includes('share capital')) {
                shareholdersFunds.shareCapital.items.push(item);
                shareholdersFunds.shareCapital.total += val;
            } else if (groupName.includes('reserve') || groupName.includes('surplus') || groupName.includes('retained')) {
                shareholdersFunds.reservesAndSurplus.items.push(item);
                shareholdersFunds.reservesAndSurplus.total += val;
            } else {
                // Default equity to reserves
                shareholdersFunds.reservesAndSurplus.items.push(item);
                shareholdersFunds.reservesAndSurplus.total += val;
            }
        }

        // LIABILITY categorization
        if (ledger.group.nature === 'LIABILITY') {
            if (groupName.includes('loan') || groupName.includes('borrowing')) {
                if (groupName.includes('short') || groupName.includes('current')) {
                    currentLiabilities.shortTermBorrowings.items.push(item);
                    currentLiabilities.shortTermBorrowings.total += val;
                } else {
                    nonCurrentLiabilities.longTermBorrowings.items.push(item);
                    nonCurrentLiabilities.longTermBorrowings.total += val;
                }
            } else if (groupName.includes('sundry creditor') || groupName.includes('trade payable') || groupName.includes('payable')) {
                currentLiabilities.tradePayables.items.push(item);
                currentLiabilities.tradePayables.total += val;
            } else if (groupName.includes('provision')) {
                if (groupName.includes('long') || groupName.includes('non-current')) {
                    nonCurrentLiabilities.longTermProvisions.items.push(item);
                    nonCurrentLiabilities.longTermProvisions.total += val;
                } else {
                    currentLiabilities.shortTermProvisions.items.push(item);
                    currentLiabilities.shortTermProvisions.total += val;
                }
            } else if (groupName.includes('deferred tax')) {
                nonCurrentLiabilities.deferredTaxLiabilities.items.push(item);
                nonCurrentLiabilities.deferredTaxLiabilities.total += val;
            } else if (groupName.includes('duties') || groupName.includes('other current')) {
                currentLiabilities.otherCurrentLiabilities.items.push(item);
                currentLiabilities.otherCurrentLiabilities.total += val;
            } else {
                // Default liabilities to other current liabilities
                currentLiabilities.otherCurrentLiabilities.items.push(item);
                currentLiabilities.otherCurrentLiabilities.total += val;
            }
        }

        // ASSET categorization
        if (ledger.group.nature === 'ASSET') {
            if (groupName.includes('fixed asset') || groupName.includes('tangible') || groupName.includes('property') || groupName.includes('plant') || groupName.includes('equipment') || groupName.includes('furniture')) {
                nonCurrentAssets.fixedAssets.tangibleAssets.items.push(item);
                nonCurrentAssets.fixedAssets.tangibleAssets.total += val;
            } else if (groupName.includes('intangible') || groupName.includes('goodwill') || groupName.includes('patent') || groupName.includes('trademark')) {
                nonCurrentAssets.fixedAssets.intangibleAssets.items.push(item);
                nonCurrentAssets.fixedAssets.intangibleAssets.total += val;
            } else if (groupName.includes('capital work')) {
                nonCurrentAssets.fixedAssets.capitalWorkInProgress.items.push(item);
                nonCurrentAssets.fixedAssets.capitalWorkInProgress.total += val;
            } else if (groupName.includes('investment') && !groupName.includes('current')) {
                nonCurrentAssets.nonCurrentInvestments.items.push(item);
                nonCurrentAssets.nonCurrentInvestments.total += val;
            } else if (groupName.includes('deferred tax asset')) {
                nonCurrentAssets.deferredTaxAssets.items.push(item);
                nonCurrentAssets.deferredTaxAssets.total += val;
            } else if (groupName.includes('inventory') || groupName.includes('stock')) {
                currentAssets.inventories.items.push(item);
                currentAssets.inventories.total += val;
            } else if (groupName.includes('sundry debtor') || groupName.includes('trade receivable') || groupName.includes('receivable')) {
                currentAssets.tradeReceivables.items.push(item);
                currentAssets.tradeReceivables.total += val;
            } else if (groupName.includes('cash') || groupName.includes('bank') || ledger.isCashAccount || ledger.isBankAccount) {
                currentAssets.cashAndCashEquivalents.items.push(item);
                currentAssets.cashAndCashEquivalents.total += val;
            } else if (groupName.includes('loan') || groupName.includes('advance')) {
                if (groupName.includes('long') || groupName.includes('non-current')) {
                    nonCurrentAssets.longTermLoansAndAdvances.items.push(item);
                    nonCurrentAssets.longTermLoansAndAdvances.total += val;
                } else {
                    currentAssets.shortTermLoansAndAdvances.items.push(item);
                    currentAssets.shortTermLoansAndAdvances.total += val;
                }
            } else if (groupName.includes('current investment')) {
                currentAssets.currentInvestments.items.push(item);
                currentAssets.currentInvestments.total += val;
            } else {
                // Default assets to other current assets
                currentAssets.otherCurrentAssets.items.push(item);
                currentAssets.otherCurrentAssets.total += val;
            }
        }
    });

    // Add Net Profit to Reserves & Surplus (P&L Account)
    if (netProfit !== 0) {
        shareholdersFunds.reservesAndSurplus.items.push({
            id: 'net-profit',
            name: 'Profit & Loss Account (Current Year)',
            amount: netProfit
        });
        shareholdersFunds.reservesAndSurplus.total += netProfit;
    }

    // Calculate section totals
    const totalShareholdersFunds =
        shareholdersFunds.shareCapital.total +
        shareholdersFunds.reservesAndSurplus.total +
        shareholdersFunds.moneyReceivedAgainstShareWarrants.total;

    const totalNonCurrentLiabilities =
        nonCurrentLiabilities.longTermBorrowings.total +
        nonCurrentLiabilities.deferredTaxLiabilities.total +
        nonCurrentLiabilities.otherLongTermLiabilities.total +
        nonCurrentLiabilities.longTermProvisions.total;

    const totalCurrentLiabilities =
        currentLiabilities.shortTermBorrowings.total +
        currentLiabilities.tradePayables.total +
        currentLiabilities.otherCurrentLiabilities.total +
        currentLiabilities.shortTermProvisions.total;

    const totalFixedAssets =
        nonCurrentAssets.fixedAssets.tangibleAssets.total +
        nonCurrentAssets.fixedAssets.intangibleAssets.total +
        nonCurrentAssets.fixedAssets.capitalWorkInProgress.total +
        nonCurrentAssets.fixedAssets.intangibleAssetsUnderDevelopment.total +
        nonCurrentAssets.fixedAssets.fixedAssetsHeldForSale.total;

    const totalNonCurrentAssetsOther =
        nonCurrentAssets.nonCurrentInvestments.total +
        nonCurrentAssets.deferredTaxAssets.total +
        nonCurrentAssets.longTermLoansAndAdvances.total +
        nonCurrentAssets.otherNonCurrentAssets.total;

    const totalCurrentAssets =
        currentAssets.currentInvestments.total +
        currentAssets.inventories.total +
        currentAssets.tradeReceivables.total +
        currentAssets.cashAndCashEquivalents.total +
        currentAssets.shortTermLoansAndAdvances.total +
        currentAssets.otherCurrentAssets.total;

    const totalEquityAndLiabilities = totalShareholdersFunds + totalNonCurrentLiabilities + totalCurrentLiabilities;
    const totalAssets = totalFixedAssets + totalNonCurrentAssetsOther + totalCurrentAssets;

    // Get current financial year dates
    const reportDate = asOnDate || new Date();
    const currentYear = reportDate.getFullYear();
    const financialYearEnd = new Date(currentYear, 2, 31); // March 31
    const previousYearEnd = new Date(currentYear - 1, 2, 31);

    return {
        companyName: company?.name || 'Company',
        asOnDate: financialYearEnd,
        previousYearDate: previousYearEnd,

        equityAndLiabilities: {
            shareholdersFunds: {
                shareCapital: shareholdersFunds.shareCapital,
                reservesAndSurplus: shareholdersFunds.reservesAndSurplus,
                moneyReceivedAgainstShareWarrants: shareholdersFunds.moneyReceivedAgainstShareWarrants,
                total: totalShareholdersFunds
            },
            shareApplicationMoneyPendingAllotment: { total: 0, noteNo: null },
            nonCurrentLiabilities: {
                longTermBorrowings: nonCurrentLiabilities.longTermBorrowings,
                deferredTaxLiabilities: nonCurrentLiabilities.deferredTaxLiabilities,
                otherLongTermLiabilities: nonCurrentLiabilities.otherLongTermLiabilities,
                longTermProvisions: nonCurrentLiabilities.longTermProvisions,
                total: totalNonCurrentLiabilities
            },
            currentLiabilities: {
                shortTermBorrowings: currentLiabilities.shortTermBorrowings,
                tradePayables: currentLiabilities.tradePayables,
                otherCurrentLiabilities: currentLiabilities.otherCurrentLiabilities,
                shortTermProvisions: currentLiabilities.shortTermProvisions,
                total: totalCurrentLiabilities
            },
            total: totalEquityAndLiabilities
        },

        assets: {
            nonCurrentAssets: {
                fixedAssets: {
                    tangibleAssets: nonCurrentAssets.fixedAssets.tangibleAssets,
                    intangibleAssets: nonCurrentAssets.fixedAssets.intangibleAssets,
                    capitalWorkInProgress: nonCurrentAssets.fixedAssets.capitalWorkInProgress,
                    intangibleAssetsUnderDevelopment: nonCurrentAssets.fixedAssets.intangibleAssetsUnderDevelopment,
                    fixedAssetsHeldForSale: nonCurrentAssets.fixedAssets.fixedAssetsHeldForSale,
                    total: totalFixedAssets
                },
                nonCurrentInvestments: nonCurrentAssets.nonCurrentInvestments,
                deferredTaxAssets: nonCurrentAssets.deferredTaxAssets,
                longTermLoansAndAdvances: nonCurrentAssets.longTermLoansAndAdvances,
                otherNonCurrentAssets: nonCurrentAssets.otherNonCurrentAssets,
                total: totalFixedAssets + totalNonCurrentAssetsOther
            },
            currentAssets: {
                currentInvestments: currentAssets.currentInvestments,
                inventories: currentAssets.inventories,
                tradeReceivables: currentAssets.tradeReceivables,
                cashAndCashEquivalents: currentAssets.cashAndCashEquivalents,
                shortTermLoansAndAdvances: currentAssets.shortTermLoansAndAdvances,
                otherCurrentAssets: currentAssets.otherCurrentAssets,
                total: totalCurrentAssets
            },
            total: totalAssets
        },

        totals: {
            totalEquityAndLiabilities,
            totalAssets,
            isBalanced: Math.abs(totalEquityAndLiabilities - totalAssets) < 0.01,
            difference: Math.abs(totalEquityAndLiabilities - totalAssets)
        }
    };
};

/**
 * Ledger Statement (Passbook View)
 */
export const getLedgerStatementService = async (
    ledgerId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
) => {
    console.log('[DEBUG] getLedgerStatementService called with:', { ledgerId, userId, startDate, endDate });

    const ledger = await prisma.ledger.findUnique({
        where: { id: ledgerId },
        include: { company: true }
    });

    if (!ledger) throw new Error('Ledger not found');
    const hasAccess = await validateCompanyAccessService(ledger.companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    // 1. Get Voucher Entries with full voucher context
    const entries = await prisma.voucherEntry.findMany({
        where: {
            ledgerId,
            voucher: {
                voucherDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'POSTED'
            }
        },
        include: {
            voucher: {
                include: {
                    voucherType: true,
                    entries: {
                        include: {
                            ledger: { select: { id: true, name: true } }
                        }
                    }
                }
            }
        },
        orderBy: {
            voucher: {
                voucherDate: 'asc'
            }
        }
    });

    console.log(`[DEBUG] Found ${entries.length} entries for ledger ${ledger.name}`);
    if (entries.length === 0) {
        // Debug: Check if ANY entries exist for this ledger, ignoring date/status
        const allEntries = await prisma.voucherEntry.count({ where: { ledgerId } });
        console.log(`[DEBUG] Total entries in DB for this ledger (ignoring filters): ${allEntries}`);
    }

    // 2. Calculate Running Balance
    let runningBalance = Number(ledger.openingBalance);
    let runningType = ledger.openingBalanceType;

    let signedBalance = runningType === 'DEBIT' ? runningBalance : -runningBalance;

    const statement = entries.map(entry => {
        const amount = Number(entry.amount);
        if (entry.entryType === 'DEBIT') signedBalance += amount;
        else signedBalance -= amount;

        // Derive Particulars: Ledgers on the opposite side of THIS entry
        const otherEntries = entry.voucher.entries.filter(e => e.ledgerId !== ledgerId);
        let particulars = '';

        if (otherEntries.length === 0) {
            particulars = entry.voucher.narration || 'Self';
        } else if (otherEntries.length === 1) {
            particulars = otherEntries[0].ledger.name;
        } else {
            // Join first two or use "& others"
            particulars = `${otherEntries[0].ledger.name} & others`;
        }

        return {
            id: entry.id,
            voucherId: entry.voucherId, // Add voucherId for reconciliation
            date: entry.voucher.voucherDate,
            voucherNo: entry.voucher.voucherNumber,
            voucherNumber: entry.voucher.voucherNumber,
            voucherType: entry.voucher.voucherType.name,
            particulars: particulars,
            narration: entry.voucher.narration,
            debit: entry.entryType === 'DEBIT' ? amount : 0,
            credit: entry.entryType === 'CREDIT' ? amount : 0,
            balance: Math.abs(signedBalance),
            balanceType: signedBalance >= 0 ? 'DEBIT' : 'CREDIT',
            // Bank Reconciliation Fields
            bankDate: entry.bankDate,
            instrumentType: entry.instrumentType,
            instrumentNumber: entry.instrumentNumber,
            instrumentDate: entry.instrumentDate,
            isReconciled: entry.isReconciled
        };
    });

    return {
        ledger: {
            id: ledger.id,
            name: ledger.name,
            openingBalance: Number(ledger.openingBalance),
            openingType: ledger.openingBalanceType
        },
        statement,
        closingBalance: Math.abs(signedBalance),
        closingType: signedBalance >= 0 ? 'DEBIT' : 'CREDIT'
    };
};

/**
 * Day Book
 * Chronological record of all vouchers for a specified date
 */
export const getDayBookService = async (companyId: string, userId: string, date?: Date) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    // Use specific date or default to today
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const vouchers = await prisma.voucher.findMany({
        where: {
            companyId,
            voucherDate: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            voucherType: { select: { name: true, code: true } },
            entries: {
                select: {
                    amount: true,
                    entryType: true,
                    ledger: { select: { name: true } }
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    const dailyTotalDebit = vouchers.reduce((sum, v) => sum + Number(v.totalDebit), 0);
    const dailyTotalCredit = vouchers.reduce((sum, v) => sum + Number(v.totalCredit), 0);

    return {
        date: targetDate,
        vouchers,
        summary: {
            count: vouchers.length,
            totalDebit: dailyTotalDebit,
            totalCredit: dailyTotalCredit
        }
    };
};

