import { Request, Response } from 'express';
import prisma from '../../../config/prisma';

/**
 * Bank Reconciliation Controller
 * Handles reconciliation operations for bank ledgers
 */

// Mark/Unmark transaction as reconciled (update bank date)
export const markReconciled = async (req: Request, res: Response) => {
    try {
        const { entryId } = req.params;
        const { bankDate, isReconciled } = req.body;

        if (!entryId) {
            return res.status(400).json({ error: 'Entry ID is required' });
        }

        const updatedEntry = await prisma.voucherEntry.update({
            where: { id: entryId },
            data: {
                bankDate: bankDate ? new Date(bankDate) : null,
                isReconciled: isReconciled ?? !!bankDate
            },
            include: {
                ledger: { select: { name: true } },
                voucher: { select: { voucherNumber: true, voucherDate: true } }
            }
        });

        return res.status(200).json({
            success: true,
            data: updatedEntry,
            message: isReconciled ? 'Transaction marked as reconciled' : 'Transaction marked as pending'
        });
    } catch (error: any) {
        console.error('Error marking reconciliation:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

// Bulk update reconciliation status
export const bulkMarkReconciled = async (req: Request, res: Response) => {
    try {
        const { entries } = req.body; // Array of { entryId, bankDate }

        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({ error: 'Entries array is required' });
        }

        const results = await Promise.all(
            entries.map((entry: { entryId: string; bankDate: string | null }) =>
                prisma.voucherEntry.update({
                    where: { id: entry.entryId },
                    data: {
                        bankDate: entry.bankDate ? new Date(entry.bankDate) : null,
                        isReconciled: !!entry.bankDate
                    }
                })
            )
        );

        return res.status(200).json({
            success: true,
            data: results,
            message: `${results.length} entries updated`
        });
    } catch (error: any) {
        console.error('Error bulk marking reconciliation:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

// Get unreconciled transactions for a bank ledger
export const getUnreconciledTransactions = async (req: Request, res: Response) => {
    try {
        const { ledgerId } = req.params;
        const { startDate, endDate } = req.query;

        if (!ledgerId) {
            return res.status(400).json({ error: 'Ledger ID is required' });
        }

        const whereClause: any = {
            ledgerId,
            isReconciled: false
        };

        if (startDate && endDate) {
            whereClause.voucher = {
                voucherDate: {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string)
                }
            };
        }

        const entries = await prisma.voucherEntry.findMany({
            where: whereClause,
            include: {
                voucher: {
                    select: {
                        voucherNumber: true,
                        voucherDate: true,
                        narration: true,
                        voucherType: { select: { name: true } }
                    }
                },
                ledger: { select: { name: true } }
            },
            orderBy: { voucher: { voucherDate: 'asc' } }
        });

        return res.status(200).json({
            success: true,
            data: entries
        });
    } catch (error: any) {
        console.error('Error fetching unreconciled transactions:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

// Get reconciliation summary for a bank ledger
export const getReconciliationSummary = async (req: Request, res: Response) => {
    try {
        const { ledgerId } = req.params;
        const { asOnDate } = req.query;

        if (!ledgerId) {
            return res.status(400).json({ error: 'Ledger ID is required' });
        }

        // Get ledger with opening balance
        const ledger = await prisma.ledger.findUnique({
            where: { id: ledgerId },
            select: {
                openingBalance: true,
                openingBalanceType: true,
                currentBalance: true,
                currentBalanceType: true
            }
        });

        if (!ledger) {
            return res.status(404).json({ error: 'Ledger not found' });
        }

        // Calculate balance as per books
        const entries = await prisma.voucherEntry.findMany({
            where: { ledgerId },
            select: {
                amount: true,
                entryType: true,
                isReconciled: true,
                bankDate: true
            }
        });

        let balanceAsPerBooks = Number(ledger.openingBalance) || 0;
        let amountsNotReflectedInBank = 0;

        entries.forEach(entry => {
            const amount = Number(entry.amount);
            if (entry.entryType === 'DEBIT') {
                balanceAsPerBooks += amount;
            } else {
                balanceAsPerBooks -= amount;
            }

            // If not reconciled, add to unreconciled amount
            if (!entry.isReconciled) {
                if (entry.entryType === 'DEBIT') {
                    amountsNotReflectedInBank += amount;
                } else {
                    amountsNotReflectedInBank -= amount;
                }
            }
        });

        const balanceAsPerBank = balanceAsPerBooks - amountsNotReflectedInBank;

        return res.status(200).json({
            success: true,
            data: {
                balanceAsPerBooks,
                amountsNotReflectedInBank,
                balanceAsPerBank,
                reconciledCount: entries.filter(e => e.isReconciled).length,
                unreconciledCount: entries.filter(e => !e.isReconciled).length
            }
        });
    } catch (error: any) {
        console.error('Error calculating reconciliation summary:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

// Add adjustment entry (bank charges, interest, etc.)
export const addAdjustmentEntry = async (req: Request, res: Response) => {
    try {
        const { ledgerId } = req.params;
        const {
            companyId,
            voucherTypeId,
            amount,
            entryType, // 'DEBIT' or 'CREDIT'
            narration,
            instrumentType, // 'BANK_CHARGE', 'INTEREST', etc.
            instrumentNumber,
            bankDate,
            voucherDate,
            contraLedgerId // The offsetting ledger (e.g., Bank Charges A/c)
        } = req.body;

        const userId = (req as any).user?.id || 'SYSTEM'; // Default to SYSTEM if no user

        console.log('[AddAdjustmentEntry] Received request:', {
            ledgerId,
            companyId,
            voucherTypeId,
            amount,
            entryType,
            contraLedgerId,
            userId
        });

        if (!ledgerId || !companyId || !voucherTypeId || !amount || !contraLedgerId) {
            return res.status(400).json({
                error: 'Missing required fields: ledgerId, companyId, voucherTypeId, amount, contraLedgerId'
            });
        }

        // Convert amount to number
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Get active financial year
        const financialYear = await prisma.financialYear.findFirst({
            where: { companyId, isActive: true }
        });

        if (!financialYear) {
            return res.status(400).json({ error: 'No active financial year found' });
        }

        // Get next voucher number
        const lastVoucher = await prisma.voucher.findFirst({
            where: { companyId, voucherTypeId },
            orderBy: { voucherNumber: 'desc' }
        });

        let nextNumber = '0001';
        if (lastVoucher && lastVoucher.voucherNumber) {
            const numericPart = lastVoucher.voucherNumber.replace(/\D/g, '');
            if (numericPart) {
                nextNumber = String(parseInt(numericPart) + 1).padStart(4, '0');
            }
        }

        console.log('[AddAdjustmentEntry] Creating voucher with number:', nextNumber);

        // Create the voucher with both entries
        const voucher = await prisma.voucher.create({
            data: {
                companyId,
                voucherTypeId,
                financialYearId: financialYear.id,
                voucherNumber: nextNumber,
                voucherDate: voucherDate ? new Date(voucherDate) : new Date(),
                narration: narration || `Adjustment entry`,
                status: 'POSTED',
                postedAt: new Date(),
                postedBy: userId,
                totalDebit: amountNum,
                totalCredit: amountNum,
                createdBy: userId,
                updatedBy: userId,
                entries: {
                    create: [
                        // Bank ledger entry
                        {
                            companyId,
                            ledgerId,
                            entryType: entryType as any,
                            amount: amountNum,
                            description: narration,
                            instrumentType,
                            instrumentNumber,
                            bankDate: bankDate ? new Date(bankDate) : new Date(),
                            isReconciled: !!bankDate
                        },
                        // Contra entry (offsetting ledger)
                        {
                            companyId,
                            ledgerId: contraLedgerId,
                            entryType: (entryType === 'DEBIT' ? 'CREDIT' : 'DEBIT') as any,
                            amount: amountNum,
                            description: narration
                        }
                    ]
                }
            },
            include: {
                entries: {
                    include: {
                        ledger: { select: { name: true } }
                    }
                }
            }
        });

        console.log('[AddAdjustmentEntry] Voucher created:', voucher.id);

        // Update ledger balances
        await prisma.ledger.update({
            where: { id: ledgerId },
            data: {
                currentBalance: {
                    [entryType === 'DEBIT' ? 'increment' : 'decrement']: amountNum
                }
            }
        });

        await prisma.ledger.update({
            where: { id: contraLedgerId },
            data: {
                currentBalance: {
                    [entryType === 'DEBIT' ? 'decrement' : 'increment']: amountNum
                }
            }
        });

        return res.status(201).json({
            success: true,
            data: voucher,
            message: 'Adjustment entry created successfully'
        });
    } catch (error: any) {
        console.error('Error creating adjustment entry:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            details: error.code || 'Unknown error'
        });
    }
};

