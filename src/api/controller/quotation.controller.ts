import { Request, Response } from "express";
import multer from 'multer';
import { logger } from "../../config/logger.config";
import {
  createQuotationModel,
  generateQuotationPDFModel,
  getAllQuotationsModel,
  getQuotationByIdModel,
  updateQuotationStatusModel,
  rejectQuotationWithReasonModel,
  deleteQuotationModel,
  sendQuotationEmailModel,
  getPDFDownloadURLModel,
  updateQuotationDocsModel,
  getQuotationDocsURLModel,
  updateQuotationModel,
  getNextEstimateNumberModel
} from "../model/quotation.model";
import { addQuotationJob } from "../../queues/quotation.queue";

import { uploadPDFToSupabase } from "../../config/supabase";

import { createNotificationModel } from "../model/notification.model";
// Memory storage configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const uploadDocs = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

const SERVICE_TYPES = [

  'On-Grid',
  'Off-Grid with Batteries',
  'Hybrid (Battery & Grid)',
  'Solar Farming Systems',
  'Commercial Solar Systems'
];

// Create new quotation (Admin & Sales only)
export const createQuotation = async (req: Request, res: Response) => {
  try {
    console.log("[Create Quotation] Starting...");
    const userId = (req as any).user.id;
    console.log("[Create Quotation] User ID identified:", userId);

    const {
      companyName,
      companyEmail,
      companyPhone,
      fromCompanyName,
      systemCapacityKw,
      systemCost,
      items,
      consumerNumber,
      BillingNumber,
      CustomerNumber,
      gstNumber,
      // New fields from frontend
      customerType,
      subsidyType,
      onGrid,
      phase,
      gstRate,
      numberOfFlats,
      gstAmount,
      totalAmount, // or totalCost
      subsidyAmount,
      netCost, // Legacy support
      netPayableAmount, // Correct field name from frontend
      validityDays
    } = req.body;

    console.log("[Create Quotation] Payload received:", {
      companyName, totalAmount, netPayableAmount, netCost, itemsCount: items?.length
    });

    //  Create the basic record in DB
    const quotation = await createQuotationModel(
      companyName,
      companyEmail,
      companyPhone,
      systemCapacityKw,
      systemCost,
      userId,
      items,
      fromCompanyName,
      consumerNumber,
      BillingNumber,
      CustomerNumber,
      gstNumber,
      // Pass new fields
      customerType,
      subsidyType,
      onGrid,
      phase,
      gstRate,
      numberOfFlats,
      gstAmount,
      totalAmount,
      subsidyAmount,
      netPayableAmount || netCost, // Pass as netPayableAmount
      validityDays
    );

    //  Automatically generate the PDF using the FULL request body
    // This includes non-stored fields like consumerNumber, clientAddress etc.
    // Automatically trigger PDF and Email generation
    // We use a non-blocking approach since Redis queue is disabled
    (async () => {
      try {
        logger.info(`[Quotation Automation] Starting PDF generation for ${quotation.id}`);
        await generateQuotationPDFModel(quotation.id, req.body);

        logger.info(`[Quotation Automation] Sending email for ${quotation.id}`);
        await sendQuotationEmailModel(quotation.id);

        logger.info(`[Quotation Automation] Completed successfully for ${quotation.id}`);
      } catch (autoError: any) {
        logger.error(`[Quotation Automation] Failed (PDF/Email) for ${quotation.id}:`, autoError);
      }
    })();

    res.status(201).json({
      message: "Quotation created successfully",
      data: quotation
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all quotations (Admin & Sales only)
export const getAllQuotations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const filters = req.query;

    // If no user (shouldn't happen since auth middleware is used, but guard anyway)
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const quotations = await getAllQuotationsModel(userId, userRole, filters);
    res.json({
      message: "Quotations retrieved successfully",
      quotations
    });
  } catch (error: any) {
    console.error("[Get All Quotations] Error:", error);

    // If database is unreachable, return empty array instead of crashing
    const isDbError = error?.code === 'P1001' || error?.message?.includes('database') ||
      error?.message?.includes('connect') || error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('prisma');

    if (isDbError) {
      console.warn("[Get All Quotations] Database unreachable, returning empty list.");
      return res.json({
        message: "Database temporarily unavailable",
        quotations: [],
        dbOffline: true
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


// Get quotation by ID (Admin & Sales only)
export const getQuotationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const rawRole = (req as any).user.role;
  const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();

  try {
    const quotation = await getQuotationByIdModel(id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Permission check
    if (userRole !== 'admin' && userRole !== 'operation' && userRole !== 'operations' && userRole !== 'accounting' && userRole !== 'account' && quotation.createdById !== userId) {
      return res.status(403).json({ message: "Not authorized to view this quotation" });
    }

    res.json({
      message: "Quotation retrieved successfully",
      quotation
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send quotation email (Admin & Sales only)
export const sendQuotationEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const rawRole = (req as any).user.role;
    const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();

    const quotation = await getQuotationByIdModel(id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Permission check
    if (userRole !== 'admin' && userRole !== 'operation' && userRole !== 'operations' && userRole !== 'accounting' && userRole !== 'account' && quotation.createdById !== userId) {
      return res.status(403).json({ message: "Not authorized to send this quotation" });
    }

    const result = await sendQuotationEmailModel(id);

    res.json({
      message: "Quotation sent successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


// Update quotation status (Public endpoint for email responses)
export const updateQuotationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.query;
  // Support getting reason from body (for rejection page) or query (legacy/simple link)
  const reason = (req.body && req.body.reason) || req.query.reason;

  const validActions = ['accepted', 'rejected', 'followup'];
  if (!action || !validActions.includes(action as string)) {
    return res.status(400).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #ef4444;">Invalid Action</h1>
        <p>The action requested is not valid.</p>
      </div>
    `);
  }

  try {
    const status = (action as string).toUpperCase();
    console.log(`[Quotation Respond] Action: ${action}, Status: ${status}, ID: ${id}, Reason: ${reason}`);

    let quotation;

    // If rejected and reason provided, use specific method
    if (status === 'REJECTED' && reason) {
      quotation = await rejectQuotationWithReasonModel(id, reason);
    } else {
      quotation = await updateQuotationStatusModel(id, status);
    }

    // Create Notification
    const title = status === 'ACCEPTED' ? 'Quotation Accepted! 🎉' : 'Quotation Rejected';
    // Include reason in message if available
    const message = status === 'REJECTED' && reason
      ? `Quotation for ${quotation.companyName} was rejected. Reason: "${reason}"`
      : `Quotation for ${quotation.companyName} has been ${action}.`;

    const type = status === 'ACCEPTED' ? 'SUCCESS' : 'WARNING';

    console.log(`[Notification] Attempting to create: ${title}`);
    await createNotificationModel(title, message, type, id, quotation.createdById);
    console.log(`[Notification] Successfully created notification for ${id}`);

    // If it's an API call (JSON), respond with JSON
    if (req.headers.accept === 'application/json' || req.method === 'POST') {
      return res.json({ success: true, message: "Response recorded" });
    }

    // Otherwise respond with HTML (for email links)
    res.send(`
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 80px 20px; background-color: #f3f4f6; min-height: 100vh;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="font-size: 64px; margin-bottom: 24px;">${status === 'ACCEPTED' ? '🎉' : '📩'}</div>
          <h1 style="color: #111827; margin: 0 0 12px; font-size: 28px; font-weight: 800;">Thank You!</h1>
          <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin: 0;">We have received your response regarding the quotation. Our team has been notified and will contact you shortly.</p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Solarica Energy India</p>
          </div>
        </div>
      </div>
    `);
  } catch (error: any) {
    if (req.headers.accept === 'application/json') {
      return res.status(500).json({ message: error.message });
    }
    res.status(500).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #ef4444;">Error</h1>
        <p>Something went wrong while processing your request. Please try again later.</p>
      </div>
    `);
  }
};

// Update quotation (General)
export const updateQuotation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = (req as any).user.id;
  const rawRole = (req as any).user.role;
  const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();

  try {
    const quotation = await getQuotationByIdModel(id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Permission check
    if (userRole !== 'admin' && userRole !== 'operation' && userRole !== 'operations' && userRole !== 'accounting' && userRole !== 'account' && quotation.createdById !== userId) {
      return res.status(403).json({ message: "Not authorized to update this quotation" });
    }

    const updatedQuotation = await updateQuotationModel(id, updateData);
    res.json({
      message: "Quotation updated successfully",
      data: updatedQuotation
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete quotation (Admin only)
export const deleteQuotation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const quotation = await getQuotationByIdModel(id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Only admin can delete quotations (or the owner if we want to allow it, but the comment says Admin only)
    // Checking comment vs standard practice. Comment says Admin only.
    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Only administrators can delete quotations" });
    }

    const result = await deleteQuotationModel(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Quotation not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get service types (Public)
export const getServiceTypes = async (req: Request, res: Response) => {
  res.json({
    message: "Service types retrieved successfully",
    serviceTypes: SERVICE_TYPES
  });
};

// Download PDF (Public endpoint with signed URL)
export const downloadPDF = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const quotation = await getQuotationByIdModel(id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // If PDF is missing, try to generate it now (Fallback for Redis/Worker failures)
    if (!quotation.pdfFilePath) {
      console.log(`[Download PDF] PDF not found for ${id}, generating on-demand...`);
      const updatedQuotation = await generateQuotationPDFModel(id);
      quotation.pdfFilePath = updatedQuotation.pdfFilePath;
    }

    const { url } = await getPDFDownloadURLModel(id);
    res.json({
      message: "PDF download URL generated successfully",
      url,
      expiresIn: "24 hours"
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const generateQuotationPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quotation = await generateQuotationPDFModel(id);

    res.json({
      message: "PDF generated successfully",
      data: quotation
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadQuotationDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const quotation = await getQuotationByIdModel(id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const updateData: any = {};

    const uploadFile = async (file: Express.Multer.File, fieldName: string) => {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `quotations/${id}/${fieldName}_${Date.now()}.${fileExt}`;
      return await uploadPDFToSupabase(file.buffer, fileName, file.mimetype, 'documents');
    };

    if (files && files['doc1']) updateData.doc1 = await uploadFile(files['doc1'][0], 'doc1');
    if (files && files['doc2']) updateData.doc2 = await uploadFile(files['doc2'][0], 'doc2');
    if (files && files['doc3']) updateData.doc3 = await uploadFile(files['doc3'][0], 'doc3');

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No documents provided" });
    }

    const updatedQuotation = await updateQuotationDocsModel(id, updateData);

    res.json({
      message: "Documents uploaded successfully",
      data: updatedQuotation
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuotationDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[getQuotationDocs] Fetching docs for ID: ${id}`);
    const urls = await getQuotationDocsURLModel(id);
    console.log(`[getQuotationDocs] Found URLs:`, urls);

    res.json({
      message: "Document URLs retrieved successfully",
      data: urls
    });
  } catch (error: any) {
    if (error.message === 'Quotation not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get next estimate number for a company
export const getNextEstimateNumber = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.query;

    if (!companyName || typeof companyName !== 'string') {
      return res.status(400).json({ message: "Company name is required" });
    }

    const nextEstimateNumber = await getNextEstimateNumberModel(companyName);

    res.json({
      nextEstimateNumber
    });
  } catch (error: any) {
    if (error.message.includes('Unknown company')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Export upload middleware for use in routes

export { upload, uploadDocs };

