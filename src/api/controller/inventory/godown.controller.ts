/**
 * Godown Controller
 * HTTP handlers for Godown (Warehouse/Location) APIs
 */

import { Request, Response } from 'express';
import { logger } from '../../../config/logger.config';
import {
    getGodownsService,
    getGodownHierarchyService,
    getGodownByIdService,
    searchGodownsService,
    createGodownService,
    updateGodownService,
    deleteGodownService,
    getGodownStockService,
    getItemGodownsService,
    getGodownStockSummaryService,
    transferStockService,
} from '../../../services/inventory/godown.service';
import { INVENTORY_SUCCESS } from '../../../utils/inventory/constants';

// ============================================
// GODOWN MASTER CRUD
// ============================================

/**
 * GET /api/v1/inventory/godowns/list/:companyId
 */
export const getGodownsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        console.log(`[Godown Controller] Fetching godowns for user: ${userId}, company: ${companyId}`);
        const godowns = await getGodownsService(companyId, userId);
        return res.status(200).json({ success: true, data: godowns });
    } catch (error: any) {
        logger.error('[Godown Controller] getGodowns error:', { message: error.message, stack: error.stack });
        return res.status(error.message.includes('access') ? 403 : 500).json({
            success: false, 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * GET /api/v1/inventory/godowns/hierarchy/:companyId
 */
export const getGodownHierarchyController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const hierarchy = await getGodownHierarchyService(companyId, userId);
        return res.status(200).json({ success: true, data: hierarchy });
    } catch (error: any) {
        console.error('[Godown Controller] getHierarchy error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/inventory/godowns/search/:companyId?q=
 */
export const searchGodownsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const query = (req.query.q as string) || '';
        const results = await searchGodownsService(companyId, userId, query);
        return res.status(200).json({ success: true, data: results });
    } catch (error: any) {
        console.error('[Godown Controller] search error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/inventory/godowns/:companyId/:godownId
 */
export const getGodownByIdController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, godownId } = req.params;
        const godown = await getGodownByIdService(godownId, companyId, userId);
        return res.status(200).json({ success: true, data: godown });
    } catch (error: any) {
        console.error('[Godown Controller] getById error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('access') ? 403 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/v1/inventory/godowns/:companyId
 */
export const createGodownController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const godown = await createGodownService(companyId, userId, req.body);
        return res.status(201).json({
            success: true, message: INVENTORY_SUCCESS.GODOWN_CREATED, data: godown,
        });
    } catch (error: any) {
        console.error('[Godown Controller] create error:', error.message);
        const status = error.message.includes('already exists') ? 409 :
            error.message.includes('required') ? 400 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/v1/inventory/godowns/:companyId/:godownId
 */
export const updateGodownController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, godownId } = req.params;
        const godown = await updateGodownService(godownId, companyId, userId, req.body);
        return res.status(200).json({
            success: true, message: INVENTORY_SUCCESS.GODOWN_UPDATED, data: godown,
        });
    } catch (error: any) {
        console.error('[Godown Controller] update error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

/**
 * DELETE /api/v1/inventory/godowns/:companyId/:godownId
 */
export const deleteGodownController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, godownId } = req.params;
        await deleteGodownService(godownId, companyId, userId);
        return res.status(200).json({
            success: true, message: INVENTORY_SUCCESS.GODOWN_DELETED,
        });
    } catch (error: any) {
        console.error('[Godown Controller] delete error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('Cannot delete') ? 409 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

// ============================================
// GODOWN STOCK TRACKING
// ============================================

/**
 * GET /api/v1/inventory/godowns/stock/:companyId/:godownId
 */
export const getGodownStockController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, godownId } = req.params;
        const stock = await getGodownStockService(companyId, godownId, userId);
        return res.status(200).json({ success: true, data: stock });
    } catch (error: any) {
        console.error('[Godown Controller] getStock error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/inventory/godowns/stock-by-item/:companyId/:itemId
 */
export const getItemGodownsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, itemId } = req.params;
        const distribution = await getItemGodownsService(companyId, itemId, userId);
        return res.status(200).json({ success: true, data: distribution });
    } catch (error: any) {
        console.error('[Godown Controller] getItemGodowns error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/inventory/godowns/stock-summary/:companyId
 */
export const getGodownStockSummaryController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const summary = await getGodownStockSummaryService(companyId, userId);
        return res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
        console.error('[Godown Controller] getSummary error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/v1/inventory/godowns/transfer/:companyId
 */
export const transferStockController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const result = await transferStockService(companyId, userId, req.body);
        return res.status(200).json({
            success: true, message: INVENTORY_SUCCESS.GODOWN_TRANSFER_SUCCESS, data: result,
        });
    } catch (error: any) {
        console.error('[Godown Controller] transfer error:', error.message);
        const status = error.message.includes('Insufficient') ? 409 :
            error.message.includes('same') ? 400 :
                error.message.includes('greater than zero') ? 400 :
                    error.message.includes('access') ? 403 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

