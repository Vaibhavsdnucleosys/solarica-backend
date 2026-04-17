/**
 * Account Group Controller
 * Handles HTTP requests for Account Groups (Chart of Accounts)
 */

import { Request, Response } from 'express';
import {
    getGroupsService,
    getChartOfAccountsService,
    createGroupService,
    deleteGroupService,
} from '../../../services/accounting/account-group.service';

/**
 * GET /api/accounting/groups/list/:companyId
 */
export const getGroupsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;

        const groups = await getGroupsService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/accounting/groups/chart/:companyId
 * Returns hierarchical tree
 */
export const getChartOfAccountsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;

        const chart = await getChartOfAccountsService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: chart,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/accounting/groups/:companyId
 */
export const createGroupController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const groupData = req.body;

        const group = await createGroupService(companyId, userId, groupData);

        return res.status(201).json({
            success: true,
            message: 'Account group created successfully',
            data: group,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * DELETE /api/accounting/groups/:companyId/:groupId
 */
export const deleteGroupController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, groupId } = req.params;

        await deleteGroupService(groupId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Account group deleted successfully',
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

