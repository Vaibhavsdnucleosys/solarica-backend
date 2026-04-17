/**
 * Stock Group Controller
 * Handles HTTP requests for Stock Groups (Inventory Masters)
 */

import { Request, Response } from 'express';
import {
    getStockGroupsService,
    getStockGroupByIdService,
    searchStockGroupsService,
    validateNameService,
    createStockGroupService,
    updateStockGroupService,
    deleteStockGroupService,
} from '../../../services/inventory/stock-group.service';
import { INVENTORY_SUCCESS } from '../../../utils/inventory/constants';

/**
 * GET /api/v1/inventory/stock-groups/list/:companyId
 * Get all stock groups for a company
 */
export const getStockGroupsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;

        const groups = await getStockGroupsService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] getStockGroups error:', error.message);
        return res.status(error.message.includes('access') ? 403 : 500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/stock-groups/:companyId/:groupId
 * Get a single stock group by ID
 */
export const getStockGroupByIdController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, groupId } = req.params;

        const group = await getStockGroupByIdService(groupId, companyId, userId);

        return res.status(200).json({
            success: true,
            data: group,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] getStockGroupById error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/stock-groups/search/:companyId?q=
 * Search stock groups (typeahead for sidebar)
 */
export const searchStockGroupsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const query = (req.query.q as string) || '';

        const results = await searchStockGroupsService(companyId, userId, query);

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] searchStockGroups error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/stock-groups/validate-name/:companyId?name=&excludeId=
 * Check if a name is available (duplicate check)
 */
export const validateNameController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const name = req.query.name as string;
        const excludeId = req.query.excludeId as string | undefined;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name query parameter is required.',
            });
        }

        const result = await validateNameService(companyId, userId, name, excludeId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] validateName error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/v1/inventory/stock-groups/:companyId
 * Create a new stock group
 */
export const createStockGroupController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const groupData = req.body;

        const group = await createStockGroupService(companyId, userId, groupData);

        return res.status(201).json({
            success: true,
            message: INVENTORY_SUCCESS.GROUP_CREATED,
            data: group,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] createStockGroup error:', error.message);
        const status = error.message.includes('already exists') ? 409 :
            error.message.includes('required') ? 400 :
                error.message.includes('access') ? 403 :
                    error.message.includes('not found') ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * PUT /api/v1/inventory/stock-groups/:companyId/:groupId
 * Update an existing stock group
 */
export const updateStockGroupController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, groupId } = req.params;
        const updateData = req.body;

        const group = await updateStockGroupService(groupId, companyId, userId, updateData);

        return res.status(200).json({
            success: true,
            message: INVENTORY_SUCCESS.GROUP_UPDATED,
            data: group,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] updateStockGroup error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 :
                error.message.includes('circular') ? 400 :
                    error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * DELETE /api/v1/inventory/stock-groups/:companyId/:groupId
 * Delete a stock group (soft delete)
 */
export const deleteStockGroupController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, groupId } = req.params;

        await deleteStockGroupService(groupId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: INVENTORY_SUCCESS.GROUP_DELETED,
        });
    } catch (error: any) {
        console.error('[Stock Group Controller] deleteStockGroup error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('Cannot delete') ? 409 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

