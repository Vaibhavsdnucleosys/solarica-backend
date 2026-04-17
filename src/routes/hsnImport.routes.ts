import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import * as HsnImportController from '././../api/controller/hsn.controller';
// import { auth } from '../../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import', auth, upload.single('file'), HsnImportController.importHsn);

export default router;