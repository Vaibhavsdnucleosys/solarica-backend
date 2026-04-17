/**
 * Unit Router
 * Routes for Units of Measurement (Inventory Masters)
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getUnitsController,
    getUnitByIdController,
    searchUnitsController,
    validateSymbolController,
    getUqcCodesController,
    createUnitController,
    updateUnitController,
    deleteUnitController,
    getSimpleUnitsController,
    convertQuantityController,
} from '../../controller/inventory/unit.controller';

const unitRouter = Router();

// Static data (no auth needed)
unitRouter.get('/uqc-codes', getUqcCodesController);

// Simple units only (for compound unit creation dropdown)
unitRouter.get('/simple/:companyId', auth, getSimpleUnitsController);

// Convert quantity using compound unit formula
unitRouter.get('/convert/:unitId', auth, convertQuantityController);

// Search units (must be before /:companyId/:unitId to avoid route conflict)
unitRouter.get('/search/:companyId', auth, searchUnitsController);

// Validate symbol availability
unitRouter.get('/validate-symbol/:companyId', auth, validateSymbolController);

// Get all units for a company
unitRouter.get('/list/:companyId', auth, getUnitsController);

// Get a single unit by ID
unitRouter.get('/:companyId/:unitId', auth, getUnitByIdController);

// Create a new unit
unitRouter.post('/:companyId', auth, createUnitController);

// Update a unit
unitRouter.put('/:companyId/:unitId', auth, updateUnitController);

// Delete a unit (soft delete)
unitRouter.delete('/:companyId/:unitId', auth, deleteUnitController);

export default unitRouter;


