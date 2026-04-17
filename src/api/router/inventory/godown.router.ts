/**
 * Godown Router
 * Routes for Godown (Warehouse/Location) APIs
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getGodownsController,
    getGodownHierarchyController,
    searchGodownsController,
    getGodownByIdController,
    createGodownController,
    updateGodownController,
    deleteGodownController,
    getGodownStockController,
    getItemGodownsController,
    getGodownStockSummaryController,
    transferStockController,
} from '../../controller/inventory/godown.controller';

const godownRouter = Router();

// ---- Stock Tracking (must be before parameterized routes) ----

// Get all items in a specific godown
godownRouter.get('/stock/:companyId/:godownId', auth, getGodownStockController);

// Get all godowns holding a specific item
godownRouter.get('/stock-by-item/:companyId/:itemId', auth, getItemGodownsController);

// Get full godown stock summary
godownRouter.get('/stock-summary/:companyId', auth, getGodownStockSummaryController);

// Transfer stock between godowns
godownRouter.post('/transfer/:companyId', auth, transferStockController);

// ---- Godown Master CRUD ----

// Search godowns (typeahead)
godownRouter.get('/search/:companyId', auth, searchGodownsController);

// Get godown hierarchy (tree)
godownRouter.get('/hierarchy/:companyId', auth, getGodownHierarchyController);

// Get all godowns (flat list)
godownRouter.get('/list/:companyId', auth, getGodownsController);

// Get single godown by ID
godownRouter.get('/:companyId/:godownId', auth, getGodownByIdController);

// Create godown
godownRouter.post('/:companyId', auth, createGodownController);

// Update godown
godownRouter.put('/:companyId/:godownId', auth, updateGodownController);

// Delete godown (soft delete)
godownRouter.delete('/:companyId/:godownId', auth, deleteGodownController);

export default godownRouter;

