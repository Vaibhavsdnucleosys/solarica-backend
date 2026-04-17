import { Request, Response } from "express";
import { createNotificationModel } from "../model/notification.model";
import {
  createInvoiceModel,
  getNextInvoiceNumberModel,
  getInvoiceByIdModel,
  getAllInvoicesModel,
  updateInvoiceModel,
  deleteInvoiceModel,
  getInvoiceDownloadURLModel,
  sendInvoiceEmailModel,
  rejectInvoiceWithReasonModel,
  updateInvoiceStatusModel,
  convertToProformaModel
} from "../model/invoice.model";
import { generateInvoicePDF } from "../../services/pdf.service";
import { generateSignedURL } from "../../config/supabase";
import prisma from "../../config/prisma";

// Create new invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    console.log("[CreateInvoice] Received Body:", JSON.stringify(req.body, null, 2));
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Extract all invoice data from request body
    const {
      // Company Details
      companyName,
      invoiceNumber,
      invoiceDate,
      gstinNumber,
      paymentStatus,
      modeOfDispatch,

      // Bill To Details
      customerName,
      customerAddress,
      customerContact,
      customerGstinUin,
      customerEmail,

      // Ship To Details
      recipientName,
      shippingAddress,
      stateCode,
      placeOfSupply,

      // Financial Details
      netAmount,
      cashDiscount,
      cgst,
      sgst,
      roundOff,
      grandTotalPayable,

      // Bank Details
      bankName,
      accountNumber,
      ifscCode,
      termsAndConditions,
      amountInWords,

      // Export Details
      category,
      currency,
      exchangeRate,
      swiftCode,

      // Items
      items,

      // Sales Person Details (Optional)
      salesPersonName,
      salesPersonPhone,
      transportThrough,
      trackingNumber,
      voucherId
    } = req.body;

    console.log("DEBUG: Received Sales Person Data:", { salesPersonName, salesPersonPhone });

    console.log("[CreateInvoice] Request Payload:", JSON.stringify(req.body, null, 2));

    const documentTitle = category === 'TAX_INVOICE' ? 'DELIVERY CHALLAN' : 'ESTIMATE';

    // Fetch full user details to get phone number
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true }
    });

    console.log(`[createInvoice] User: ${user?.name}, Phone: ${user?.phone}`);

    const finalSalesPersonName = salesPersonName || user?.name;
    const finalSalesPersonPhone = salesPersonPhone || user?.phone;

    const invoice = await createInvoiceModel(
      userId,
      companyName,
      invoiceNumber,
      new Date(invoiceDate),
      customerName,
      customerAddress,
      customerContact,
      customerEmail || "",
      Number(netAmount || 0),
      Number(grandTotalPayable || 0),
      items,
      gstinNumber,
      paymentStatus,
      modeOfDispatch,
      customerGstinUin,
      recipientName,
      shippingAddress,
      stateCode,
      placeOfSupply,
      Number(cashDiscount || 0),
      Number(cgst || 0),
      Number(sgst || 0),
      Number(roundOff || 0),
      bankName,
      accountNumber,
      ifscCode,
      termsAndConditions,
      amountInWords,
      category,
      currency,
      exchangeRate,
      swiftCode,
      finalSalesPersonName,
      finalSalesPersonPhone,
      transportThrough,
      trackingNumber,
      documentTitle,
      voucherId
    );

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });
  } catch (error: any) {
    console.error("!!! Error creating invoice !!!");
    console.error("Error Message:", error.message);
    if (error.code) console.error("Prisma Error Code:", error.code);
    if (error.meta) console.error("Prisma Error Meta:", JSON.stringify(error.meta));
    console.error("Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
      code: error.code
    });
  }
};

// Get invoice by ID
export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const rawRole = (req as any).user.role;
    const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();

    const invoice = await getInvoiceByIdModel(id);

    // Check if user has permission to view this invoice
    if (userRole !== 'admin' && userRole !== 'operation' && userRole !== 'operations' && userRole !== 'accounting' && userRole !== 'account' && invoice.createdById !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this invoice"
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error: any) {
    console.error("[InvoiceController] Error fetching by id:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch invoice"
    });
  }
};

// Get all invoices
export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    console.log("[Get All Invoices] Starting request...");
    const userId = (req as any).user.id;
    const rawRole = (req as any).user.role;
    const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();
    const filters = req.query;

    console.log("[Get All Invoices] User ID:", userId);
    console.log("[Get All Invoices] User Role:", userRole);
    console.log("[Get All Invoices] Filters:", filters);

    const invoices = await getAllInvoicesModel(userId, userRole, filters);

    console.log("[Get All Invoices] Successfully fetched", invoices.length, "invoices");

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error: any) {
    console.error("[Get All Invoices] Error:", error);
    console.error("[Get All Invoices] Error Message:", error.message);
    console.error("[Get All Invoices] Error Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update invoice
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const rawRole = (req as any).user.role;
    const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();
    const updateData = req.body;

    const updatedInvoice = await updateInvoiceModel(id, updateData, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update invoice"
    });
  }
};

// Delete invoice
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const result = await deleteInvoiceModel(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete invoice"
    });
  }
};

// Convert to Proforma Invoice
export const convertToProforma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // const result = await convertToProformaModel(id, userId, userRole);
const { advancedEnabled, additionalAmount } = req.body;

const result = await convertToProformaModel(
  id,
  userId,
  userRole,
  advancedEnabled,
  additionalAmount
);

    // Create Notification about the conversion
    const title = 'Estimate Converted! 🔄';
    const message = `Estimate ${result.invoiceNumber} for ${result.customerName} has been converted into a Proforma Invoice.`;
    const type = 'INFO';

    // We notify the accounting team, so we pass null/undefined for userId to broadcast to relevant users 
    // based on how notifications are currently fetched, or pass the creator's ID. 
    // Currently Notifications table has userId?
    await createNotificationModel(title, message, type, result.id, result.createdById);


    res.status(200).json({
      success: true,
      message: "Converted to Proforma Invoice successfully",
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to convert to Proforma Invoice"
    });
  }
};

// Download PDF (Public endpoint with signed URL)
export const downloadInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { url } = await getInvoiceDownloadURLModel(id);
    res.json({
      message: "PDF download URL generated successfully",
      url,
      expiresIn: "24 hours"
    });
  } catch (error: any) {
    if (error.message === 'Invoice not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'No PDF available for this invoice') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Delivery Preview (PDF) - From HEAD
export const getDeliveryPreview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const invoice = await getInvoiceByIdModel(id);

    // Override date if provided
    const previewData = {
      ...invoice,
      invoiceDate: date ? new Date(date as string) : invoice.invoiceDate,
      documentTitle: 'DELIVERY CHALLAN'
    };

    const pdfBuffer = await generateInvoicePDF(previewData, 'SALES'); // Explicitly delivery challan usually

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="delivery-challan-${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    if (error.message === 'Invoice not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Failed to generate delivery preview" });
  }
};

// Send Invoice Email - From Tally
// export const sendInvoiceEmail = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const result = await sendInvoiceEmailModel(id);

//     res.json({
//       message: "Invoice sent successfully",
//       data: result
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const sendInvoiceEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log("📩 API HIT - send email");
    console.log("Invoice ID:", id);

    const result = await sendInvoiceEmailModel(id);

    res.json({
      message: "Invoice sent successfully",
      data: result
    });
  } catch (error: any) {
    console.error("❌ CONTROLLER ERROR:", error); // 👈 ADD THIS
    res.status(500).json({ message: error.message });
  }
};

// Generate Invoice with Delivery Date - From Tally
export const generateInvoiceWithDeliveryDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Expecting ?date=YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, message: "Delivery date is required in query params (?date=...)" });
    }

    const invoice = await getInvoiceByIdModel(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Attach temporary delivery date for PDF generation
    const invoiceWithDate = {
      ...invoice,
      deliveryDate: date
    };

    const pdfBuffer = await generateInvoicePDF(invoiceWithDate, 'SALES');

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Delivery-Challan-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error("Error generating delivery invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice with delivery date",
      error: error.message
    });
  }
};

// Download Sales Invoice - From Tally
export const downloadSalesInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceByIdModel(id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Use stored PDF if available
    // [DEBUG] Forced regeneration to ensure correct template is used
    /*
    // @ts-ignore
    if (invoice.pdfSalesFilePath) {
      try {
        // @ts-ignore
        const signedURL = await generateSignedURL(invoice.pdfSalesFilePath, 'invoices');
        return res.redirect(signedURL);
      } catch (e) {
        console.error("Failed to get signed URL for sales invoice, regenerating...", e);
      }
    }
    */

    console.log(`[DownloadSalesInvoice] Generating PDF for Invoice ${invoice.invoiceNumber}`);
    console.log(`[DownloadSalesInvoice] Category: ${invoice.category}`);
    console.log(`[DownloadSalesInvoice] Using STANDARD template (should be Domestic/Estimate)`);

    // Regenerate on the fly if not stored
    // const pdfBuffer = await generateInvoicePDF(invoice, 'STANDARD');
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=Sales-Invoice-${invoice.invoiceNumber}.pdf`);
    // res.send(pdfBuffer);

const pdfBuffer = await generateInvoicePDF(invoice, 'STANDARD');
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `inline; filename=Sales-Invoice-${invoice.invoiceNumber}.pdf`);
res.send(pdfBuffer);

  } catch (error: any) {
    console.error("Error downloading sales invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download sales invoice",
      error: error.message
    });
  }
};
// Get Next Invoice Number
export const getNextInvoiceNumber = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.query;

    if (!companyName || typeof companyName !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Company Name is required to generate invoice number"
      });
    }

    const nextInvoiceNumber = await getNextInvoiceNumberModel(companyName);

    res.status(200).json({
      success: true,
      nextInvoiceNumber
    });
  } catch (error: any) {
    console.error("Error generating next invoice number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate next invoice number",
      error: error.message
    });
  }
};

// Get next export estimate number based on company
export const getNextExportNumber = async (req: Request, res: Response) => {
  try {
    const { companyName } = req.query;

    if (!companyName || typeof companyName !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Company name is required"
      });
    }

    // Determine prefix based on company
    let prefix = 'EXP';
    if (companyName.includes('Systems')) {
      prefix = 'SS';
    } else if (companyName.includes('Industries')) {
      prefix = 'SI';
    } else if (companyName.includes('Energy')) {
      prefix = 'SE';
    } else if (companyName.includes('Fabtech')) {
      prefix = 'SF';
    }

    // Get the highest existing number with this prefix from the invoices table
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      },
      select: {
        invoiceNumber: true
      }
    });

    let maxNumber = 0;

    if (latestInvoice?.invoiceNumber) {
      const match = latestInvoice.invoiceNumber.match(new RegExp(`${prefix}-(\\d+)`));
      if (match) {
        maxNumber = parseInt(match[1], 10);
      }
    }

    const nextNumber = maxNumber + 1;
    const paddedNumber = String(nextNumber).padStart(2, '0');
    const nextExportNumber = `${prefix}-${paddedNumber}`;

    await prisma.$disconnect();

    res.status(200).json({
      success: true,
      nextExportNumber
    });
  } catch (error: any) {
    console.error("Error getting next export number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get next export number",
      error: error.message
    });
  }
};

// Update invoice status (Public endpoint for email responses)
export const respondToInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.query;
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
    console.log(`[Invoice Respond] Action: ${action}, Status: ${status}, ID: ${id}, Reason: ${reason}`);

    let invoice;

    if (status === 'REJECTED' && reason) {
      invoice = await rejectInvoiceWithReasonModel(id, reason);
    } else {
      invoice = await updateInvoiceStatusModel(id, status);
    }

    // Create Notification
    const title = status === 'ACCEPTED' ? 'Estimate Accepted! 🎉' : 'Estimate Rejected';
    const message = status === 'REJECTED' && reason
      ? `Estimate ${invoice.invoiceNumber} for ${invoice.customerName} was rejected. Reason: "${reason}"`
      : `Estimate ${invoice.invoiceNumber} for ${invoice.customerName} has been ${action}.`;

    const type = status === 'ACCEPTED' ? 'SUCCESS' : 'WARNING';

    await createNotificationModel(title, message, type, id, invoice.createdById);

    if (req.headers.accept === 'application/json' || req.method === 'POST') {
      return res.json({ success: true, message: "Response recorded" });
    }

    res.send(`
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 80px 20px; background-color: #f3f4f6; min-height: 100vh;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="font-size: 64px; margin-bottom: 24px;">${status === 'ACCEPTED' ? '🎉' : '📩'}</div>
          <h1 style="color: #111827; margin: 0 0 12px; font-size: 28px; font-weight: 800;">Thank You!</h1>
          <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin: 0;">We have received your response regarding the estimate. Our team has been notified and will contact you shortly.</p>
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


