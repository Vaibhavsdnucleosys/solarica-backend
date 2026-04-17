import { Router } from 'express';
import { createWorkOrder, getWorkOrders, downloadWorkOrderPDF, generateWorkOrder } from '../controller/work-order.controller';
import { auth } from '../../middleware/auth';

const router = Router();

// Create new Work Order (Save to DB)
router.post('/', auth, createWorkOrder);

// Get list of Work Orders
router.get('/', auth, getWorkOrders);

// Download PDF for specific Work Order
router.get('/:id/pdf', auth, downloadWorkOrderPDF);

// Legacy/Preview: Generate PDF without saving (Optional)
router.post('/generate', auth, generateWorkOrder);

export default router;

