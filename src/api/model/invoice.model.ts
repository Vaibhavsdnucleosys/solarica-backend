import prisma from "../../config/prisma";
import { generateInvoicePDF } from "../../services/pdf.service";
import { uploadPDFToSupabase, generateSignedURL, deletePDFFromSupabase } from "../../config/supabase";
import { sendInvoiceEmail } from "../../services/email.service";
import { queueInvoicePDFJob } from "../../queues/invoice.queue";
import { normalizeInvoiceData } from "../../utils/normalizeInvoiceData";
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
    watt?: number;
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
  transportDescription?: string,
  trackingNumber?: string,
  documentTitle?: string,
  voucherId?: string,
  officerName?: string,
officerContact?: string,
systemCapacity?: string,
leadId?: string
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
let assignedToId = null;

if (leadId) {

  const lead =
    await prisma.lead.findUnique({

      where: {
        id: String(leadId)
      }

    });

  assignedToId =
    lead?.assignedToId || null;
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
        transportDescription,
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
         officerName,
  officerContact,
  systemCapacity,
   leadId,

  assignedToId,
        pdfStatus: "PENDING",
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
        },
        lead: {

  select: {

    id: true,

    name: true,

    phone: true,

    assignedToId: true,
    status: true,
  }

},
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
           watt: item.watt || 0,
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
// await queueInvoicePDFJob(result.id);
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
        // lead: true,
         lead: {
    select: {
      id: true,
    status: true,
  company: true,
        assignedToId: true
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

  // if (normalizedRole !== 'admin' && normalizedRole !== 'operation' && normalizedRole !== 'operations' && normalizedRole !== 'accounting' && normalizedRole !== 'account') {
  //   where.createdById = userId;
  // }
  if (normalizedRole !== "admin") {

  where.OR = [

    {
      createdById: userId
    },

    {
      assignedToId: userId
    }

  ];
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
      lead: {
    select: {
      id: true,
    status: true,
  company: true,
        assignedToId: true
    }},
      paymentProofs: {
        include: {
          uploadedBy: { select: { id: true, name: true } }
        }},
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
// export const updateInvoiceModel = async (id: string, updateData: any, userId: string, userRole: any) => {
//   // Check if invoice exists and user has permission
//   const existingInvoice = await prisma.invoice.findUnique({
//     where: { id }
//   });

//   if (!existingInvoice) {
//     throw new Error('Invoice not found');
//   }

//   // Normalize role
//   const normalizedRole = (typeof userRole === 'object' ? userRole?.name : userRole)?.toLowerCase()?.trim();

//   if (normalizedRole !== 'admin' && normalizedRole !== 'operation' && normalizedRole !== 'operations' && normalizedRole !== 'accounting' && normalizedRole !== 'account' && existingInvoice.createdById !== userId) {
//     throw new Error('Not authorized to update this invoice');
//   }

//   // Update invoice
//   // const updatedInvoice = await prisma.invoice.update({
//   //   where: { id },
//   //   data: updateData,
//   //   include: {
//   //     createdBy: {
//   //       select: {
//   //         id: true,
//   //         name: true,
//   //         email: true,
//   //         phone: true,
//   //       },
//   //     },
//   //     items: true
//   //   }
//   // });

//     // Normalize frontend payload
//   const normalizedData =
//     normalizeInvoiceData(updateData);

//   // Delete old items first
//   await prisma.invoiceItem.deleteMany({
//     where: {
//       invoiceId: id
//     }
//   });

//   // Update invoice
//   const updatedInvoice =
//     await prisma.invoice.update({

//       where: { id },

//       data: {

//         companyName:
//           normalizedData.companyName,

//         invoiceNumber:
//           normalizedData.invoiceNumber,

//         invoiceDate:
//           normalizedData.invoiceDate,

//         gstinNumber:
//           normalizedData.gstinNumber,

//         paymentStatus:
//           normalizedData.paymentStatus,

//         status:
//           normalizedData.status,

//         modeOfDispatch:
//           normalizedData.modeOfDispatch,

//         customerName:
//           normalizedData.customerName,

//         customerAddress:
//           normalizedData.customerAddress,

//         customerContact:
//           normalizedData.customerContact,

//         customerEmail:
//           normalizedData.customerEmail,

//         customerGstinUin:
//           normalizedData.customerGstinUin,

//         recipientName:
//           normalizedData.recipientName,

//         shippingAddress:
//           normalizedData.shippingAddress,

//         stateCode:
//           normalizedData.stateCode,

//         placeOfSupply:
//           normalizedData.placeOfSupply,

//         bankName:
//           normalizedData.bankName,

//         accountNumber:
//           normalizedData.accountNumber,

//         ifscCode:
//           normalizedData.ifscCode,

//         termsAndConditions:
//           normalizedData.termsAndConditions,

//         netAmount:
//           normalizedData.netAmount,

//         cashDiscount:
//           normalizedData.cashDiscount,

//         cgst:
//           normalizedData.cgst,

//         sgst:
//           normalizedData.sgst,

//         roundOff:
//           normalizedData.roundOff,

//         grandTotalPayable:
//           normalizedData.grandTotalPayable,

//         items: {

//           create:
//             normalizedData.items.map(
//               (item: any) => ({

//                 itemDescription:
//                   item.itemDescription,

//                 hsnSac:
//                   item.hsnSac,

//                 quantity:
//                   item.quantity,

//                 unit:
//                   item.unit,

//                 rate:
//                   item.rate,

//                 discount:
//                   item.discount,

//                 amount:
//                   item.amount
//               })
//             )
//         }
//       },

//       include: {
//         createdBy: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             phone: true,
//           },
//         },

//         items: true
//       }
//     });

//   // return updatedInvoice;

//   return updatedInvoice;
// };

// export const updateInvoiceModel = async (
//     id: string,
//     updateData: Record<string, unknown>,
//     userId: string,
//     userRole: string
// ) => {

//     // EXISTING INVOICE

//     const existingInvoice =
//         await prisma.invoice.findUnique({
//             where: { id },
//             include: {
//                 items: true
//             }
//         });

//     if (!existingInvoice) {
//         throw new Error(
//             "Invoice not found"
//         );
//     }

//     // ROLE CHECK

//     const normalizedRole =
//         userRole?.toLowerCase()?.trim();

//     if (
//         normalizedRole !== "admin" &&
//         normalizedRole !== "operation" &&
//         normalizedRole !== "operations" &&
//         normalizedRole !== "accounting" &&
//         normalizedRole !== "account" &&
//         existingInvoice.createdById !== userId
//     ) {
//         throw new Error(
//             "Not authorized to update this invoice"
//         );
//     }

//     // NORMALIZE

//     const normalizedData =
//         normalizeInvoiceData(updateData);

//     // SAFE FINAL DATA

//     const finalData = {

//         companyName:
//             normalizedData.companyName ??
//             existingInvoice.companyName,

//         invoiceNumber:
//             normalizedData.invoiceNumber ??
//             existingInvoice.invoiceNumber,

//         invoiceDate:
//             normalizedData.invoiceDate ??
//             existingInvoice.invoiceDate,

//         gstinNumber:
//             normalizedData.gstinNumber ??
//             existingInvoice.gstinNumber,

//         paymentStatus:
//             normalizedData.paymentStatus ??
//             existingInvoice.paymentStatus,

//         status:
//             normalizedData.status ??
//             existingInvoice.status,

//         modeOfDispatch:
//             normalizedData.modeOfDispatch ??
//             existingInvoice.modeOfDispatch,

//         transportThrough:
//             normalizedData.transportThrough ??
//             existingInvoice.transportThrough,

//         transportDescription:
//             normalizedData.transportDescription ??
//             existingInvoice.transportDescription,

//         trackingNumber:
//             normalizedData.trackingNumber ??
//             existingInvoice.trackingNumber,

//         customerName:
//             normalizedData.customerName ??
//             existingInvoice.customerName,

//         customerAddress:
//             normalizedData.customerAddress ??
//             existingInvoice.customerAddress,

//         customerContact:
//             normalizedData.customerContact ??
//             existingInvoice.customerContact,

//         customerEmail:
//             normalizedData.customerEmail ??
//             existingInvoice.customerEmail,

//         customerGstinUin:
//             normalizedData.customerGstinUin ??
//             existingInvoice.customerGstinUin,

//         recipientName:
//             normalizedData.recipientName ??
//             existingInvoice.recipientName,

//         shippingAddress:
//             normalizedData.shippingAddress ??
//             existingInvoice.shippingAddress,

//         stateCode:
//             normalizedData.stateCode ??
//             existingInvoice.stateCode,

//         placeOfSupply:
//             normalizedData.placeOfSupply ??
//             existingInvoice.placeOfSupply,

//         bankName:
//             normalizedData.bankName ??
//             existingInvoice.bankName,

//         accountNumber:
//             normalizedData.accountNumber ??
//             existingInvoice.accountNumber,

//         ifscCode:
//             normalizedData.ifscCode ??
//             existingInvoice.ifscCode,

//         termsAndConditions:
//             normalizedData.termsAndConditions ??
//             existingInvoice.termsAndConditions,

//         amountInWords:
//             normalizedData.amountInWords ??
//             existingInvoice.amountInWords,

//         category:
//             normalizedData.category ??
//             existingInvoice.category,

//         currency:
//             normalizedData.currency ??
//             existingInvoice.currency,

//         exchangeRate:
//             normalizedData.exchangeRate ??
//             existingInvoice.exchangeRate,

//         swiftCode:
//             normalizedData.swiftCode ??
//             existingInvoice.swiftCode,

//         salesPersonName:
//             normalizedData.salesPersonName ??
//             existingInvoice.salesPersonName,

//         salesPersonPhone:
//             normalizedData.salesPersonPhone ??
//             existingInvoice.salesPersonPhone,

//         officerName:
//             normalizedData.officerName ??
//             existingInvoice.officerName,

//         officerContact:
//             normalizedData.officerContact ??
//             existingInvoice.officerContact,

//         systemCapacity:
//             normalizedData.systemCapacity ??
//             existingInvoice.systemCapacity,

//         netAmount:
//             normalizedData.netAmount ??
//             existingInvoice.netAmount,

//         cashDiscount:
//             normalizedData.cashDiscount ??
//             existingInvoice.cashDiscount,

//         cgst:
//             normalizedData.cgst ??
//             existingInvoice.cgst,

//         sgst:
//             normalizedData.sgst ??
//             existingInvoice.sgst,

//         roundOff:
//             normalizedData.roundOff ??
//             existingInvoice.roundOff,

//         grandTotalPayable:
//             normalizedData.grandTotalPayable ??
//             existingInvoice.grandTotalPayable,
//     };

//     // UPDATE ITEMS ONLY IF ITEMS SENT

//     const hasItemsInPayload =
//         Object.prototype.hasOwnProperty.call(
//             updateData,
//             "items"
//         );

//     if (
//         hasItemsInPayload &&
//         Array.isArray(normalizedData.items)
//     ) {

//         await prisma.invoiceItem.deleteMany({
//             where: {
//                 invoiceId: id
//             }
//         });

//         await prisma.invoiceItem.createMany({
//             data: normalizedData.items.map(
//                 (item: any) => ({

//                     invoiceId: id,

//                     itemDescription:
//                         item.itemDescription || "",

//                     hsnSac:
//                         item.hsnSac || "",

//                     quantity:
//                         Number(
//                             item.quantity || 0
//                         ),

//                     unit:
//                         item.unit || "PCS",

//                     rate:
//                         Number(item.rate || 0),

//                     discount:
//                         Number(
//                             item.discount || 0
//                         ),

//                     amount:
//                         Number(item.amount || 0),
//                 })
//             )
//         });
//     }

//     // UPDATE INVOICE

//     const updatedInvoice =
//         await prisma.invoice.update({

//             where: { id },

//             data: finalData,

//             include: {

//                 createdBy: {
//                     select: {
//                         id: true,
//                         name: true,
//                         email: true,
//                         phone: true,
//                     },
//                 },

//                 items: true,
//             },
//         });

//     return updatedInvoice;
// };



export const updateInvoiceModel = async (
    id: string,
    updateData: Record<string, unknown>,
    userId: string,
    userRole: string
) => {

    // EXISTING INVOICE

    const existingInvoice =
        await prisma.invoice.findUnique({
            where: { id },
            include: {
                items: true
            }
        });

    if (!existingInvoice) {
        throw new Error(
            "Invoice not found"
        );
    }

    // ROLE CHECK

    const normalizedRole =
        userRole?.toLowerCase()?.trim();

    if (
        normalizedRole !== "admin" &&
        normalizedRole !== "operation" &&
        normalizedRole !== "operations" &&
        normalizedRole !== "accounting" &&
        normalizedRole !== "account" &&
        existingInvoice.createdById !== userId
    ) {
        throw new Error(
            "Not authorized to update this invoice"
        );
    }

    // NORMALIZE DATA

    const normalizedData =
        normalizeInvoiceData(updateData);

    // REMOVE ITEMS FROM MAIN UPDATE

   const {
    items,
    ...invoiceData
} = normalizedData;

    // UPDATE ITEMS ONLY IF SENT

    const hasItemsInPayload =
        Object.prototype.hasOwnProperty.call(
            updateData,
            "items"
        );

    if (
        hasItemsInPayload &&
        Array.isArray(items)
    ) {

        await prisma.invoiceItem.deleteMany({
            where: {
                invoiceId: id
            }
        });

        await prisma.invoiceItem.createMany({
            data: items.map(
                (item: {
                    itemDescription?: string;
                    hsnSac?: string;
                    quantity?: number;
                    unit?: string;
                    rate?: number;
                    discount?: number;
                    amount?: number;
                }) => ({

                    invoiceId: id,

                    itemDescription:
                        item.itemDescription || "",

                    hsnSac:
                        item.hsnSac || "",

                    quantity:
                        Number(
                            item.quantity || 0
                        ),

                    unit:
                        item.unit || "PCS",

                    rate:
                        Number(item.rate || 0),

                    discount:
                        Number(
                            item.discount || 0
                        ),

                    amount:
                        Number(item.amount || 0),
                })
            )
        });
    }

    // MAIN UPDATE
const remainingAmount =
    Number(existingInvoice.grandTotalPayable || 0) -
    Number(normalizedData.paidAmount || 0);
    const updatedInvoice =
        await prisma.invoice.update({


            where: { id },

            // data: invoiceData,

            data: {

    ...invoiceData,

    ...(normalizedData.rejectionReason !== undefined && {
    rejectionReason:
        normalizedData.rejectionReason,
}),

    ...(normalizedData.paidAmount !== undefined && {
        paidAmount:
            normalizedData.paidAmount,
    }),

    ...(normalizedData.paidType !== undefined && {
        paidType:
            normalizedData.paidType,
    }),

    ...(normalizedData.advancedEnabled !== undefined && {
        advancedEnabled:
            normalizedData.advancedEnabled,
    }),

    ...(normalizedData.additionalAmount !== undefined && {
        additionalAmount:
            normalizedData.additionalAmount,
    }),

//     ...(normalizedData.paidAmount !== undefined && {
//         remainingAmount:
//             (
//                 Number(
//                     existingInvoice.grandTotalPayable || 0
//                 ) -
//                 Number(
//                     normalizedData.paidAmount || 0
//                 )
//             ) > 0
//                 ? (
//                     Number(
//                         existingInvoice.grandTotalPayable || 0
//                     ) -
//                     Number(
//                         normalizedData.paidAmount || 0
//                     )
//                 )
//                 : 0,
//     }),
// },

...(normalizedData.paidAmount !== undefined && {
    remainingAmount:
        (
            Number(
                existingInvoice.grandTotalPayable || 0
            ) -

            Number(
                normalizedData.paidAmount || 0
            ) -

            (
                normalizedData.advancedEnabled
                    ? Number(
                        normalizedData.additionalAmount || 0
                      )
                    : 0
            )

        ) > 0
            ? (
                Number(
                    existingInvoice.grandTotalPayable || 0
                ) -

                Number(
                    normalizedData.paidAmount || 0
                ) -

                (
                    normalizedData.advancedEnabled
                        ? Number(
                            normalizedData.additionalAmount || 0
                          )
                        : 0
                )
            )
            : 0,
}),
            },

            include: {

                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },

                items: true,
            },
        });

    return updatedInvoice;
};

// Delete invoice
// export const deleteInvoiceModel = async (id: string, userId: string, userRole: any) => {
//   // Check if invoice exists and user has permission
//   const existingInvoice = await prisma.invoice.findUnique({
//     where: { id }
//   });

//   if (!existingInvoice) {
//     throw new Error('Invoice not found');
//   }

//   if (userRole !== 'admin' && existingInvoice.createdById !== userId) {
//     throw new Error('Not authorized to delete this invoice');
//   }

//   if (existingInvoice.pdfFilePath) {
//     await deletePDFFromSupabase(existingInvoice.pdfFilePath, 'invoices');
//   }

//   // @ts-ignore
//   if (existingInvoice.pdfSalesFilePath) {
//     // @ts-ignore
//     await deletePDFFromSupabase(existingInvoice.pdfSalesFilePath, 'invoices');
//   }


//   // Delete invoice (cascade will delete items)
//   await prisma.invoice.delete({
//     where: { id }
//   });

//   return { message: "Invoice deleted successfully" };
// };

export const deleteInvoiceModel = async (
    id: string,
    userId: string,
    userRole: any
) => {

    // CHECK EXISTING

    const existingInvoice =
        await prisma.invoice.findUnique({
            where: { id }
        });

    if (!existingInvoice) {
        throw new Error("Invoice not found");
    }

    // ROLE CHECK

    const normalizedRole =
        typeof userRole === "object"
            ? userRole?.name
            : userRole;

    if (
        normalizedRole !== "admin" &&
        existingInvoice.createdById !== userId
    ) {
        throw new Error(
            "Not authorized to delete this invoice"
        );
    }

    // DELETE PDFs

    if (existingInvoice.pdfFilePath) {

        await deletePDFFromSupabase(
            existingInvoice.pdfFilePath,
            "invoices"
        );
    }

    // @ts-ignore
    if (existingInvoice.pdfSalesFilePath) {

        // @ts-ignore
        await deletePDFFromSupabase(
            existingInvoice.pdfSalesFilePath,
            "invoices"
        );
    }

    // DELETE CHILD ITEMS FIRST

    await prisma.invoiceItem.deleteMany({
        where: {
            invoiceId: id
        }
    });

    // DELETE INVOICE

    await prisma.invoice.delete({
        where: {
            id
        }
    });

    return {
        message:
            "Invoice deleted successfully"
    };
};

export const getInvoiceDownloadURLModel = async (id: string) => {
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // if (!invoice.pdfFilePath) {
  //   throw new Error('No PDF available for this invoice');
  // }
  if (!invoice.pdfFilePath) {
  throw new Error("PDF not ready yet. Try again later.");
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
      },
       lead: {
    select: {
      id: true,
      status: true,
      company: true,
      assignedToId: true
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

export const convertToTaxInvoiceModel = async (

    id: string,

    userId: string,

    userRole: any,

    taxData: any

) => {

    const existingInvoice =
        await prisma.invoice.findUnique({

            where: { id },

            include: {
                items: true
            }
        });

    if (!existingInvoice) {
        throw new Error(
            "Invoice not found"
        );
    }

    const normalizedRole =
        (
            typeof userRole === "object"
                ? userRole?.name
                : userRole
        )
            ?.toLowerCase()
            ?.trim();

    if (
        normalizedRole !== "admin" &&
        normalizedRole !== "sales" &&
        normalizedRole !== "accounting" &&
        normalizedRole !== "operation" &&
        normalizedRole !== "operations"
    ) {
        throw new Error(
            "Not authorized to convert invoice"
        );
    }

    if (
        existingInvoice.invoiceType ===
        "TAX_INVOICE"
    ) {
        throw new Error(
            "Tax Invoice already generated"
        );
    }

    // CALCULATE TOTAL TAX

    const totalTaxAmount =

        (existingInvoice.cgst || 0) +

        (existingInvoice.sgst || 0) +

        (existingInvoice.igst || 0);

    const updatedInvoice =
        await prisma.invoice.update({

            where: { id },

            data: {

                invoiceType:
                    "TAX_INVOICE",

                status:
                    "TAX_INVOICE_GENERATED",

                taxInvoiceGeneratedAt:
                    new Date(),

                taxInvoiceGeneratedBy:
                    userId,

                totalTaxableAmount:
                    existingInvoice.netAmount,

                totalTaxAmount,

                ewayBillNumber:
                    taxData.ewayBillNumber,

                deliveryNote:
                    taxData.deliveryNote,

                referenceNumber:
                    taxData.referenceNumber,

                referenceDate:
                    taxData.referenceDate
                        ? new Date(
                            taxData.referenceDate
                        )
                        : null,

                buyerOrderNumber:
                    taxData.buyerOrderNumber,

                dispatchDocNumber:
                    taxData.dispatchDocNumber,

                deliveryNoteDate:
                    taxData.deliveryNoteDate
                        ? new Date(
                            taxData.deliveryNoteDate
                        )
                        : null,

                destination:
                    taxData.destination,

                termsOfDelivery:
                    taxData.termsOfDelivery,

                authorizedSignatory:
                    taxData.authorizedSignatory,

                companyPan:
                    taxData.companyPan,

                stateName:
                    taxData.stateName,

                buyerStateName:
                    taxData.buyerStateName,

                lrNumber:
                    taxData.lrNumber,

                vehicleNumber:
                    taxData.vehicleNumber,

                reverseCharge:
                    taxData.reverseCharge,

                taxInvoiceRemarks:
                    taxData.taxInvoiceRemarks
            },

            include: {

                items: true,

                createdBy: true
            }
        });

    return updatedInvoice;
};

