/**
 * Financial Year Router
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getFinancialYearsController,
    switchFYController,
    lockFYController,
    unlockFYController,
    createFYController,
} from '../../controller/accounting/financial-year.controller';

const financialYearRouter = Router();

// Create a new financial year
financialYearRouter.post('/:companyId', auth, createFYController);

// List all financial years
financialYearRouter.get('/:companyId', auth, getFinancialYearsController);

// Switch active financial year
financialYearRouter.post('/switch/:companyId/:fyId', auth, switchFYController);

// Lock financial year
financialYearRouter.post('/lock/:companyId/:fyId', auth, lockFYController);

// Unlock financial year
financialYearRouter.post('/unlock/:companyId/:fyId', auth, unlockFYController);

export default financialYearRouter;

