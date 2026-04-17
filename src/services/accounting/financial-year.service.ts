/**
 * Financial Year Service
 * Logic for managing accounting periods
 */

import {
    getFinancialYearsByCompanyIdModel,
    setActiveFinancialYearModel,
    lockFinancialYearModel,
    unlockFinancialYearModel,
    createFinancialYearModel,
} from '../../api/model/accounting';
import {
    validateCompanyAccessService,
    getUserCompanyRoleService,
} from './company.service';
import { generateFinancialYearName } from '../../utils/accounting/helpers';
import { ACCOUNTING_ERRORS } from '../../utils/accounting/constants';

/**
 * List all financial years for a company
 */
export const getFinancialYearsService = async (companyId: string, userId: string) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getFinancialYearsByCompanyIdModel(companyId);
};

/**
 * Switch the active financial year
 */
export const switchFinancialYearService = async (companyId: string, fyId: string, userId: string) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await setActiveFinancialYearModel(companyId, fyId);
};

/**
 * Create a new financial year manually
 */
export const createFYService = async (
    companyId: string,
    userId: string,
    data: { startDate: Date; endDate: Date }
) => {
    // Check access
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    const yearName = generateFinancialYearName(data.startDate);

    return await createFinancialYearModel({
        companyId,
        yearName,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: false, // Don't activate it immediately
    });
};

/**
 * Lock a financial year
 */
export const lockFYService = async (fyId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(ACCOUNTING_ERRORS.UNAUTHORIZED_ACCESS);

    return await lockFinancialYearModel(fyId, userId);
};

/**
 * Unlock a financial year
 */
export const unlockFYService = async (fyId: string, companyId: string, userId: string) => {
    // Only OWNER can unlock a year
    const role = await getUserCompanyRoleService(companyId, userId);
    if (role !== 'OWNER') throw new Error('Only the company owner can unlock a financial year');

    return await unlockFinancialYearModel(fyId);
};

