import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
  createVoucherTypeController,
  getVoucherTypesController,
  updateVoucherTypeController,
  getNextVoucherNumberController,
} from '../../controller/accounting/voucher-type.controller';

const voucherTypeRouter = Router();

// Create voucher type
voucherTypeRouter.post('/company/:companyId', auth, createVoucherTypeController);

// Get all voucher types
voucherTypeRouter.get('/company/:companyId', auth, getVoucherTypesController);

// Update voucher type
voucherTypeRouter.put('/:id', auth, updateVoucherTypeController);

// Get next voucher number
voucherTypeRouter.get('/:id/next-number', auth, getNextVoucherNumberController);

export default voucherTypeRouter;

