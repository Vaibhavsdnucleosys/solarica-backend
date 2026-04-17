/**
 * Voucher Router
 */

import { Router } from 'express';
import { auth } from '../../../middleware/auth';
import {
    createVoucherController,
    getVouchersController,
    getVoucherByIdController,
    updateVoucherController,
    deleteVoucherController,
    postVoucherController,
    getAvailableInvoiceNumbersController,
    getVoucherByInvoiceNumberController,
} from '../../controller/accounting/voucher.controller';

const voucherRouter = Router();

// Create/Post a voucher
voucherRouter.post('/company/:companyId', auth, createVoucherController);

// Available Invoices for Delivery Challan
voucherRouter.get('/company/:companyId/available-invoices', auth, getAvailableInvoiceNumbersController);
voucherRouter.get('/company/:companyId/invoice/:invoiceNumber', auth, getVoucherByInvoiceNumberController);

voucherRouter.post('/:id/post', auth, postVoucherController);


// List vouchers with filters
voucherRouter.get('/company/:companyId', auth, getVouchersController);

// Get voucher details
voucherRouter.get('/:id', auth, getVoucherByIdController);

// Update voucher
voucherRouter.put('/:id', auth, updateVoucherController);

// Delete voucher
voucherRouter.delete('/:id', auth, deleteVoucherController);

export default voucherRouter;

