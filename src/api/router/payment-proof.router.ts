import { Router } from 'express';
import {
  uploadPaymentProof,
  getPaymentProofs,
  deletePaymentProofHandler,
  getPaymentProof
} from '../controller/payment-proof.controller';
import { auth } from '../../middleware/auth';
import { allow } from '../../middleware/role';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

const router = Router();

// Upload payment proof
router.post('/:id/proofs', auth, allow('admin', 'sales', 'accounting', 'operation'), upload.single('file'), uploadPaymentProof);

// Get all payment proofs for a quotation
// TODO: Restore strict role checking after verifying user role structure
router.get('/:id/proofs', auth, getPaymentProofs);

// Get a specific payment proof
router.get('/proofs/:proofId', auth, getPaymentProof);

// Delete a payment proof (admin only)
router.delete('/proofs/:proofId', auth, allow('admin'), deletePaymentProofHandler);

export default router;

