import { Router } from 'express';
import * as HsnController from '../controller/hsn.controller';
import { auth } from '../../middleware/auth'; // Match the export name in your middleware
import { upload } from '../../middleware/upload';

const router = Router();

router.get('/', auth, HsnController.list);
router.post('/', auth, HsnController.create);
router.put('/:id', auth, HsnController.update);
router.post('/import', auth, upload.single('file'), HsnController.importHsn);

export default router;