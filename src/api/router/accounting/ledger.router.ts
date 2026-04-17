/**
 * Ledger Router
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    createLedger,
    deleteLedger,
    getAllLedgers,
    getLedgerById,
    updateLedger
} from '../../controller/accounting/ledger.controller';

const ledgerRouter = Router();

// Create a new ledger
ledgerRouter.post('/', auth, createLedger);

// Get all ledgers for a company
ledgerRouter.get('/company/:companyId', auth, getAllLedgers);

// Get ledger details by ID
ledgerRouter.get('/:id', auth, getLedgerById);

// Delete a ledger
// Delete a ledger
ledgerRouter.delete('/:id', auth, deleteLedger);

// Update a ledger
ledgerRouter.put('/:id', auth, updateLedger);

export default ledgerRouter;

