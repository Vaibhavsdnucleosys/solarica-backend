import { Router } from 'express';
import {
    markReconciled,
    bulkMarkReconciled,
    getUnreconciledTransactions,
    getReconciliationSummary,
    addAdjustmentEntry
} from '../../controller/accounting/reconciliation.controller';

const reconciliationRouter = Router();

/**
 * Bank Reconciliation Routes
 * Base path: /api/accounting/reconciliation
 */

// Mark single transaction as reconciled (update bank date)
// PATCH /api/accounting/reconciliation/entry/:entryId/mark
reconciliationRouter.patch('/entry/:entryId/mark', markReconciled);

// Bulk mark transactions as reconciled
// POST /api/accounting/reconciliation/bulk-mark
reconciliationRouter.post('/bulk-mark', bulkMarkReconciled);

// Get unreconciled transactions for a bank ledger
// GET /api/accounting/reconciliation/ledger/:ledgerId/unreconciled
reconciliationRouter.get('/ledger/:ledgerId/unreconciled', getUnreconciledTransactions);

// Get reconciliation summary for a bank ledger
// GET /api/accounting/reconciliation/ledger/:ledgerId/summary
reconciliationRouter.get('/ledger/:ledgerId/summary', getReconciliationSummary);

// Add adjustment entry (bank charges, interest, etc.)
// POST /api/accounting/reconciliation/ledger/:ledgerId/add-entry
reconciliationRouter.post('/ledger/:ledgerId/add-entry', addAdjustmentEntry);

export default reconciliationRouter;

