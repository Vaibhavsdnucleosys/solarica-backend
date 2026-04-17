/**
 * Stock Category Router
 * Routes for Stock Categories (Inventory Masters)
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getStockCategoriesController,
    getStockCategoryByIdController,
    searchStockCategoriesController,
    validateCategoryNameController,
    createStockCategoryController,
    updateStockCategoryController,
    deleteStockCategoryController,
} from '../../controller/inventory/stock-category.controller';

const stockCategoryRouter = Router();

// Search stock categories (must be before /:companyId/:categoryId to avoid route conflict)
stockCategoryRouter.get('/search/:companyId', auth, searchStockCategoriesController);

// Validate name availability
stockCategoryRouter.get('/validate-name/:companyId', auth, validateCategoryNameController);

// Get all stock categories for a company
stockCategoryRouter.get('/list/:companyId', auth, getStockCategoriesController);

// Get a single stock category by ID
stockCategoryRouter.get('/:companyId/:categoryId', auth, getStockCategoryByIdController);

// Create a new stock category
stockCategoryRouter.post('/:companyId', auth, createStockCategoryController);

// Update a stock category
stockCategoryRouter.put('/:companyId/:categoryId', auth, updateStockCategoryController);

// Delete a stock category (soft delete)
stockCategoryRouter.delete('/:companyId/:categoryId', auth, deleteStockCategoryController);

export default stockCategoryRouter;

