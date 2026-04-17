import { Request, Response } from 'express';
import {
  createPaymentProof,
  getPaymentProofsByQuotation,
  getPaymentProofsByInvoice,
  deletePaymentProof,
  getPaymentProofById
} from '../model/payment-proof.model';
import { generateSignedURL } from '../../config/supabase';

// ... existing uploadPaymentProof (keep as is or update validation) ...

export const uploadInvoiceProof = async (req: Request, res: Response) => {
  try {
    const { id: invoiceId } = req.params;
    const { type } = req.body;
    const file = req.file;
    const userId = (req as any).user.id;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!['ADVANCE', 'FULL', 'LIGHT_BILL'].includes(type)) {
      return res.status(400).json({ error: 'Invalid proof type. Must be ADVANCE, FULL, or LIGHT_BILL' });
    }

    // Check if proof of this type already exists
    const existingProofs = await getPaymentProofsByInvoice(invoiceId);
    if (existingProofs.some(proof => proof.type === type && type !== 'LIGHT_BILL')) {
      // Allow multiple light bills? Maybe. For now follow same pattern but relax for LIGHT_BILL if needed.
      // The original code blocks if type exists.
      return res.status(400).json({
        error: `${type.toLowerCase()} payment proof already exists`
      });
    }

    const proof = await createPaymentProof(
      invoiceId,
      type as any, // Cast to any or PaymentProofType if imported
      file,
      userId,
      'INVOICE'
    );

    // Generate signed URL
    let fullUrl = proof.imageUrl;
    try {
      fullUrl = await generateSignedURL(proof.imageUrl, 'documents');
    } catch (e) {
      console.error('Failed to generate signed URL for proof:', e);
    }

    const response: any = {
      id: proof.id,
      type: proof.type,
      imageUrl: proof.imageUrl,
      url: fullUrl,
      uploadedAt: proof.uploadedAt,
      uploadedBy: {
        id: proof.uploadedBy.id,
        name: proof.uploadedBy.name || 'Unknown'
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error uploading invoice proof:', error);
    res.status(500).json({ error: error.message || 'Failed to upload invoice proof' });
  }
};

export const getInvoiceProofs = async (req: Request, res: Response) => {
  try {
    const { id: invoiceId } = req.params;
    const proofs = await getPaymentProofsByInvoice(invoiceId);

    const response = await Promise.all(proofs.map(async (proof) => {
      let fullUrl = proof.imageUrl;
      try {
        fullUrl = await generateSignedURL(proof.imageUrl, 'documents');
      } catch (e) {
        console.error('Failed to generate signed URL for proof:', e);
      }

      return {
        id: proof.id,
        type: proof.type,
        imageUrl: proof.imageUrl,
        url: fullUrl,
        uploadedAt: proof.uploadedAt,
        uploadedBy: {
          id: proof.uploadedBy.id,
          name: proof.uploadedBy.name || 'Unknown'
        }
      };
    }));

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching invoice proofs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch invoice proofs' });
  }
};
import { PaymentProofResponse, DeletePaymentProofResponse } from '../dto/payment-proof.dto';

export const uploadPaymentProof = async (req: Request, res: Response) => {
  try {
    const { id: quotationId } = req.params;
    const { type } = req.body;
    const file = req.file;
    const userId = (req as any).user.id;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!['ADVANCE', 'FULL', 'LIGHT_BILL'].includes(type)) {
      return res.status(400).json({ error: 'Invalid proof type. Must be ADVANCE, FULL, or LIGHT_BILL' });
    }

    // Check if proof of this type already exists
    const existingProof = await getPaymentProofsByQuotation(quotationId);
    if (existingProof.some(proof => proof.type === type)) {
      return res.status(400).json({
        error: `${type.toLowerCase()} payment proof already exists`
      });
    }

    const proof = await createPaymentProof(
      quotationId,
      type as 'ADVANCE' | 'FULL',
      file,
      userId
    );

    // Generate signed URL
    let fullUrl = proof.imageUrl;
    try {
      fullUrl = await generateSignedURL(proof.imageUrl, 'documents');
    } catch (e) {
      console.error('Failed to generate signed URL for proof:', e);
    }

    const response: any = {
      id: proof.id,
      type: proof.type,
      imageUrl: proof.imageUrl,
      url: fullUrl,
      uploadedAt: proof.uploadedAt,
      uploadedBy: {
        id: proof.uploadedBy.id,
        name: proof.uploadedBy.name || 'Unknown'
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ error: error.message || 'Failed to upload payment proof' });
  }
};

export const getPaymentProofs = async (req: Request, res: Response) => {
  try {
    const { id: quotationId } = req.params;
    console.log(`[getPaymentProofs] Fetching proofs for Quotation ID: ${quotationId}`);
    const proofs = await getPaymentProofsByQuotation(quotationId);
    console.log(`[getPaymentProofs] Found ${proofs.length} proofs`);

    const response = await Promise.all(proofs.map(async (proof) => {
      let fullUrl = proof.imageUrl;
      try {
        fullUrl = await generateSignedURL(proof.imageUrl, 'documents');
      } catch (e) {
        console.error('Failed to generate signed URL for proof:', e);
      }

      return {
        id: proof.id,
        type: proof.type,
        imageUrl: proof.imageUrl,
        url: fullUrl,
        uploadedAt: proof.uploadedAt,
        uploadedBy: {
          id: proof.uploadedBy.id,
          name: proof.uploadedBy.name || 'Unknown'
        }
      };
    }));

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching payment proofs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payment proofs' });
  }
};

export const deletePaymentProofHandler = async (req: Request, res: Response) => {
  try {
    const { proofId } = req.params;
    const userId = (req as any).user.id;

    await deletePaymentProof(proofId, userId);

    const response: DeletePaymentProofResponse = {
      success: true,
      message: 'Payment proof deleted successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error deleting payment proof:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payment proof' });
  }
};

export const getPaymentProof = async (req: Request, res: Response) => {
  try {
    const { proofId } = req.params;
    const proof = await getPaymentProofById(proofId);

    if (!proof) {
      return res.status(404).json({ error: 'Payment proof not found' });
    }

    // Generate signed URL
    let fullUrl = proof.imageUrl;
    try {
      fullUrl = await generateSignedURL(proof.imageUrl, 'documents');
    } catch (e) {
      console.error('Failed to generate signed URL for proof:', e);
    }

    const response: any = {
      id: proof.id,
      type: proof.type,
      imageUrl: proof.imageUrl,
      url: fullUrl,
      uploadedAt: proof.uploadedAt,
      uploadedBy: {
        id: proof.uploadedBy.id,
        name: proof.uploadedBy.name || 'Unknown'
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching payment proof:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payment proof' });
  }
};

