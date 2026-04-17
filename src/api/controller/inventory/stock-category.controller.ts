/**
 * Stock Category Controller
 * Handles HTTP requests for Stock Categories (Inventory Masters)
 */

import { Request, Response } from 'express';
import {
    getStockCategoriesService,
    getStockCategoryByIdService,
    searchStockCategoriesService,
    validateCategoryNameService,
    createStockCategoryService,
    updateStockCategoryService,
    deleteStockCategoryService,
} from '../../../services/inventory/stock-category.service';
import { INVENTORY_SUCCESS } from '../../../utils/inventory/constants';

/**
 * GET /api/v1/inventory/stock-categories/list/:companyId
 * Get all stock categories for a company
 */
export const getStockCategoriesController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;

        const categories = await getStockCategoriesService(companyId, userId);

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] getStockCategories error:', error.message);
        return res.status(error.message.includes('access') ? 403 : 500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/stock-categories/:companyId/:categoryId
 * Get a single stock category by ID
 */
export const getStockCategoryByIdController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, categoryId } = req.params;

        const category = await getStockCategoryByIdService(categoryId, companyId, userId);

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] getStockCategoryById error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/stock-categories/search/:companyId?q=
 * Search stock categories (typeahead)
 */
export const searchStockCategoriesController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const query = (req.query.q as string) || '';

        const results = await searchStockCategoriesService(companyId, userId, query);

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] searchStockCategories error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/v1/inventory/stock-categories/validate-name/:companyId?name=&excludeId=
 * Check if a name is available (duplicate check)
 */
export const validateCategoryNameController = async (req: Request, res: Response) => {
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

        const result = await validateCategoryNameService(companyId, userId, name, excludeId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] validateCategoryName error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/v1/inventory/stock-categories/:companyId
 * Create a new stock category
 */
export const createStockCategoryController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId } = req.params;
        const categoryData = req.body;

        const category = await createStockCategoryService(companyId, userId, categoryData);

        return res.status(201).json({
            success: true,
            message: INVENTORY_SUCCESS.CATEGORY_CREATED,
            data: category,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] createStockCategory error:', error.message);
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
 * PUT /api/v1/inventory/stock-categories/:companyId/:categoryId
 * Update an existing stock category
 */
export const updateStockCategoryController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, categoryId } = req.params;
        const updateData = req.body;

        const category = await updateStockCategoryService(categoryId, companyId, userId, updateData);

        return res.status(200).json({
            success: true,
            message: INVENTORY_SUCCESS.CATEGORY_UPDATED,
            data: category,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] updateStockCategory error:', error.message);
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
 * DELETE /api/v1/inventory/stock-categories/:companyId/:categoryId
 * Delete a stock category (soft delete)
 */
export const deleteStockCategoryController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { companyId, categoryId } = req.params;

        await deleteStockCategoryService(categoryId, companyId, userId);

        return res.status(200).json({
            success: true,
            message: INVENTORY_SUCCESS.CATEGORY_DELETED,
        });
    } catch (error: any) {
        console.error('[Stock Category Controller] deleteStockCategory error:', error.message);
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('Cannot delete') ? 409 :
                error.message.includes('access') ? 403 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

