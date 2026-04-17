import prisma from "../../config/prisma";
import { generateInvoicePDF } from "../../services/pdf.service";
import { uploadPDFToSupabase, generateSignedURL, deletePDFFromSupabase } from "../../config/supabase";
import { sendInvoiceEmail } from "../../services/email.service";

// Create new invoice
export const createInvoiceModel = async (
  createdById: string, // Required first

  // Company Details (Required)
  companyName: string,
  invoiceNumber: string,
  invoiceDate: Date,

  // Bill To Details (Required)
  customerName: string,
  customerAddress: string,
  customerContact: string,
  customerEmail: string,

  // Financial Details (Required)
  netAmount: number,
  grandTotalPayable: number,

  // Items (Required)
  items: Array<{
    itemDescription: string;
    hsnSac?: string;
    quantity: number;
    unit?: string;
    rate: number;
    discount?: number;
    amount: number;
  }>,

  // Optional Parameters
  gstinNumber?: string,
  paymentStatus?: string,
  modeOfDispatch?: string,
  customerGstinUin?: string,
  recipientName?: string,
  shippingAddress?: string,
  stateCode?: string,
  placeOfSupply?: string,
  cashDiscount?: number,
  cgst?: number,
  sgst?: number,
  roundOff?: number,
  bankName?: string,
  accountNumber?: string,
  ifscCode?: string,
  termsAndConditions?: string,
  amountInWords?: string,
  category?: string,
  currency?: string,
  exchangeRate?: number,
  swiftCode?: string,
  salesPersonName?: string,
  salesPersonPhone?: string,
  transportThrough?: string,
  trackingNumber?: string,
  documentTitle?: string,
  voucherId?: string
) => {
  console.log(`[createInvoiceModel] Starting creation for: ${invoiceNumber} by ${createdById}`);
  console.log(`[createInvoiceModel] Category: ${category}, Title: ${documentTitle}`);

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: createdById }
  });
  if (!user) {
    console.error(`[createInvoiceModel] User NOT found: ${createdById}`);
    throw new Error(`User with ID ${createdById} does not exist`);
  }

  // Create invoice with items in a transaction
  console.log("[createInvoiceModel] Starting database transaction...");
  const result = await prisma.$transaction(async (tx: any) => {
    console.log("[createInvoiceModel] Transaction: Creating invoice record...");
    const invoice = await tx.invoice.create({
      data: {
        companyName,
        invoiceNumber,
        invoiceDate,
        gstinNumber,
        paymentStatus: paymentStatus || "PENDING",
        modeOfDispatch,
        transportThrough,
        trackingNumber,
        customerName,
        customerAddress,
        customerContact,
        customerEmail,
        customerGstinUin,
        recipientName,
        shippingAddress,
        stateCode,
        placeOfSupply,
        netAmount,
        cashDiscount: cashDiscount || 0,
        cgst: cgst || 0,
        sgst: sgst || 0,
        roundOff: roundOff || 0,
        grandTotalPayable,
        bankName,
        accountNumber,
        ifscCode,
        termsAndConditions,
        amountInWords,
        category: category || "DOMESTIC",
        currency: currency || "INR",
        createdById,
        salesPersonName,
        salesPersonPhone,
        voucherId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Create invoice items
    if (items && items.length > 0) {
      await tx.invoiceItem.createMany({
        data: items.map(item => ({
          invoiceId: invoice.id,
          itemDescription: item.itemDescription,
          hsnSac: item.hsnSac || null,
          quantity: item.quantity,
          unit: item.unit || null,
          rate: item.rate,
          discount: item.discount || 0,
          amount: item.amount
        }))
      });
    }

    return invoice;
  });
  console.log(`[createInvoiceModel] Transaction successful. Created Invoice ID: ${result.id}`);

  // Generate PDFs and upload to Supabase
  try {
    const completeInvoice = await getInvoiceByIdModel(result.id);
    // Add documentTitle for PDF generation
    const invoiceForPDF = { ...completeInvoice, documentTitle };
    console.log(`[createInvoiceModel] Preparing PDF generation for ${result.id} with title: ${documentTitle}`);

    // 1. Generate & Upload Standard PDF
    try {
      const standardPdfBuffer = await generateInvoicePDF(invoiceForPDF, 'STANDARD');
      const standardPdfUrl = await uploadPDFToSupabase(
        standardPdfBuffer,
        `invoices/${new Date().getFullYear()}/INV-${invoiceNumber}.pdf`,
        'application/pdf',
        'invoices'
      );
      await prisma.invoice.update({
        where: { id: result.id },
        data: { pdfFilePath: standardPdfUrl }
      });
      result.pdfFilePath = standardPdfUrl;
      console.log(`[createInvoiceModel] Standard PDF uploaded: ${standardPdfUrl}`);
    } catch (err: any) {
      console.error("Standard PDF generation failed:", err);
    }

    // 2. Generate & Upload Sales PDF
    try {
      const salesPdfBuffer = await generateInvoicePDF(invoiceForPDF, 'SALES');
      const salesPdfUrl = await uploadPDFToSupabase(
        salesPdfBuffer,
        `invoices/${new Date().getFullYear()}/SALES-INV-${invoiceNumber}.pdf`,
        'application/pdf',
        'invoices'
      );
      await prisma.invoice.update({
        where: { id: result.id },
        // @ts-ignore - Prisma might not have regenerated yet
        data: { pdfSalesFilePath: salesPdfUrl }
      });
      // @ts-ignore
      result.pdfSalesFilePath = salesPdfUrl;
      console.log(`[createInvoiceModel] Sales PDF uploaded: ${salesPdfUrl}`);
    } catch (err: any) {
      console.error("Sales PDF generation failed:", err);
    }

  } catch (pdfError: any) {
    console.error("Failed to generate/upload PDFs:", pdfError);
  }

  return result;

};

// Get invoice by ID with items
export const getInvoiceByIdModel = async (id: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: {
            select: {
              name: true
            }
          }
        }
      },
      items: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
};

// Get all invoices (with role-based access)
export const getAllInvoicesModel = async (userId: string, userRole: any, filters: any = {}) => {
  const { status, search, startDate, endDate, category } = filters;

  // Base query - enforce role-based visibility
  const normalizedRole = (typeof userRole === 'object' ? userRole?.name : userRole)?.toLowerCase()?.trim();
  const where: any = {};

  if (normalizedRole !== 'admin' && normalizedRole !== 'operation' && normalizedRole !== 'operations' && normalizedRole !== 'accounting' && normalizedRole !== 'account') {
    where.createdById = userId;
  }

  if (category) where.category = category;
  if (status) where.paymentStatus = status;
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerContact: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (startDate || endDate) {
    where.invoiceDate = {};
    if (startDate) where.invoiceDate.gte = new Date(startDate);
    if (endDate) where.invoiceDate.lte = new Date(endDate);
  }

  return await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          items: true
        }
      }
    },
  });
};

// Generate Next Invoice Number
export const getNextInvoiceNumberModel = async (companyName: string) => {
  // 1. Determine Initials
  let initials = "";
  const normalizedName = companyName.trim().toLowerCase();

  if (normalizedName.includes("solarica energy india")) {
    initials = "SEI";
  } else if (normalizedName.includes("solarica fabtech")) {
    initials = "SF";
  } else if (normalizedName.includes("solarica greenwheels")) {
    initials = "SG";
  } else {
    // Fallback: First letter of each word, uppercase
    initials = companyName
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
  }

  // 2. Determine Year (YY)
  const currentYearShort = new Date().getFullYear().toString().slice(-2);

  // 3. Construct Prefix
  const prefix = `${initials}-${currentYearShort}`;

  // 4. Find latest invoice number with this prefix
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc' // Assuming we want the latest created one. Ideally sort by invoiceNumber length and value, but string sort is tricky.
      // Better to rely on createdAt for "latest" or try to parse numbers.
      // For now, let's assume lexical sort or createdAt is sufficient if they are created sequentially.
    }
  });

  /*
     Note: String sorting "SEI-2610" vs "SEI-269" might be an issue if not padded.
     But we are padding to 01.
     "SEI-2601", "SEI-2602" ... "SEI-2699", "SEI-26100"
     Lexical sort: "SEI-26100" comes before "SEI-2699".
     So purely relying on `orderBy: { invoiceNumber: 'desc' }` is dangerous if we go beyond 2 digits and don't maintain fixed padding match.
     However, usually `createdAt: 'desc'` is the safest proxy for "most recently generated".
  */

  // Let's refine the query to use createdAt desc as the primary source of truth for "last allocated".

  let nextSequence = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    // Format: PRE-FIX[SEQUENCE]
    // Remove the prefix from the start
    const sequencePart = lastInvoice.invoiceNumber.replace(prefix, "");

    // Parse the remaining part as integer
    const lastSequenceObj = parseInt(sequencePart, 10);

    if (!isNaN(lastSequenceObj)) {
      nextSequence = lastSequenceObj + 1;
    }
  }

  // 5. Format next number with padding (at least 2 digits)
  const paddedSequence = nextSequence.toString().padStart(2, '0');

  return `${prefix}${paddedSequence}`;
};

// Update invoice
export const updateInvoiceModel = async (id: string, updateData: any, userId: string, userRole: any) => {
  // Check if invoice exists and user has permission
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id }
  });

  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  // Normalize role
  const normalizedRole = (typeof userRole === 'object' ? userRole?.name : userRole)?.toLowerCase()?.trim();

  if (normalizedRole !== 'admin' && normalizedRole !== 'operation' && normalizedRole !== 'operations' && normalizedRole !== 'accounting' && normalizedRole !== 'account' && existingInvoice.createdById !== userId) {
    throw new Error('Not authorized to update this invoice');
  }

  // Update invoice
  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      items: true
    }
  });

  return updatedInvoice;
};

// Delete invoice
export const deleteInvoiceModel = async (id: string, userId: string, userRole: any) => {
  // Check if invoice exists and user has permission
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id }
  });

  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  if (userRole !== 'admin' && existingInvoice.createdById !== userId) {
    throw new Error('Not authorized to delete this invoice');
  }

  if (existingInvoice.pdfFilePath) {
    await deletePDFFromSupabase(existingInvoice.pdfFilePath, 'invoices');
  }

  // @ts-ignore
  if (existingInvoice.pdfSalesFilePath) {
    // @ts-ignore
    await deletePDFFromSupabase(existingInvoice.pdfSalesFilePath, 'invoices');
  }


  // Delete invoice (cascade will delete items)
  await prisma.invoice.delete({
    where: { id }
  });

  return { message: "Invoice deleted successfully" };
};

export const getInvoiceDownloadURLModel = async (id: string) => {
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (!invoice.pdfFilePath) {
    throw new Error('No PDF available for this invoice');
  }

  const signedURL = await generateSignedURL(invoice.pdfFilePath, 'invoices');
  return { url: signedURL };
};

// export const sendInvoiceEmailModel = async (invoiceId: string) => {
//   const invoice = await prisma.invoice.findUnique({
//     where: { id: invoiceId },
//     include: {
//       createdBy: {
//         select: {
//           id: true,
//           name: true,
//           email: true
//         }
//       },
//       items: true
//     }
//   });
//   if (!invoice) {
//     throw new Error('Invoice not found');
//   }
//   if (!invoice.pdfFilePath) {
//     throw new Error('PDF not generated for this invoice');
//   }
//   // Generate signed URL for PDF
//   const pdfURL = await generateSignedURL(invoice.pdfFilePath, 'invoices');
//   // Send email
//   await sendInvoiceEmail(invoice, pdfURL);
//   // Update invoice status
//   return await prisma.invoice.update({
//     where: { id: invoiceId },
//     data: {
//       emailSent: true,
//       emailSentAt: new Date(),
//       status: "SENT"
//     },
//   });
// };

// Update invoice status

export const sendInvoiceEmailModel = async (invoiceId: string) => {
  try {
    console.log("📦 MODEL START");

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        createdBy: true,
        items: true
      }
    });

    console.log("📄 Invoice Data:", invoice);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (!invoice.pdfFilePath) {
      console.log("❌ PDF NOT FOUND");
      throw new Error('PDF not generated for this invoice');
    }

    console.log("📁 PDF PATH:", invoice.pdfFilePath);

    // Generate signed URL
    const pdfURL = await generateSignedURL(invoice.pdfFilePath, 'invoices');

    console.log("🔗 PDF URL:", pdfURL);

    // Send email
    console.log("📧 Sending email to:", invoice.customerEmail);

    await sendInvoiceEmail(invoice, pdfURL);

    console.log("✅ EMAIL SENT");

    // Update DB
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
        status: "SENT"
      },
    });

    return updated;

  } catch (error) {
    console.error("❌ MODEL ERROR:", error); // 👈 VERY IMPORTANT
    throw error;
  }
};
export const updateInvoiceStatusModel = async (id: string, status: string) => {
  return await prisma.invoice.update({
    where: { id },
    data: { status }
  });
};

// Update invoice status with reason (for rejection)
export const rejectInvoiceWithReasonModel = async (id: string, reason: string) => {
  return await prisma.invoice.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectionReason: reason
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

// export const convertToProformaModel = async (id: string, userId: string, userRole: any) => {


export const convertToProformaModel = async (
  id: string,
  userId: string,
  userRole: any,
  advanced?: boolean,
  additionalAmount?: number
) => {

  // Check if invoice exists and user has permission
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id }
  });

  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  // Normalize role
  const normalizedRole = (typeof userRole === 'object' ? userRole?.name : userRole)?.toLowerCase()?.trim();

  if (normalizedRole !== 'admin' && normalizedRole !== 'operation' && normalizedRole !== 'operations' && normalizedRole !== 'accounting' && normalizedRole !== 'account' && existingInvoice.createdById !== userId) {
    throw new Error('Not authorized to convert this invoice');
  }

  if (existingInvoice.isProforma) {
    throw new Error('Invoice is already a Proforma Invoice');
  }

  // Update invoice
  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    // data: { isProforma: true },
    data: {
  isProforma: true,
    advancedEnabled: advanced || false,
    additionalAmount: additionalAmount || 0
  // store additional amount (optional)
},
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: {
            select: { name: true }
          }
        },
      },
      items: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  // Regenerate PDF
  try {
    const invoiceForPDF = { ...updatedInvoice, documentTitle: 'PROFORMA INVOICE' };

    // 1. Generate & Upload Standard PDF
    try {
      const standardPdfBuffer = await generateInvoicePDF(invoiceForPDF, 'STANDARD');
      const standardPdfUrl = await uploadPDFToSupabase(
        standardPdfBuffer,
        `invoices/${new Date().getFullYear()}/INV-${existingInvoice.invoiceNumber}.pdf`,
        'application/pdf',
        'invoices'
      );
      await prisma.invoice.update({
        where: { id },
        data: { pdfFilePath: standardPdfUrl }
      });
      console.log(`[convertToProformaModel] Standard PDF updated: ${standardPdfUrl}`);
    } catch (err: any) {
      console.error("Standard PDF generation failed:", err);
    }

  } catch (pdfError: any) {
    console.error("Failed to generate/upload PDFs:", pdfError);
  }

  return updatedInvoice;
};

