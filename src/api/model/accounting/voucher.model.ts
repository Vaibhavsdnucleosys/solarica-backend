/**
 * Voucher Model
 * Database operations for Vouchers and Voucher Entries
 */

import prisma from '../../../config/prisma';
import { VoucherStatus, BalanceType, EntryType } from '@prisma/client';

/**
 * Create a complete voucher with entries in a transaction
 */

export const createVoucherModel = async (data: any, tx?: any) => {
  const client = tx || prisma;

  return await client.voucher.create({
    data: {
  companyId: data.companyId,
  voucherTypeId: data.voucherTypeId,
  financialYearId: data.financialYearId,

  voucherNumber: data.voucherNumber,
  voucherDate: data.voucherDate,
  referenceNumber: data.referenceNumber,
  referenceDate: data.referenceDate,
  narration: data.narration,
  status: data.status || VoucherStatus.POSTED,
  
  invoiceNumber: data.invoiceNumber,
  partyLedgerId: data.partyLedgerId,

  totalDebit: data.totalDebit,
  totalCredit: data.totalCredit,

  createdBy: data.createdBy,
  updatedBy: data.updatedBy || data.createdBy,

  entries: {
    create: data.entries.map((entry: any) => ({
      companyId: data.companyId,
      ledgerId: entry.ledgerId,
      entryType: entry.entryType,
      amount: entry.amount,
      description: entry.description,
    })),
  },
  
  ...(data.items && data.items.length > 0 ? {
    VoucherItem: {
      create: data.items.map((item: any) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
    }
  } : {}),
},

    include: {
      entries: {
        include: { ledger: true },
      },
      voucherType: true,
    },
  });
};


// export const createVoucherModel = async (data: any, tx?: any) => {
//     const client = tx || prisma;

//     return await client.voucher.create({
//     data: {
//         companyId: data.companyId,

//         // ✅ company relation
//         company: {
//             connect: { id: data.companyId },
//         },

//         voucherTypeId: data.voucherTypeId,

//         // ✅ voucherType relation (THIS WAS MISSING)
//         voucherType: {
//             connect: { id: data.voucherTypeId },
//         },

//         financialYearId: data.financialYearId,
//         voucherNumber: data.voucherNumber,
//         voucherDate: data.voucherDate,
//         referenceNumber: data.referenceNumber,
//         referenceDate: data.referenceDate,
//         narration: data.narration,
//         status: data.status || VoucherStatus.POSTED,
//         totalDebit: data.totalDebit,
//         totalCredit: data.totalCredit,
//         createdBy: data.createdBy,
//         updatedBy: data.createdBy,

//         entries: {
//             create: data.entries.map((entry: any) => ({
//                 companyId: data.companyId,
//                 ledgerId: entry.ledgerId,
//                 entryType: entry.entryType,
//                 amount: entry.amount,
//                 description: entry.description,
//             })),
//         },
//     },
//     include: {
//         entries: {
//             include: { ledger: true },
//         },
//         voucherType: true,
//     },
// });


// };

/**
 * Get voucher by ID
 */
export const getVoucherByIdModel = async (voucherId: string) => {
    return await prisma.voucher.findUnique({
        where: { id: voucherId },
        include: {
            entries: {
                include: {
                    ledger: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
            VoucherItem: true,
            voucherType: true,
            financialYear: true,
        },
    });
};

/**
 * Get vouchers for a company with filters
 */
export const getVouchersModel = async (filters: {
    companyId: string;
    financialYearId?: string;
    voucherTypeId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: VoucherStatus;
}) => {
    return await prisma.voucher.findMany({
        where: {
            companyId: filters.companyId,
            financialYearId: filters.financialYearId,
            voucherTypeId: filters.voucherTypeId,
            status: filters.status,
            voucherDate: {
                gte: filters.startDate,
                lte: filters.endDate,
            },
        },
        include: {
            voucherType: {
                select: { name: true, code: true },
            },
            entries: {
                select: {
                    amount: true,
                    entryType: true,
                    ledger: { select: { name: true } },
                },
            },
        },
        orderBy: {
            voucherDate: 'desc',
        },
    });
};

/**
 * Get next voucher number for a voucher type
 */
export const getNextVoucherSequenceModel = async (voucherTypeId: string, tx?: any) => {
    const client = tx || prisma;

    const voucherType = await client.voucherType.findUnique({
        where: { id: voucherTypeId },
        select: { prefix: true, currentNumber: true, suffix: true },
    });

    if (!voucherType) throw new Error('Voucher type not found');

    const vchNumber = `${voucherType.prefix || ''}${voucherType.currentNumber.toString().padStart(4, '0')}${voucherType.suffix || ''}`;

    // Update the sequence for next time
    await client.voucherType.update({
        where: { id: voucherTypeId },
        data: { currentNumber: { increment: 1 } },
    });

    return vchNumber;
};

/**
 * Update a voucher (Basic metadata update)
 * Note: Entry updates are typically handled via delete-create in the service layer transaction
 */
export const updateVoucherModel = async (voucherId: string, data: any, tx?: any) => {
    const client = tx || prisma;

    return await client.voucher.update({
        where: { id: voucherId },
        data: {
            ...data,
            // updatedBy handled by caller data
        },
        include: {
            entries: true, // Return entries to check if needed
        }
    });
};

/**
 * Delete a voucher
 */
export const deleteVoucherModel = async (voucherId: string, tx?: any) => {
    const client = tx || prisma;

    return await client.voucher.delete({
        where: { id: voucherId }
    });
};

