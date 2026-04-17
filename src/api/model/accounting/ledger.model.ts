
import prisma from "../../../config/prisma";
import { Ledger, BalanceType, Prisma } from "@prisma/client";

/**
 * Create a new ledger
 */
export const createLedgerModel = async (
  data: Prisma.LedgerUncheckedCreateInput
): Promise<Ledger> => {
  return await prisma.ledger.create({
    data
  });
};

/**
 * Check if a ledger with the same name exists in the company
 */
export const checkLedgerNameExistsModel = async (
  companyId: string,
  name: string
): Promise<boolean> => {
  const count = await prisma.ledger.count({
    where: {
      companyId,
      name: { equals: name, mode: 'insensitive' }
    }
  });
  return count > 0;
};

/**
 * Get ledger by ID
 */
export const getLedgerByIdModel = async (ledgerId: string) => {
  return await prisma.ledger.findUnique({
    where: { id: ledgerId },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          nature: true,
        },
      },
      _count: {
        select: {
          voucherEntries: true,
        },
      },
    },
  });
};

/**
 * Get all ledgers for a company
 */
export const getLedgersByCompanyIdModel = async (companyId: string) => {
  return await prisma.ledger.findMany({
    where: { companyId },
    include: {
      group: {
        select: {
          name: true,
          nature: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Update ledger balance
 */
export const updateLedgerBalanceModel = async (
  ledgerId: string,
  balance: number,
  balanceType: BalanceType,
  tx?: any
) => {
  const client = tx || prisma;
  return await client.ledger.update({
    where: { id: ledgerId },
    data: {
      currentBalance: balance,
      currentBalanceType: balanceType,
    },
  });
};

/**
 * Delete a ledger
 */
export const deleteLedgerModel = async (
  id: string
): Promise<Ledger> => {
  return await prisma.ledger.delete({
    where: { id }
  });
};

/**
 * Check if ledger is in use (has transactions)
 */
export const isLedgerInUseModel = async (
  id: string
): Promise<boolean> => {
  const result = await prisma.ledger.findUnique({
    where: { id },
    include: {
      _count: {
        select: { voucherEntries: true }
      }
    }
  });

  return (result?._count.voucherEntries ?? 0) > 0;
};

/**
 * Update ledger details
 */
export const updateLedgerModel = async (
  ledgerId: string,
  data: Prisma.LedgerUncheckedUpdateInput
): Promise<Ledger> => {
  return await prisma.ledger.update({
    where: { id: ledgerId },
    data
  });
};

