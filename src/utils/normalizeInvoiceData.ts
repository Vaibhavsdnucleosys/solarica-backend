// export const normalizeInvoiceData = (
//     data: Record<string, unknown>
// ) => {

//     const formData =
//         data as {
//             companyName?: string;
//             fromCompanyName?: string;

//             invoiceNumber?: string;
//             invoiceDate?: string | Date;

//             gstinNumber?: string;
//             fromGstin?: string;

//             paymentStatus?: string;
//             status?: string;

//             modeOfDispatch?: string;
//             transportThrough?: string;
//             transportDescription?: string;
//             trackingNumber?: string;

//             customerName?: string;
//             customerAddress?: string;
//             customerContact?: string;
//             customerPhone?: string;
//             customerEmail?: string;

//             customerGstinUin?: string;
//             customerGstin?: string;

//             recipientName?: string;
//             shippingAddress?: string;
//             stateCode?: string;
//             placeOfSupply?: string;

//             bankName?: string;
//             accountNumber?: string;
//             bankAccountNo?: string;

//             ifscCode?: string;
//             bankIfsc?: string;

//             bankBranch?: string;

//             termsAndConditions?: string;

//             amountInWords?: string;

//             category?: string;
//             currency?: string;

//             exchangeRate?: number;
//             swiftCode?: string;

//             salesPersonName?: string;
//             salesPersonPhone?: string;

//             officerName?: string;
//             officerContact?: string;

//             systemCapacity?: string;
//             systemCapacityKw?: number;

//             serviceType?: string;

//             netAmount?: number;
//             cgst?: number;
//             sgst?: number;

//             roundOff?: number;
//             cashDiscount?: number;

//             grandTotalPayable?: number;
//             netPayableAmount?: number;

//             totals?: {
//                 netAmount?: number;
//                 cgst?: number;
//                 sgst?: number;
//                 grandTotal?: number;
//             };

//             items?: Array<{
//                 itemDescription?: string;
//                 description?: string;
//                 itemName?: string;

//                 hsnSac?: string;
//                 hsn?: string;

//                 quantity?: number;
//                 qty?: number;

//                 unit?: string;

//                 rate?: number;

//                 discount?: number;
//                 discPercent?: number;

//                 amount?: number;

//                 specification?: string;
//                 make?: string;

//                 gstRate?: number;
//             }>;
//         };

//     return {

//         // COMPANY

//         companyName:
//             formData.companyName ||
//             formData.fromCompanyName ||
//             "",

//         // INVOICE

//         invoiceNumber:
//             formData.invoiceNumber || "",

//         invoiceDate:
//             formData.invoiceDate
//                 ? new Date(formData.invoiceDate)
//                 : new Date(),

//         // GST

//         gstinNumber:
//             formData.gstinNumber ||
//             formData.fromGstin ||
//             "",

//         // STATUS

//         paymentStatus:
//             formData.paymentStatus ||
//             formData.status ||
//             "PENDING",

//         status:
//             formData.status ||
//             "PENDING",

//         // TRANSPORT

//         modeOfDispatch:
//             formData.modeOfDispatch || "",

//         transportThrough:
//             formData.transportThrough || "",

//         transportDescription:
//             formData.transportDescription || "",

//         trackingNumber:
//             formData.trackingNumber || "",

//         // CUSTOMER

//         customerName:
//             formData.customerName || "",

//         customerAddress:
//             formData.customerAddress || "",

//         customerContact:
//             formData.customerContact ||
//             formData.customerPhone ||
//             "",

//         customerEmail:
//             formData.customerEmail || "",

//         customerGstinUin:
//             formData.customerGstinUin ||
//             formData.customerGstin ||
//             "",

//         // SHIPPING

//         recipientName:
//             formData.recipientName || "",

//         shippingAddress:
//             formData.shippingAddress || "",

//         stateCode:
//             formData.stateCode || "",

//         placeOfSupply:
//             formData.placeOfSupply || "",

//         // BANK

//         bankName:
//             formData.bankName || "",

//         accountNumber:
//             formData.accountNumber ||
//             formData.bankAccountNo ||
//             "",

//         ifscCode:
//             formData.ifscCode ||
//             formData.bankIfsc ||
//             "",

//         bankBranch:
//             formData.bankBranch || "",

//         // TERMS

//         termsAndConditions:
//             formData.termsAndConditions || "",

//         amountInWords:
//             formData.amountInWords || "",

//         // CATEGORY

//         category:
//             formData.category || "DOMESTIC",

//         currency:
//             formData.currency || "INR",

//         exchangeRate:
//             Number(formData.exchangeRate || 0),

//         swiftCode:
//             formData.swiftCode || "",

//         // SALES

//         salesPersonName:
//             formData.salesPersonName || "",

//         salesPersonPhone:
//             formData.salesPersonPhone || "",

//         // OFFICER

//         officerName:
//             formData.officerName || "",

//         officerContact:
//             formData.officerContact || "",

//         // SYSTEM

//         systemCapacity:
//             formData.systemCapacity ||
//             String(formData.systemCapacityKw || ""),

//         serviceType:
//             formData.serviceType || "",

//         // TOTALS

//         netAmount:
//             Number(
//                 formData.netAmount ||
//                 formData.totals?.netAmount ||
//                 0
//             ),

//         cgst:
//             Number(
//                 formData.cgst ||
//                 formData.totals?.cgst ||
//                 0
//             ),

//         sgst:
//             Number(
//                 formData.sgst ||
//                 formData.totals?.sgst ||
//                 0
//             ),

//         grandTotalPayable:
//             Number(
//                 formData.grandTotalPayable ||
//                 formData.netPayableAmount ||
//                 formData.totals?.grandTotal ||
//                 0
//             ),

//         roundOff:
//             Number(formData.roundOff || 0),

//         cashDiscount:
//             Number(formData.cashDiscount || 0),

//         // ITEMS

//         items:
//             Array.isArray(formData.items)
//                 ? formData.items.map((item) => ({

//                       itemDescription:
//                           item.itemDescription ||
//                           item.description ||
//                           item.itemName ||
//                           "",

//                       hsnSac:
//                           item.hsnSac ||
//                           item.hsn ||
//                           "",

//                       quantity:
//                           Number(
//                               item.quantity ||
//                               item.qty ||
//                               0
//                           ),

//                       unit:
//                           item.unit || "PCS",

//                       rate:
//                           Number(item.rate || 0),

//                       discount:
//                           Number(
//                               item.discount ||
//                               item.discPercent ||
//                               0
//                           ),

//                       amount:
//                           Number(item.amount || 0),

//                       specification:
//                           item.specification || "",

//                       make:
//                           item.make || "",

//                       gstRate:
//                           Number(item.gstRate || 0),
//                   }))
//                 : [],
//     };
// };

export const normalizeInvoiceData = (
    data: Record<string, any>
) => {

    const normalized: Record<string, any> = {};

    // COMPANY

    if (
        data.companyName !== undefined ||
        data.fromCompanyName !== undefined
    ) {
        normalized.companyName =
            data.companyName ||
            data.fromCompanyName;
    }

    // INVOICE

    if (data.invoiceNumber !== undefined) {
        normalized.invoiceNumber =
            data.invoiceNumber;
    }

    if (data.invoiceDate !== undefined) {
        normalized.invoiceDate =
            new Date(data.invoiceDate);
    }

    // GST

    if (
        data.gstinNumber !== undefined ||
        data.fromGstin !== undefined
    ) {
        normalized.gstinNumber =
            data.gstinNumber ||
            data.fromGstin;
    }

    // STATUS

    if (
        data.paymentStatus !== undefined ||
        data.status !== undefined
    ) {
        normalized.paymentStatus =
            data.paymentStatus ||
            data.status;
    }

    if (data.status !== undefined) {
        normalized.status = data.status;
    }

if (data.rejectionReason !== undefined) {

    normalized.rejectionReason =
        data.rejectionReason;
}

    // PROFORMA ACCEPT

if (data.proformaAccepted !== undefined) {
    normalized.proformaAccepted =
        data.proformaAccepted;
}

if (data.proformaAcceptedAt !== undefined) {
    normalized.proformaAcceptedAt =
        new Date(data.proformaAcceptedAt);
}

    // CUSTOMER

    if (data.customerName !== undefined) {
        normalized.customerName =
            data.customerName;
    }

    if (data.customerAddress !== undefined) {
        normalized.customerAddress =
            data.customerAddress;
    }

    if (
        data.customerContact !== undefined ||
        data.customerPhone !== undefined
    ) {
        normalized.customerContact =
            data.customerContact ||
            data.customerPhone;
    }

    if (data.customerEmail !== undefined) {
        normalized.customerEmail =
            data.customerEmail;
    }

    if (
        data.customerGstinUin !== undefined ||
        data.customerGstin !== undefined
    ) {
        normalized.customerGstinUin =
            data.customerGstinUin ||
            data.customerGstin;
    }

        // SHIPPING

    if (data.recipientName !== undefined) {
        normalized.recipientName =
            data.recipientName;
    }

    if (data.shippingAddress !== undefined) {
        normalized.shippingAddress =
            data.shippingAddress;
    }

    if (data.stateCode !== undefined) {
        normalized.stateCode =
            data.stateCode;
    }

    if (data.placeOfSupply !== undefined) {
        normalized.placeOfSupply =
            data.placeOfSupply;
    }

    // TRANSPORT

    if (data.modeOfDispatch !== undefined) {
        normalized.modeOfDispatch =
            data.modeOfDispatch;
    }

    if (data.transportThrough !== undefined) {
        normalized.transportThrough =
            data.transportThrough;
    }

    if (data.transportDescription !== undefined) {
        normalized.transportDescription =
            data.transportDescription;
    }

    if (data.trackingNumber !== undefined) {
        normalized.trackingNumber =
            data.trackingNumber;
    }

    // BANK

    if (data.bankName !== undefined) {
        normalized.bankName =
            data.bankName;
    }

    if (
        data.accountNumber !== undefined ||
        data.bankAccountNo !== undefined
    ) {
        normalized.accountNumber =
            data.accountNumber ||
            data.bankAccountNo;
    }

    if (
        data.ifscCode !== undefined ||
        data.bankIfsc !== undefined
    ) {
        normalized.ifscCode =
            data.ifscCode ||
            data.bankIfsc;
    }

    // TERMS

    if (data.termsAndConditions !== undefined) {
        normalized.termsAndConditions =
            data.termsAndConditions;
    }

    if (data.amountInWords !== undefined) {
        normalized.amountInWords =
            data.amountInWords;
    }

    // SALES PERSON

    if (data.salesPersonName !== undefined) {
        normalized.salesPersonName =
            data.salesPersonName;
    }

    if (data.salesPersonPhone !== undefined) {
        normalized.salesPersonPhone =
            data.salesPersonPhone;
    }

    // PUMP FIELDS

    if (data.officerName !== undefined) {
        normalized.officerName =
            data.officerName;
    }

    if (data.officerContact !== undefined) {
        normalized.officerContact =
            data.officerContact;
    }

    if (
        data.systemCapacity !== undefined ||
        data.systemCapacityKw !== undefined
    ) {
        normalized.systemCapacity =
            data.systemCapacity ||
            String(data.systemCapacityKw);
    }

    // EXTRA

    if (data.cashDiscount !== undefined) {
        normalized.cashDiscount =
            Number(data.cashDiscount);
    }

    if (data.roundOff !== undefined) {
        normalized.roundOff =
            Number(data.roundOff);
    }

    // PAYMENT

if (data.paidAmount !== undefined) {
    normalized.paidAmount =
        Number(data.paidAmount);
}

if (data.remainingAmount !== undefined) {
    normalized.remainingAmount =
        Number(data.remainingAmount);
}

if (
    data.paymentType !== undefined ||
    data.paidType !== undefined
) {
    normalized.paidType =
        data.paymentType ||
        data.paidType;
}

if (data.advancedEnabled !== undefined) {
    normalized.advancedEnabled =
        Boolean(data.advancedEnabled);
}

if (data.additionalAmount !== undefined) {
    normalized.additionalAmount =
        Number(data.additionalAmount);
}

    if (data.category !== undefined) {
        normalized.category =
            data.category;
    }

    if (data.currency !== undefined) {
        normalized.currency =
            data.currency;
    }

    if (data.exchangeRate !== undefined) {
        normalized.exchangeRate =
            Number(data.exchangeRate);
    }

    if (data.swiftCode !== undefined) {
        normalized.swiftCode =
            data.swiftCode;
    }

    // TOTALS

    if (
        data.netAmount !== undefined ||
        data.totals?.netAmount !== undefined
    ) {
        normalized.netAmount =
            Number(
                data.netAmount ??
                data.totals?.netAmount
            );
    }

    if (
        data.cgst !== undefined ||
        data.totals?.cgst !== undefined
    ) {
        normalized.cgst =
            Number(
                data.cgst ??
                data.totals?.cgst
            );
    }

    if (
        data.sgst !== undefined ||
        data.totals?.sgst !== undefined
    ) {
        normalized.sgst =
            Number(
                data.sgst ??
                data.totals?.sgst
            );
    }

    if (
        data.grandTotalPayable !== undefined ||
        data.netPayableAmount !== undefined ||
        data.totals?.grandTotal !== undefined
    ) {
        normalized.grandTotalPayable =
            Number(
                data.grandTotalPayable ??
                data.netPayableAmount ??
                data.totals?.grandTotal
            );
    }

    // ITEMS

    if (
        Array.isArray(data.items)
    ) {

        normalized.items =
            data.items.map((item: any) => ({

                itemDescription:
                    item.itemDescription ||
                    item.description ||
                    item.itemName ||
                    "",

                hsnSac:
                    item.hsnSac ||
                    item.hsn ||
                    "",

                quantity:
                    Number(
                        item.quantity ??
                        item.qty ??
                        0
                    ),

                unit:
                    item.unit || "PCS",

                rate:
                    Number(item.rate || 0),

                discount:
                    Number(
                        item.discount ??
                        item.discPercent ??
                        0
                    ),

                amount:
                    Number(item.amount || 0),
            }));
    }

    return normalized;
};