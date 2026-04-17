/**
 * Ledger Service
 * Business logic for managing Ledgers
 */

import {
    getLedgerByIdModel,
    getLedgersByCompanyIdModel,
    createLedgerModel,
    checkLedgerNameExistsModel,
    deleteLedgerModel,
    isLedgerInUseModel,
    updateLedgerModel
} from '../../api/model/accounting';
import { validateCompanyAccessService } from './company.service';
import { ACCOUNTING_ERRORS } from '../../utils/accounting/constants';
import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

/**
 * Create a new ledger
 */
export const createLedgerService = async (
    companyId: string,
    userId: string,
    data: Prisma.LedgerUncheckedCreateInput
) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Validation
    const exists = await checkLedgerNameExistsModel(companyId, data.name);
    if (exists) {
        throw new Error('Ledger with this name already exists');
    }

    // Check Group
    const group = await prisma.accountGroup.findUnique({ where: { id: data.groupId } });
    if (!group) {
        throw new Error('Invalid Account Group ID');
    }

    // Create
    return await createLedgerModel(data);
};

/**
 * Get ledger details by ID
 */
export const getLedgerByIdService = async (ledgerId: string, userId: string) => {
    const ledger = await getLedgerByIdModel(ledgerId);

    if (!ledger) {
        throw new Error('Ledger not found');
    }

    // Check if user has access to this company
    const hasAccess = await validateCompanyAccessService(ledger.companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return ledger;
};

/**
 * Get all ledgers for a company
 */
export const getLedgersService = async (companyId: string, userId: string) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getLedgersByCompanyIdModel(companyId);
};

/**
 * Delete a ledger
 */
export const deleteLedgerService = async (ledgerId: string, userId: string) => {
    // We need to fetch it first to check access and system status
    const ledger = await getLedgerByIdModel(ledgerId);

    if (!ledger) {
        throw new Error('Ledger not found');
    }

    const hasAccess = await validateCompanyAccessService(ledger.companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    if (ledger.isSystem) {
        throw new Error('Cannot delete a system ledger');
    }

    const inUse = await isLedgerInUseModel(ledgerId);
    if (inUse) {
        throw new Error('Cannot delete ledger with existing transactions');
    }

    return await deleteLedgerModel(ledgerId);
};

/**
 * Update a ledger
 */
export const updateLedgerService = async (
    ledgerId: string,
    userId: string,
    data: Prisma.LedgerUncheckedUpdateInput
) => {
    // 1. Check if ledger exists
    const ledger = await getLedgerByIdModel(ledgerId);
    if (!ledger) {
        throw new Error('Ledger not found');
    }

    // 2. Check access
    const hasAccess = await validateCompanyAccessService(ledger.companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // 3. Name Uniqueness Check (if name is being updated)
    if (data.name && typeof data.name === 'string' && data.name !== ledger.name) {
        const exists = await checkLedgerNameExistsModel(ledger.companyId, data.name);
        if (exists) {
            throw new Error('Ledger with this name already exists');
        }
    }

    // 4. Group Existence Check (if group is being updated)
    if (data.groupId && typeof data.groupId === 'string') {
        const group = await prisma.accountGroup.findUnique({ where: { id: data.groupId } });
        if (!group) {
            throw new Error('Invalid Account Group ID');
        }
    }

    // 5. Update
    return await updateLedgerModel(ledgerId, {
        ...data,
        updatedBy: userId
    });
};

