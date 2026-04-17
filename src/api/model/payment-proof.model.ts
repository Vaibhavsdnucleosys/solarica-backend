import { PrismaClient, PaymentProofType } from '@prisma/client';
import { uploadToSupabase } from '../../config/supabase';


const prisma = new PrismaClient();

// Updated createPaymentProof to support Invoice
export const createPaymentProof = async (
  targetId: string,
  type: PaymentProofType,
  file: Express.Multer.File,
  uploadedById: string,
  targetType: 'QUOTATION' | 'INVOICE' = 'QUOTATION'
) => {
  // Upload to Supabase
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${type.toLowerCase()}-${Date.now()}.${fileExt}`;
  const folder = targetType === 'QUOTATION' ? 'quotations' : 'invoices';
  // Use a distinct path for invoices if needed, or stick to payment-proofs/{id}
  const filePath = `payment-proofs/${targetId}/${fileName}`;

  try {
    await uploadToSupabase(file.buffer, filePath, file.mimetype, 'documents');
  } catch (err: any) {
    throw new Error('Failed to upload file to storage');
  }

  const data: any = {
    type,
    imageUrl: filePath,
    uploadedById
  };

  if (targetType === 'QUOTATION') {
    data.quotationId = targetId;
  } else {
    data.invoiceId = targetId;
  }

  return prisma.paymentProof.create({
    data,
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

export const getPaymentProofsByQuotation = async (quotationId: string) => {
  return prisma.paymentProof.findMany({
    where: { quotationId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { uploadedAt: 'desc' }
  });
};

export const getPaymentProofsByInvoice = async (invoiceId: string) => {
  return prisma.paymentProof.findMany({
    where: { invoiceId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { uploadedAt: 'desc' }
  });
};

export const deletePaymentProof = async (proofId: string, userId: string) => {
  // Verify user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (user?.role.name !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can delete payment proofs');
  }

  const proof = await prisma.paymentProof.delete({
    where: { id: proofId }
  });

  // Note: You might want to delete the file from Supabase here

  return proof;
};

export const getPaymentProofById = async (proofId: string) => {
  return prisma.paymentProof.findUnique({
    where: { id: proofId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

