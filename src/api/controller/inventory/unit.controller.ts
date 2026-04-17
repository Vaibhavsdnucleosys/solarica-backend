/**
 * Unit Controller
 * Handles HTTP requests for Units of Measurement (Inventory Masters)
 */

import { Request, Response } from 'express';
import { logger } from '../../../config/logger.config';
import {
    getUnitsService,
    getUnitByIdService,
    searchUnitsService,
    validateSymbolService,
    createUnitService,
    updateUnitService,
    deleteUnitService,
    getSimpleUnitsService,
    convertQuantityService,
} from '../../../services/inventory/unit.service';
import { INVENTORY_SUCCESS } from '../../../utils/inventory/constants';
import { STANDARD_UQC_CODES } from '../../../utils/inventory/constants';

/**
 * GET /api/v1/inventory/units/list/:companyId
 * Get all units for a company
 */
export const getUnitsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;

        const units = await getUnitsService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: units,
        });
    } catch (error: any) {
        console.error('[Unit Controller] getUnits error:', error.message);
        return res.status(error.message.includes('access') ? 403 : 500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/units/:companyId/:unitId
 * Get a single unit by ID
 */
export const getUnitByIdController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, unitId } = req.params;

        const unit = await getUnitByIdService(unitId, companyId, userId);

        return res.status(200).json({
            success: true,
            data: unit,
        });
    } catch (error: any) {
        console.error('[Unit Controller] getUnitById error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/units/search/:companyId?q=
 * Search units (typeahead for sidebar)
 */
export const searchUnitsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const query = (req.query.q as string) || '';

        const results = await searchUnitsService(companyId, userId, query);

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error: any) {
        console.error('[Unit Controller] searchUnits error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/units/validate-symbol/:companyId?symbol=&excludeId=
 * Check if a symbol is available (duplicate check)
 */
export const validateSymbolController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const symbol = req.query.symbol as string;
        const excludeId = req.query.excludeId as string | undefined;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: 'Symbol query parameter is required.',
            });
        }

        const result = await validateSymbolService(companyId, userId, symbol, excludeId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('[Unit Controller] validateSymbol error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/units/uqc-codes
 * Get list of standard UQC codes (no auth needed for this static data)
 */
export const getUqcCodesController = async (_req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        data: STANDARD_UQC_CODES,
    });
};

/**
 * POST /api/v1/inventory/units/:companyId
 * Create a new unit
 */
export const createUnitController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const unitData = req.body;

        const unit = await createUnitService(companyId, userId, unitData);

        return res.status(201).json({
            success: true,
            message: INVENTORY_SUCCESS.UNIT_CREATED,
            data: unit,
        });
    } catch (error: any) {
        logger.error('[Unit Controller] createUnit error:', { message: error.message, stack: error.stack });
        const status = error.message.includes('already exists') ? 409 :
            error.message.includes('required') ? 400 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
};

/**
 * PUT /api/v1/inventory/units/:companyId/:unitId
 * Update an existing unit
 */
export const updateUnitController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, unitId } = req.params;
        const updateData = req.body;

        const unit = await updateUnitService(unitId, companyId, userId, updateData);

        return res.status(200).json({
            success: true,
            message: INVENTORY_SUCCESS.UNIT_UPDATED,
            data: unit,
        });
    } catch (error: any) {
        console.error('[Unit Controller] updateUnit error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * DELETE /api/v1/inventory/units/:companyId/:unitId
 * Delete a unit (soft delete)
 */
export const deleteUnitController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, unitId } = req.params;

        await deleteUnitService(unitId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: INVENTORY_SUCCESS.UNIT_DELETED,
        });
    } catch (error: any) {
        console.error('[Unit Controller] deleteUnit error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('Cannot delete') ? 409 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// COMPOUND UNIT CONTROLLERS
// ============================================

/**
 * GET /api/v1/inventory/units/simple/:companyId
 * Get only simple units (for compound unit creation dropdown)
 */
export const getSimpleUnitsController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const units = await getSimpleUnitsService(companyId, userId);
        return res.status(200).json({ success: true, data: units });
    } catch (error: any) {
        console.error('[Unit Controller] getSimpleUnits error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/inventory/units/convert/:unitId?qty=
 * Convert quantity using compound unit formula
 * Example: /convert/unit123?qty=30 → { firstQty: 2, secondQty: 6, display: "2 Box 6 Nos" }
 */
export const convertQuantityController = async (req: Request, res: Response) => {
    try {
        const { unitId } = req.params;
        const qty = parseFloat(req.query.qty as string);

        if (isNaN(qty)) {
            return res.status(400).json({
                success: false,
                message: 'Quantity (qty) query parameter is required and must be a number.',
            });
        }

        const result = await convertQuantityService(qty, unitId);
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        console.error('[Unit Controller] convertQuantity error:', error.message);
        return res.status(error.message.includes('not found') ? 404 : 500).json({
            success: false, message: error.message,
        });
    }
};


