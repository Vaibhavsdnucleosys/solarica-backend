/**
 * Account Group Service
 * Business logic for managing the Chart of Accounts (Groups)
 */

import {
    createAccountGroupModel,
    getAccountGroupByIdModel,
    getAccountGroupsByCompanyIdModel,
    getGroupHierarchyModel,
    updateAccountGroupModel,
    deleteAccountGroupModel,
    canDeleteGroupModel,
} from '../../api/model/accounting';
import { validateCompanyAccessService } from './company.service';
import { ACCOUNTING_ERRORS } from '../../utils/accounting/constants';

/**
 * Get all groups for a company in a flat list
 */
export const getGroupsService = async (companyId: string, userId: string) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getAccountGroupsByCompanyIdModel(companyId);
};

/**
 * Get Chart of Accounts (Hierarchical Tree)
 * This is what will power the "Display Chart of Accounts" screen
 */
export const getChartOfAccountsService = async (companyId: string, userId: string) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getGroupHierarchyModel(companyId);
};

/**
 * Create a custom account group
 */
export const createGroupService = async (
    companyId: string,
    userId: string,
    data: {
        name: string;
        code?: string;
        parentId?: string;
        nature: any;
        affectsGrossProfit?: boolean;
    }
) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // If parent is provided, calculate level
    let level = 0;
    if (data.parentId) {
        const parent = await getAccountGroupByIdModel(data.parentId);
        if (!parent) throw new Error('Parent group not found');
        level = parent.level + 1;
    }

    return await createAccountGroupModel({
        companyId,
        ...data,
        level,
        groupType: 'CUSTOM',
        createdBy: userId,
    });
};

/**
 * Delete a group
 */
export const deleteGroupService = async (groupId: string, companyId: string, userId: string) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Business validation (Can't delete if it has ledgers or children)
    const { canDelete, reason } = await canDeleteGroupModel(groupId);
    if (!canDelete) {
        throw new Error(reason || ACCOUNTING_ERRORS.GROUP_HAS_LEDGERS);
    }

    return await deleteAccountGroupModel(groupId);
};

