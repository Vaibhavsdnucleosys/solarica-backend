// import { getBase64Image } from './utils';

// /**
//  * HTML Builder for Domestic Invoices
//  */
// export const buildDomesticInvoiceHTML = (data: any): string => {
//     const logoBase64 = getBase64Image('src/assets/solarics_logo.webp');
//     const qrBase64 = getBase64Image('src/assets/invoice_domestic_qr.png');
//     const stampBase64 = getBase64Image('src/assets/invoice_domestic_stamp.png');
//     const currencySymbol = data.currency === 'USD' ? '$' : '₹';

//     return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="utf-8" />
//     <meta content="width=device-width, initial-scale=1.0" name="viewport" />
//     <title>${data.documentTitle || 'Estimate'} Document</title>
//     <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
//     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
//     <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
//     <script>
//         tailwind.config = {
//             darkMode: "class",
//             theme: {
//                 extend: {
//                     colors: {
//                         primary: "#8cc63f",
//                         "background-light": "#f3f4f6",
//                         "background-dark": "#111827",
//                         "paper-light": "#ffffff",
//                         "paper-dark": "#1f2937",
//                         "border-light": "#e5e7eb",
//                         "border-dark": "#374151",
//                     },
//                     fontFamily: {
//                         display: ["Inter", "sans-serif"],
//                         body: ["Inter", "sans-serif"],
//                     },
//                     borderRadius: { DEFAULT: "0.5rem" },
//                     fontSize: { xxs: "0.65rem" }
//                 },
//             },
//         };
//     </script>
//     <style>
//         @media print {
//             body { background: white; }
//             .no-print { display: none; }
//             .print-padding { padding: 0; }
//             table { page-break-inside: auto; }
//             thead { display: table-header-group; }
//             tfoot { display: table-footer-group; }
//         }
//         body { min-height: max(884px, 100dvh); }
        
//     </style>
// </head>
// <body class="bg-gray-100 dark:bg-gray-900 font-body text-gray-800 dark:text-gray-200 min-h-screen p-4 sm:p-8 flex justify-center">
    
//     <table class="w-full max-w-[235mm] bg-white text-black shadow-2xl mx-auto border-separate border-spacing-0 rounded-lg overflow-hidden border border-gray-300">
//         <!-- Header Section (Repeats on every page) -->
//         <thead>
//             <tr>
//                 <td class="p-0">
//                     <div class="border-b border-gray-300 text-xs">
//                         <div class="flex flex-col sm:flex-row justify-between items-start px-8 py-6">
//                             <div class="w-full sm:w-1/4 flex justify-start">
//                                 <div class="relative w-32 h-auto flex items-center justify-center">
//                                     <img alt="Logo" class="w-full object-contain" src="${logoBase64}" />
//                                 </div>
//                             </div>
//                             <div class="w-full sm:w-3/4 text-left sm:text-right text-xs space-y-1">
//                                 <h2 class="text-lg font-bold text-gray-900 dark:text-white uppercase">${data.companyName || 'SOLARICA ENERGY INDIA PVT LTD.'}</h2>
//                                 <p class="text-gray-600 dark:text-gray-400">3 RD FLOOR S N 7/2/1, FLAT NO 301/302 B WING MAYUR PARADISE,</p>
//                                 <p class="text-gray-600 dark:text-gray-400">BENKAR WASTI DHAYARI, SINHAGAD ROAD, HAVELI PUNE</p>
//                                 <p class="text-gray-600 dark:text-gray-400">
//                                     <span class="font-semibold">Phone no.:</span> 9325389168
//                                     <span class="font-semibold ml-2">Email:</span> Business@solarica.in
//                                 </p>
//                                 <p class="text-gray-600 dark:text-gray-400"><span class="font-semibold">GSTIN:</span> 27AALCP2722L1Z4, <span class="font-semibold">State:</span> ${data.stateCode || '27-Maharashtra'}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </td>
//             </tr>
//         </thead>
        
//         <!-- Body Section -->
//         <tbody>
//             <!-- Page 1 Only Content: Title & Customer Details -->
//             <tr>
//                 <td class="p-0">
//                      <div class="text-xs">
//                         <!-- Title (Now inside the flow to avoid repetition) -->
//                         <div class="p-2 text-center border-b border-gray-300 bg-gray-50">
//                             <h1 class="font-bold text-xl uppercase tracking-wide text-gray-800">${data.documentTitle || 'Estimate'}</h1>
//                         </div>

//                         <div class="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-300 text-sm">
//                             <div class="bg-primary text-white font-bold px-8 py-2 border-b sm:border-b-0 sm:border-r border-white/20">${data.documentTitle || 'Estimate'} For</div>
//                             <div class="bg-primary text-white font-bold px-8 py-2 text-right hidden sm:block">${data.documentTitle || 'Estimate'} Details</div>
//                         </div>
//                         <div class="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-300 text-xs text-gray-700">
//                             <div class="px-8 py-4 border-b sm:border-b-0 sm:border-r border-gray-300">
//                                 <p class="font-bold text-sm mb-1 text-gray-900">${data.customerName}</p>
//                                 <p class="text-gray-700">${data.customerAddress || ''}</p>
//                                 <p class="mt-1 text-gray-700">Contact No.: ${data.customerContact || ''}</p>
//                                 ${data.customerGstinUin ? `<p class="text-gray-700">GSTIN: ${data.customerGstinUin}</p>` : ''}
//                             </div>
//                             <div class="px-8 py-4 text-left sm:text-right">
//                                 <div class="flex justify-between sm:justify-end gap-2">
//                                     <span class="font-semibold">${data.documentTitle || 'Estimate'} No.:</span>
//                                     <span>${data.invoiceNumber}</span>
//                                 </div>
//                                 <div class="flex justify-between sm:justify-end gap-2 mt-1">
//                                     <span class="font-semibold">Date:</span>
//                                     <span>${new Date(data.invoiceDate).toLocaleDateString('en-GB')}</span>
//                                 </div>
//                                 <div class="flex justify-between sm:justify-end gap-2 mt-1">
//                                     <span class="font-semibold px-2">Mode:</span>
//                                     <span>${data.modeOfDispatch || '-'}</span>
//                                 </div>
//                                 ${data.deliveryDate ? `
//                                 <div class="flex justify-between sm:justify-end gap-2 mt-1">
//                                     <span class="font-semibold text-primary">Delivery Date:</span>
//                                     <span class="font-bold text-primary">${new Date(data.deliveryDate).toLocaleDateString('en-GB')}</span>
//                                 </div>
//                                 ` : ''}
//                                     <div class="flex justify-between sm:justify-end gap-2 mt-1 pt-2 border-t border-gray-200">
//                                         <span class="font-semibold px-2">Sales Person:</span>
//                                         <div class="text-right">
//                                             <span class="font-bold block">${data.salesPersonName || data.createdBy?.name || '-'}</span>
//                                         </div>
//                                     </div>
//                                     <div class="flex justify-between sm:justify-end gap-2 mt-1">
//                                         <span class="font-semibold px-2">Contact:</span>
//                                         <div class="text-right">
//                                             <span class="font-bold block">${data.salesPersonPhone || data.createdBy?.phone || '-'}</span>
//                                         </div>
//                                     </div>

                                    
//                             </div>
//                         </div>
//                     </div>
//                 </td>
//             </tr>

//             ${data.category === 'PUMP' ? `
// <tr>
//     <td class="p-0">

//         <div class="px-8 py-6 border-b border-gray-300 bg-white">

//             <div class="text-center mb-6">
//                 <h2 class="text-2xl font-bold uppercase tracking-wide text-black">
//                     ${data.systemCapacity || 'SOLAR WATER PUMP SYSTEM'}
//                 </h2>
//             </div>

//             <div class="mb-3">
//                 <h3 class="text-3xl font-extrabold underline text-black">
//                     PROJECT DETAILS:
//                 </h3>
//             </div>

//             <table class="w-full border-collapse border border-black text-lg">

//                 <tr>
//                     <td class="border border-black px-4 py-3 font-bold w-[30%] bg-gray-100">
//                         Officer In Charge
//                     </td>

//                     <td class="border border-black px-4 py-3">
//                         ${data.officerName || '-'}
//                     </td>
//                 </tr>

//                 <tr>
//                     <td class="border border-black px-4 py-3 font-bold bg-gray-100">
//                         Contact
//                     </td>

//                     <td class="border border-black px-4 py-3">
//                         ${data.officerContact || '-'}
//                     </td>
//                 </tr>

//                 <tr>
//                     <td class="border border-black px-4 py-3 font-bold bg-gray-100">
//                         System Capacity
//                     </td>

//                     <td class="border border-black px-4 py-3">
//                         ${data.systemCapacity || '-'}
//                     </td>
//                 </tr>

//             </table>

//         </div>

//     </td>
// </tr>
// ` : ''}

//             <!-- Items Table & Footer -->
//             <tr>
//                 <td class="p-0">
//                     <div class="text-xs">
//                         <div class="border-b border-gray-300">
//                             <table class="w-full text-xs text-left">
//                                 <thead class="bg-primary text-white font-semibold">
//                                     <tr>
//                                         <th class="px-4 py-3 border-r border-white/20 w-12 text-center">#</th>
//                                         <th class="px-4 py-3 border-r border-white/20 w-[45%]">Item name</th>
//                                         <th class="px-4 py-3 border-r border-white/20 w-24 text-center">HSN/ SAC</th>
//                                         <th class="px-4 py-3 border-r border-white/20 w-20 text-center">Qty</th>
//                                         <th class="px-4 py-3 border-r border-white/20 w-16 text-center">Unit</th>
//                                         <th class="px-4 py-3 border-r border-white/20 w-28 text-right">Price/ Unit</th>
//                                         <th class="px-4 py-3 border-r border-white/20 w-24 text-right">GST</th>
//                                         <th class="px-4 py-3 text-right w-28">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody class="divide-y divide-gray-200 bg-white">
//                                     ${data.items.map((item: any, i: number) => {
//         const taxableAmount = item.rate * item.quantity;
//         const lineGst = item.amount - taxableAmount;
//         const gstRate = taxableAmount > 0 ? (lineGst / taxableAmount) * 100 : 0;
//         return `
//                                     <tr class="divide-x divide-gray-200 hover:bg-gray-50">
//                                         <td class="px-4 py-3 text-center align-top text-gray-600">${i + 1}</td>
//                                         <td class="px-4 py-3 align-top break-words">
//                                             <span class="font-bold block mb-1 text-gray-800">${item.itemDescription}</span>
//                                         </td>
//                                         <td class="px-4 py-3 text-center align-top text-gray-600">${item.hsnSac || ''}</td>
//                                         <td class="px-4 py-3 text-center align-top text-gray-600">${item.quantity}</td>
//                                         <td class="px-4 py-3 text-center align-top text-gray-600">${item.unit || 'Nos'}</td>
//                                         <td class="px-4 py-3 text-right align-top whitespace-nowrap text-gray-800">${currencySymbol} ${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                         <td class="px-4 py-3 text-right align-top whitespace-nowrap text-gray-800">
//                                             ${lineGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br />
//                                             <span class="text-xxs text-gray-500">(${gstRate.toFixed(1)}%)</span>
//                                         </td>
//                                         <td class="px-4 py-3 text-right align-top font-semibold whitespace-nowrap text-gray-900">${currencySymbol} ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                     </tr>
//                                     `}).join('')}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div class="grid grid-cols-1 md:grid-cols-2 border-b border-gray-300">
//                             <div class="flex flex-col border-b md:border-b-0 md:border-r border-gray-300">
//                                 <div class="bg-primary text-white font-bold px-8 py-4 text-sm text-center">${data.documentTitle || 'Estimate'} order Amount In Words</div>
//                                <div class="p-6 flex items-start justify-center min-h-[120px] text-center text-sm font-medium italic text-gray-700 break-words leading-6">
//     ${data.amountInWords}
// </div>
//                             </div>
//                             <div class="flex flex-col">
//                                 <div class="bg-primary text-white font-bold px-8 py-2 text-sm">Amounts</div>
//                                 <div class="flex-1 text-xs px-8 py-4">
//                                     <div class="flex justify-between py-2 border-b border-gray-200">
//                                         <span class="text-gray-600">Sub Total</span>
//                                         <span class="font-medium text-gray-900">${currencySymbol} ${data.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//                                     </div>
//                                     ${data.advancedEnabled ? `
// <div class="flex justify-between py-2 border-b border-gray-200">
//     <span class="text-gray-600">Advanced</span>
//     <span class="font-medium text-gray-900">
//         ${currencySymbol} ${Number(data.additionalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//     </span>
// </div>
// ` : ''}
//                                     ${data.cashDiscount ? `
//                                     <div class="flex justify-between py-2 border-b border-gray-200">
//                                         <span class="text-gray-600">Cash Discount</span>
//                                         <span class="text-red-500">-${currencySymbol} ${data.cashDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//                                     </div>
//                                     ` : ''}
//                                     ${data.cgst ? `
//                                     <div class="flex justify-between py-2 border-b border-gray-200">
//                                       <span class="text-gray-600">CGST</span>
//                                       <span class="font-semibold text-gray-900">${currencySymbol}${data.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//                                     </div>
//                                     ` : ''}
//                                     ${data.sgst ? `
//                                     <div class="flex justify-between py-2 border-b border-gray-200">
//                                       <span class="text-gray-600">SGST</span>
//                                       <span class="font-semibold text-gray-900">${currencySymbol}${data.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//                                     </div>
//                                     ` : ''}
//                                     <div class="flex justify-between py-2 font-bold bg-gray-50 -mx-8 px-8 mt-2">
//                                         <span class="text-gray-800">Total</span>
//                                         <span class="text-primary">${currencySymbol} ${data.grandTotalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div class="grid grid-cols-1 md:grid-cols-2 border-b border-gray-300">
//                             <div class="border-b md:border-b-0 md:border-r border-gray-300">
//                                 <table class="w-full text-xs text-left">
//                                     <thead class="bg-primary text-white">
//                                         <tr>
//                                             <th class="px-8 py-2 border-r border-white/20">Tax type</th>
//                                             <th class="px-4 py-2 border-r border-white/20 text-right">Taxable amount</th>
//                                             <th class="px-4 py-2 border-r border-white/20 text-center">Rate</th>
//                                             <th class="px-4 py-2 text-right">Tax amount</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody class="divide-y divide-gray-200 bg-white">
//                                         ${data.sgst ? `
//                                         <tr class="divide-x divide-gray-200">
//                                             <td class="px-8 py-2 text-gray-600">SGST</td>
//                                             <td class="px-4 py-2 text-right text-gray-800">${currencySymbol} ${(data.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                             <td class="px-4 py-2 text-center text-gray-600">9.0%</td>
//                                             <td class="px-4 py-2 text-right text-gray-800">${currencySymbol} ${(data.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                         </tr>
//                                         ` : ''}
//                                         ${data.cgst ? `
//                                         <tr class="divide-x divide-gray-200">
//                                             <td class="px-8 py-2 text-gray-600">CGST</td>
//                                             <td class="px-4 py-2 text-right text-gray-800">${currencySymbol} ${(data.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                             <td class="px-4 py-2 text-center text-gray-600">9.0%</td>
//                                             <td class="px-4 py-2 text-right text-gray-800">${currencySymbol} ${(data.cgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                                         </tr>
//                                         ` : ''}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                         <div class="grid grid-cols-1 md:grid-cols-3 text-xs bg-white">
//                             <div class="border-b md:border-b-0 md:border-r border-gray-300 flex flex-col">
//                                 <div class="bg-primary text-white font-bold px-4 py-2 text-sm">Bank Details</div>
//                                 <div class="p-4 flex gap-2 h-full bg-gray-50/50">
//                                     <div class="flex flex-col items-start shrink-0">
//                                         <div class="w-20 h-20 bg-white p-1 mb-0.5 border border-gray-200">
//                                             <img alt="QR Code" class="w-full h-full object-contain" src="${qrBase64}" />
//                                         </div>
//                                     </div>
//                                     <div class="space-y-1 text-[0.65rem] leading-tight font-medium text-gray-700 min-w-0 break-words">
//                                         <p><span class="font-bold text-gray-900">Name:</span> ${data.bankName || 'KOTAK MAHINDRA BANK LIMITED'}</p>
//                                         <p><span class="font-bold text-gray-900">A/c No.:</span> ${data.accountNumber || '4745055271'}</p>
//                                         <p><span class="font-bold text-gray-900">IFSC:</span> ${data.ifscCode || 'KKBK0001801'}</p>
//                                         <p><span class="font-bold text-gray-900">Holder:</span> ${data.companyName || 'SOLARICA ENERGY INDIA PVT LTD'}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div class="border-b md:border-b-0 md:border-r border-gray-300 flex flex-col">
//                                 <div class="bg-primary text-white font-bold px-4 py-2 text-sm">Terms and conditions</div>
//                                 <div class="p-4 text-[0.6rem] leading-[1.1] space-y-0.5 text-gray-700 h-full bg-white overflow-hidden">
//                                     <ol class="list-decimal list-inside">
//                                         <li>Transport is extra at actual to pay</li>
//                                         <li>Payment 100% advance as per Co. policy.</li>
//                                         <li>Goods once sold will not be taken back.</li>
//                                         <li>Cancellation 10% charge. No cancellation after production.</li>
//                                         <li>Warranty for mfg defects only. No natural calamity claims.</li>
//                                         <li>Standard terms apply.</li>
//                                         <li>Lisoning charges extra at actual.</li>
//                                         <li>Validity - 10 days from hereof.</li>
//                                         <li>Delivery - 2 Weeks after Confirmation.</li>
//                                     </ol>
//                                 </div>
//                             </div>
//                             <div class="flex flex-col justify-between p-4 text-center h-full bg-white">
//                                 <div class="mt-1"><p class="text-[0.7rem] font-bold text-gray-900">For: SOLARICA ENERGY INDIA PVT LTD.</p></div>
//                                 <div class="flex items-center justify-center my-0">
//                                     <div class="w-32 h-16 relative">
//                                         <img alt="Stamp" class="w-full h-full object-contain opacity-90 rotate-[-1deg]" src="${stampBase64}" />
//                                     </div>
//                                 </div>
//                                 <div class="mb-1"><p class="font-bold text-xs text-gray-900 uppercase">Authorized Signatory</p></div>
//                             </div>
//                         </div>
//                     </div>
//                 </td>
//             </tr>

//         </tbody>
//     </table>
// </body>
// </html>
//   `;
// };



import { getPumpTemplate } from './pump';
import { getBase64Image } from './utils';

export const buildDomesticInvoiceHTML = (data: any): string => {

    const logoBase64 = getBase64Image('src/assets/solarics_logo.webp');
    const qrBase64 = getBase64Image('src/assets/invoice_domestic_qr.png');
    const stampBase64 = getBase64Image('src/assets/invoice_domestic_stamp.png');

    const currencySymbol = data.currency === 'USD' ? '$' : '₹';

    return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />

    <style>

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 15px;
            color: #000;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td,
        th {
            border: 1px solid #555;
            padding: 6px;
            vertical-align: top;
        }

        .no-border {
            border: none !important;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .bold {
            font-weight: bold;
        }

        .title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
        }

        .section-title {
            font-weight: bold;
            background: #f1f1f1;
        }

        .green {
            background: #8cc63f;
            color: #fff;
            font-weight: bold;
        }

        .amount-box {
            height: 110px;
        }

        .terms {
            line-height: 1.6;
        }

        .signature-box {
            height: 120px;
            text-align: center;
        }

        .pump-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-top: 15px;
            margin-bottom: 15px;
        }

        .project-title {
            font-size: 26px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 15px;
        }

    </style>
</head>

<body>

    <table>

        <!-- HEADER -->
        <tr>

            <td style="width:50%;">

                <table class="no-border">

                    <tr>
                        <td class="no-border" style="width:100px;">
                            <img src="${logoBase64}" width="90" />
                        </td>

                        <td class="no-border">

                            <div class="company-name">
                                ${data.companyName || 'SOLARICA ENERGY INDIA PVT LTD'}
                            </div>

                            <div>
                                AUDUMBAR NIVYA COMPLEX , OFFICE NO 203,NARHE,
                                SHREE CONTROL CHOWK, PUNE-411041
                            </div>

                            <div>
                                Phone no.: 8956759167
                            </div>

                            <div>
                                Email: Kiran@solarica.in
                            </div>

                            <div>
                                GSTIN: 27AALCP2722L1Z4
                            </div>

                            <div>
                                State: 27-Maharashtra
                            </div>

                        </td>
                    </tr>

                </table>

            </td>

            <td style="width:50%; padding:0;">

                <table>

                    <tr>
                        <td class="bold">Estimate No.</td>
                        <td class="bold">Date</td>
                    </tr>

                    <tr>
                        <td class="bold">${data.invoiceNumber}</td>
                        <td class="bold">
                            ${new Date(data.invoiceDate).toLocaleDateString('en-GB')}
                        </td>
                    </tr>

                    <tr>
                        <td class="bold">Place of supply</td>
                        <td></td>
                    </tr>

                    <tr>
                        <td class="bold">
                            ${data.placeOfSupply || '27-Maharashtra'}
                        </td>
                        <td></td>
                    </tr>

                </table>

            </td>

        </tr>

        <!-- CUSTOMER -->
        <tr>

            <td>

                <div class="bold" style="margin-bottom:10px;">
                    ${data.documentTitle || 'Estimate'} For
                </div>

                <div class="bold" style="font-size:16px;">
                    ${data.customerName}
                </div>

                <div style="margin-top:10px;">
                    ${data.customerAddress || ''}
                </div>

                <div style="margin-top:10px;">
                    Contact No. : ${data.customerContact || ''}
                </div>

                ${data.customerGstinUin ? `
                    <div style="margin-top:10px;">
                        GSTIN : ${data.customerGstinUin}
                    </div>
                ` : ''}

                <div style="margin-top:10px;">
                    State: ${data.stateCode || '27-Maharashtra'}
                </div>

            </td>

            <td>
            
            </td>

        </tr>

        <!-- PUMP DETAILS -->

      


        ${data.category === 'PUMP'
  ? data.pumpContent || ''
  : ''
}



        <!-- ITEM TABLE -->

        <tr>

            <td colspan="2" style="padding:0;">

                <table>

                    <tr class="green">

                        <th>#</th>
                        <th>Item name</th>
                        <th>HSN/SAC</th>
                        <th>Quantity</th>
                        <th>Price/Unit</th>
                        <th>GST</th>
                        <th>Amount</th>

                    </tr>

                    ${data.items.map((item: any, i: number) => {

                        const taxableAmount = item.rate * item.quantity;
                        const gstAmount = item.amount - taxableAmount;
                        const gstRate = taxableAmount > 0
                            ? ((gstAmount / taxableAmount) * 100).toFixed(1)
                            : '0';

                        return `

                        <tr>

                            <td>${i + 1}</td>

                            <td>
                                ${item.itemDescription}
                            </td>

                            <td>
                                ${item.hsnSac || ''}
                            </td>

                            <td class="text-right">
                                ${item.quantity}
                            </td>

                            <td class="text-right">
                                ${currencySymbol} ${item.rate.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2
                                })}
                            </td>

                            <td class="text-right">
                                ${currencySymbol} ${gstAmount.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2
                                })}
                                (${gstRate}%)
                            </td>

                            <td class="text-right bold">
                                ${currencySymbol} ${item.amount.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2
                                })}
                            </td>

                        </tr>

                        `;
                    }).join('')}

                </table>

            </td>

        </tr>

        <!-- AMOUNT SECTION -->

        <tr>

            <td style="width:50%;">

                <div class="section-title">
                    Estimate Amount In Words
                </div>

                <div class="amount-box bold" style="padding-top:15px;">
                    ${data.amountInWords}
                </div>

            </td>

            <td style="width:50%; padding:0;">

                <table>

                    <tr>
                        <td colspan="2" class="section-title">
                            Amounts:
                        </td>
                    </tr>

                    <tr>
                        <td>Sub Total</td>
                        <td class="text-right">
                            ${currencySymbol} ${data.netAmount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2
                            })}
                        </td>
                    </tr>

                    ${data.roundOff ? `
                    <tr>
                        <td>Round off</td>
                        <td class="text-right">
                            ${currencySymbol} ${data.roundOff.toLocaleString('en-IN', {
                                minimumFractionDigits: 2
                            })}
                        </td>
                    </tr>
                    ` : ''}

                    <tr class="bold">
                        <td>Total</td>
                        <td class="text-right">
                            ${currencySymbol} ${data.grandTotalPayable.toLocaleString('en-IN', {
                                minimumFractionDigits: 2
                            })}
                        </td>
                    </tr>

                </table>

            </td>

        </tr>

        <!-- TERMS -->

        <tr>

            <td>

                <div class="bold">
                    Terms and conditions:
                </div>

                <div class="terms">

                    1. Payment terms 90% advance with purchase order and 10% on readiness of material.<br>

                    2. Goods once sold will not be taken back at any cost unless warranted.<br>

                    3. Cancellation Charged 10% of Order Value.<br>

                    4. Panels warranty 5 years from date of supply.<br>

                    5. Transport Charges at actual.<br>

                </div>

                <div style="margin-top:20px;">
                    <img src="${qrBase64}" width="100" />
                </div>

            </td>

            <td style="padding:0;">

                <table>

                    <tr>

                        <td>

                            <div class="bold">
                                Company's Bank details:
                            </div>

                            <div style="margin-top:15px;">
                                Bank Account No. :
                                ${data.accountNumber || '4745055271'}
                            </div>

                            <div style="margin-top:10px;">
                                Bank IFSC code :
                                ${data.ifscCode || 'KKBK0001801'}
                            </div>

                            <div style="margin-top:10px;">
                                Account holder's name :
                                ${data.companyName || 'SOLARICA ENERGY INDIA PRIVATE LIMITED'}
                            </div>

                        </td>

                    </tr>

                    <tr>

                        <td class="signature-box">

                            <div>
                                For, : ${data.companyName || ''}
                            </div>

                            <div style="margin-top:10px;">
                                <img src="${stampBase64}" width="120" />
                            </div>

                            <div class="bold">
                                Authorized Signatory
                            </div>

                        </td>

                    </tr>

                </table>

            </td>

        </tr>

    </table>

</body>
</html>
`;

};