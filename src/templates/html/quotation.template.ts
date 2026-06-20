// export const buildQuotationHTML = (data: any) => {
//   const itemsHtml = (data.items || []).map((item: any, index: number) => `
//     <tr>
//       <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
//       <td style="border: 1px solid #ddd; padding: 8px;">${item.name || item.make1}</td>
//       <td style="border: 1px solid #ddd; padding: 8px;">${item.specification || ''}</td>
//       <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity || ''}</td>
//     </tr>
//   `).join('');

//   return `
//     <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
//           .client-info { margin: 20px 0; }
//           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//           .totals { margin-top: 30px; text-align: right; }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1>${data.customerType?.toLowerCase() === 'society' ? 'SOCIETY QUOTATION' : 'INDIVIDUAL QUOTATION'}</h1>
//           <p>${data.fromCompanyName || 'Solarica Energy India'}</p>
//         </div>
//         <div class="client-info">
//           <p><strong>To:</strong> ${data.companyName}</p>
//           <p><strong>Email:</strong> ${data.companyEmail}</p>
//           <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
//         </div>
//         <table>
//           <thead>
//             <tr style="background-color: #f2f2f2;">
//               <th style="border: 1px solid #ddd; padding: 8px;">Sr.</th>
//               <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
//               <th style="border: 1px solid #ddd; padding: 8px;">Specification</th>
//               <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
//             </tr>
//           </thead>
//           <tbody>${itemsHtml}</tbody>
//         </table>
//         <div class="totals">
//           <p>System Capacity: ${data.systemCapacityKw} kW</p>
//           <p>Total Cost: ₹${data.totalAmount?.toLocaleString('en-IN')}</p>
//           <p><strong>Net Payable: ₹${data.netPayableAmount?.toLocaleString('en-IN')}</strong></p>
//         </div>
//       </body>
//     </html>
//   `;
// };


import { getBase64Image } from './utils';

export const buildQuotationHTML = (data: any): string => {
    const logoBase64 = getBase64Image('src/assets/solarics_logo.webp');
    const qrBase64 = getBase64Image('src/assets/invoice_domestic_qr.png');
    const stampBase64 = getBase64Image('src/assets/invoice_domestic_stamp.png');
    
    const isSociety = data.customerType?.toLowerCase() === 'society';
    const docTitle = isSociety ? "SOCIETY QUOTATION" : "INDIVIDUAL QUOTATION";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        td, th { border: 1px solid #555; padding: 6px; vertical-align: top; }
        .no-border { border: none !important; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .brand-bg { background: #8cc63f; color: #fff; font-weight: bold; }
        .company-name { font-size: 18px; font-weight: bold; }
        .title-box { font-size: 20px; font-weight: bold; text-align: center; background: #f1f1f1; padding: 10px; border: 1px solid #555; margin-bottom: 15px; }
        .section-title { background: #f1f1f1; font-weight: bold; }
    </style>
</head>
<body>
    <table>
        <tr>
            <td style="width:60%;" class="no-border">
                <table class="no-border">
                    <tr>
                        <td class="no-border" style="width:100px;"><img src="${logoBase64}" width="90" /></td>
                        <td class="no-border">
                            <div class="company-name">${data.fromCompanyName || 'SOLARICA ENERGY INDIA PVT LTD'}</div>
                            <div>AUDUMBAR NIVYA COMPLEX, NARHE, PUNE-411041</div>
                            <div>Phone: 8956759167 | Email: Kiran@solarica.in</div>
                            <div><b>GSTIN:</b> 27AALCP2722L1Z4</div>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="width:40%; padding:0;">
                <table style="height: 100%;">
                    <tr><td class="bold">Quotation No.</td><td class="bold">Date</td></tr>
                    <tr><td>QTN-${data.id?.slice(-6).toUpperCase()}</td><td>${new Date().toLocaleDateString('en-GB')}</td></tr>
                    <tr><td class="bold">Validity</td><td>${data.validityDays || 10} Days</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <div class="title-box">${docTitle}</div>

    <table>
        <tr>
            <td style="width: 50%;">
                <div class="bold" style="margin-bottom:5px;">Quotation For:</div>
                <div class="bold" style="font-size:14px;">${data.companyName}</div>
                <div>${data.companyEmail}</div>
                <div>Contact: ${data.companyPhone || 'N/A'}</div>
                ${data.gstNumber ? `<div>GSTIN: ${data.gstNumber}</div>` : ''}
            </td>
       

            <td style="padding:0;">

    <table class="no-border">

        <tr>
            <td class="section-title">System Capacity</td>

            <td>${data.systemCapacityKw} kW</td>
        </tr>

        <tr>
            <td class="section-title">On/Off Grid</td>

            <td>${data.onGrid || 'On-Grid'}</td>
        </tr>

        <tr>
            <td class="section-title">Phase</td>

            <td>${data.phase || 'Three Phase'}</td>
        </tr>

        <tr>
            <td class="section-title">Sales Person</td>

            <td>
                ${data.salesPersonName || data.assignedTo?.name || '-'}
            </td>
        </tr>

        <tr>
            <td class="section-title">Mobile No.</td>

            <td>
                ${data.salesPersonPhone || data.assignedTo?.phone || '-'}
            </td>
        </tr>

    </table>

</td>
        </tr>
    </table>

    <table>
        <tr class="brand-bg">
            <th style="width:40px;">#</th>
            <th>Component Description</th>
            <th>Specifications / Make</th>
            <th style="width:80px;">Qty</th>
        </tr>
        ${(data.items || []).map((item: any, i: number) => `
            <tr>
                <td class="text-center">${i + 1}</td>
                <td class="bold">${item.itemName || item.name || 'Component'}</td>
                <td>
                    ${item.make1 ? `<b>Make:</b> ${item.make1}<br>` : ''}
                    ${item.specification || item.specification1 || ''}
                </td>
                <td class="text-center">${item.quantity || '1 Set'}</td>
            </tr>
        `).join('')}
    </table>

    <table style="width: 350px; margin-left: auto;">
        <tr><td class="section-title">System Cost</td><td class="text-right">₹ ${Number(data.systemCost || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td class="section-title">GST Amount</td><td class="text-right">₹ ${Number(data.gstAmount || 0).toLocaleString('en-IN')}</td></tr>
        ${data.subsidyAmount ? `<tr><td class="section-title">Approx Subsidy</td><td class="text-right" style="color: red;">- ₹ ${Number(data.subsidyAmount).toLocaleString('en-IN')}</td></tr>` : ''}
        <tr class="brand-bg"><td class="bold">Net Payable</td><td class="bold text-right">₹ ${Number(data.netPayableAmount || 0).toLocaleString('en-IN')}</td></tr>
    </table>

    <div style="margin-top: 20px;">
        <table>
            <tr>
                <td style="width: 60%; border: none;">
                    <div class="bold">Terms & Conditions:</div>
                    <div style="font-size: 9px; margin-top: 5px; line-height: 1.6;">
                        1. Payment: 90% advance with PO, 10% before dispatch.<br>
                        2. Goods once sold will not be taken back.<br>
                        3. Validity: 10 days from quotation date.<br>
                        4. Transport: Extra at actuals.
                    </div>
                    <div style="margin-top: 15px;"><img src="${qrBase64}" width="80" /></div>
                </td>
                <td style="padding: 0; border: none;">
                    <table style="border: 1px solid #555;">
                        <tr><td class="section-title">Bank Details</td></tr>
                        <tr><td><b>Bank:</b> KOTAK MAHINDRA BANK<br><b>A/C:</b> 4745055271<br><b>IFSC:</b> KKBK0001801</td></tr>
                        <tr>
                            <td class="text-center" style="height: 100px; vertical-align: bottom;">
                                <img src="${stampBase64}" width="110" />
                                <div class="bold">Authorized Signatory</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;
};