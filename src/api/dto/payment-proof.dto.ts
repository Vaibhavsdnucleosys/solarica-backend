export interface PaymentProofResponse {
  id: string;
  type: 'ADVANCE' | 'FULL' | 'LIGHT_BILL';
  imageUrl: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface CreatePaymentProofInput {
  type: 'ADVANCE' | 'FULL' | 'LIGHT_BILL';
}

export interface DeletePaymentProofResponse {
  success: boolean;
  message: string;
}

