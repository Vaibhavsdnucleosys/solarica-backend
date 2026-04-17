/**
 * Stock Group Router
 * Routes for Stock Groups (Inventory Masters)
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getStockGroupsController,
    getStockGroupByIdController,
    searchStockGroupsController,
    validateNameController,
    createStockGroupController,
    updateStockGroupController,
    deleteStockGroupController,
} from '../../controller/inventory/stock-group.controller';

const stockGroupRouter = Router();

// Search stock groups (must be before /:companyId/:groupId to avoid route conflict)
stockGroupRouter.get('/search/:companyId', auth, searchStockGroupsController);

// Validate name availability
stockGroupRouter.get('/validate-name/:companyId', auth, validateNameController);

// Get all stock groups for a company
stockGroupRouter.get('/list/:companyId', auth, getStockGroupsController);

// Get a single stock group by ID
stockGroupRouter.get('/:companyId/:groupId', auth, getStockGroupByIdController);

// Create a new stock group
stockGroupRouter.post('/:companyId', auth, createStockGroupController);

// Update a stock group
stockGroupRouter.put('/:companyId/:groupId', auth, updateStockGroupController);

// Delete a stock group (soft delete)
stockGroupRouter.delete('/:companyId/:groupId', auth, deleteStockGroupController);

export default stockGroupRouter;

