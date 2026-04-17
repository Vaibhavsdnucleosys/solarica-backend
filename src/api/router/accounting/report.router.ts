/**
 * Report Router
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
    getLedgerStatement,
    getDayBook
} from '../../controller/accounting/report.controller';

const reportRouter = Router();

// Day Book
reportRouter.get('/day-book/:companyId', auth, getDayBook);

// Trial Balance
reportRouter.get('/trial-balance/:companyId', auth, getTrialBalance);

// Profit & Loss
reportRouter.get('/profit-loss/:companyId', auth, getProfitAndLoss);

// Balance Sheet
reportRouter.get('/balance-sheet/:companyId', auth, getBalanceSheet);

// Ledger Statement
reportRouter.get('/ledger-statement/:ledgerId', auth, getLedgerStatement);

export default reportRouter;

