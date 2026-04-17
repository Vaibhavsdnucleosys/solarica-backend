/**
 * Company Router
 * API routes for Company operations
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    createCompanyController,
    getCompaniesController,
    getCompanyByIdController,
    updateCompanyController,
    deleteCompanyController,
} from '../../controller/accounting/company.controller';

const companyRouter = Router();

// Create a new company
companyRouter.post('/', auth, createCompanyController);

// Get all companies for current user
companyRouter.get('/', auth, getCompaniesController);

// Get company details by ID
companyRouter.get('/:id', auth, getCompanyByIdController);

// Update company details
companyRouter.put('/:id', auth, updateCompanyController);

// Delete a company
companyRouter.delete('/:id', auth, deleteCompanyController);

export default companyRouter;

