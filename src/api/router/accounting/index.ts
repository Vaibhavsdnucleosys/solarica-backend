import { Router } from 'express';
import companyRouter from './company.router';
import accountGroupRouter from './account-group.router';
import financialYearRouter from './financial-year.router';
import ledgerRouter from './ledger.router';
import voucherRouter from './voucher.router';
import reportRouter from './report.router';
import voucherTypeRouter from './voucher-type.router';
import reconciliationRouter from './reconciliation.router';


const accountingRouter = Router();

// Company Routes
accountingRouter.use('/companies', companyRouter);

// Account Group (Chart of Accounts) Routes
accountingRouter.use('/groups', accountGroupRouter);

// Financial Year Routes
accountingRouter.use('/fy', financialYearRouter);

// Ledger Routes
accountingRouter.use('/ledgers', ledgerRouter);

// Voucher Type Routes
accountingRouter.use('/voucher-types', voucherTypeRouter);

// Voucher Routes
accountingRouter.use('/vouchers', voucherRouter);

// Report Routes
accountingRouter.use('/reports', reportRouter);

// Bank Reconciliation Routes
accountingRouter.use('/reconciliation', reconciliationRouter);

export default accountingRouter;


