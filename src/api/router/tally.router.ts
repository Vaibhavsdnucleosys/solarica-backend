
import { Router } from 'express';
import { TallyController } from '../controller/tally.controller';

const router = Router();

// Routes
router.post('/crm/party', TallyController.createParty);
router.post('/crm/sales-invoice', TallyController.createInvoice);
router.get('/crm/tally/stats', TallyController.getStats);


export default router;

