import { getBase64Image } from './utils';

/**
 * HTML Builder for Export Invoices
 */
export const buildExportInvoiceHTML = (data: any): string => {
    const logoBase64 = getBase64Image('src/assets/solarics_logo.webp');
    const stampBase64 = getBase64Image('src/assets/invoice_export_stamp.png');
    const currencySymbol = data.currency === 'USD' ? '$' : '₹';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Proforma Invoice - Solarica Energy</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&amp;family=Roboto:wght@300;400;500;700&amp;display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#8B8055",
                        secondary: "#7CC142",
                        accent: "#F49E25",
                        "primary-blue": "#206BB8",
                        "background-light": "#FFFFFF",
                        "background-dark": "#1a1a1a",
                        "surface-light": "#F3F4F6",
                        "surface-dark": "#2d2d2d",
                        "text-light": "#1F2937",
                        "text-dark": "#E5E7EB",
                    },
                    fontFamily: {
                        display: ["Merriweather", "serif"],
                        body: ["Roboto", "sans-serif"],
                    },
                    borderRadius: { DEFAULT: "4px" },
                },
            },
        };
    </script>
    <style>
        @media print {
            @page { margin: 0; size: A4; }
            body { margin: 0; }
            table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
        }
        body { 
            background: white; 
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 font-body transition-colors duration-300">
    
    <table class="w-full bg-white shadow-2xl print:shadow-none mx-auto">
        <!-- Repeating Header -->
        <thead>
            <tr>
                <td class="p-0">
                    <header class="relative w-full h-[280px] font-sans overflow-hidden">
                        <div class="absolute inset-0 w-full h-full">
                            <div class="absolute left-0 top-0 w-[50%] h-full bg-[#DCE6F1] z-10" style="border-bottom-right-radius: 100px;"></div>
                            <div class="absolute right-0 top-0 w-[65%] h-[260px] bg-[#8B8055] z-20 shadow-xl" style="border-bottom-left-radius: 180px;"></div>
                        </div>
                        <div class="relative w-full h-full z-30">
                            <div class="absolute left-0 top-0 w-[42%] h-full flex flex-col pt-6 pl-8 z-30">
                                <img src="${logoBase64}" alt="Logo" class="w-40 h-auto object-contain mix-blend-multiply z-30 relative ml-2">
                                <div class="absolute bottom-4 left-0 w-full pl-10 pt-2 text-[10px] text-gray-800 font-bold z-20" style="font-family: 'Times New Roman', serif;">
                                    <div class="space-y-0.5">
                                        <span>CIN : U31909PN2020PTC192275</span><br>
                                        <span>GSTIN: 27AALCP2722L1Z4</span>
                                    </div>
                                    <div class="mt-1">27 – Maharashtra. INDIA.</div>
                                </div>
                            </div>
                            <div class="absolute right-0 top-0 w-[62%] h-full flex flex-col justify-center text-white pl-10 pr-6 z-40">
                                <h1 class="text-[22px] font-bold tracking-wide mb-4 leading-tight" style="font-family: 'Times New Roman', serif;">SOLARICA ENERGY INDIA PVT LTD</h1>
                                <div class="flex items-center text-sm font-sans font-light">
                                    <div class="flex flex-col gap-1 shrink-0">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[16px]">call</span>
                                            <span class="text-[12px] tracking-wide">+91-9325389168</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[16px]">mail</span>
                                            <span class="text-[12px] tracking-wide"><a href="mailto:Business@solarica.in" class="hover:underline">Business@solarica.in</a></span>
                                        </div>
                                    </div>
                                    <div class="w-px bg-white mx-4 h-12 self-center opacity-60 shrink-0"></div>
                                    <div class="flex items-start gap-2">
                                        <span class="material-symbols-outlined text-[18px] mt-0.5 shrink-0">location_on</span>
                                        <div class="text-[10px] leading-snug font-serif opacity-90 pt-0.5">
                                            <p><span class="font-bold">HO:</span> SN 7/2/1, FLAT NO 301/302 Mayur paradise B wing, Dhayari, Pune- 411041</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                </td>
            </tr>
        </thead>

        <!-- Repeating Footer -->
        <tfoot>
            <tr>
                <td class="p-0 h-24 align-bottom">
                     <div class="relative w-full h-24 shrink-0 overflow-hidden">
                        <div class="absolute bottom-0 left-0 w-full h-full flex items-end">
                            <div class="bg-accent h-6 w-[45%] z-10"></div>
                            <div class="bg-primary-blue h-16 w-full rounded-tl-[100px] z-0 -ml-16"></div>
                        </div>
                    </div>
                </td>
            </tr>
        </tfoot>

        <!-- Main Body Content -->
        <tbody>
            <tr>
                <td class="px-0 align-top">
                    <!-- Page 1 Content (Customer Info, Items) -->
                    <div class="px-12 pt-4" style="font-family: 'Times New Roman', serif;">
                        <div class="text-center mb-6">
                            <h2 class="text-2xl font-bold text-[#0D2447] tracking-wide uppercase border-b-2 border-[#0D2447] inline-block pb-1">PROFORMA INVOICE</h2>
                        </div>
                        <div class="flex justify-between items-start mb-6 text-gray-900">
                            <div class="w-2/3">
                                <p class="text-[#5B9BD5] font-bold text-base mb-1 font-sans">Proposal For :</p>
                                <p class="font-bold text-2xl uppercase">${data.customerName}</p>
                                <p class="text-xs mt-1 text-gray-700 leading-tight">${data.customerAddress || ''}</p>
                                ${data.customerContact ? `<p class="text-xs mt-1">Contact: ${data.customerContact}</p>` : ''}
                            </div>
                            <div class="w-1/3">
                                <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-base">
                                    <span class="font-bold text-right">${data.documentTitle || 'Estimate'} No.:</span>
                                    <span class="font-medium">${data.invoiceNumber}</span>
                                    <span class="font-bold text-right">Date:</span>
                                    <span class="font-medium">${new Date(data.invoiceDate).toLocaleDateString('en-GB')}</span>
                                    <span class="font-bold text-right">Mode:</span>
                                    <span class="font-medium">${data.modeOfDispatch || '-'}</span>
                                    <span class="font-bold text-right">Sales Person:</span>
                                    <span class="font-medium">${data.salesPersonName || data.createdBy?.name || '-'}</span>
                                    ${(data.salesPersonPhone || data.createdBy?.phone) ? `
                                    <span class="font-bold text-right">Contact:</span>
                                    <span class="font-medium">${data.salesPersonPhone || data.createdBy?.phone}</span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="mb-6">
                            <table class="w-full border-collapse text-sm text-gray-900 border border-gray-400">
                                <thead>
                                    <tr class="font-bold text-center border-b border-gray-400 bg-gray-50">
                                        <th class="border-r border-gray-400 py-2 w-16">Sr. No.</th>
                                        <th class="border-r border-gray-400 py-2 text-left px-2">Description</th>
                                        <th class="border-r border-gray-400 py-2 w-20">HSN Code</th>
                                        <th class="border-r border-gray-400 py-2 w-20">Qty</th>
                                        <th class="border-r border-gray-400 py-2 w-28">Price ${currencySymbol}</th>
                                        <th class="py-2 w-28">Total ${currencySymbol}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.items.map((item: any, i: number) => `
                                    <tr class="border-b border-gray-300">
                                        <td class="border-r border-gray-400 p-2 text-center align-top">${i + 1}</td>
                                        <td class="border-r border-gray-400 p-2 align-top text-xs leading-relaxed">${item.itemDescription}</td>
                                        <td class="border-r border-gray-400 p-2 align-top text-center text-xs">${item.hsnSac || ''}</td>
                                        <td class="border-r border-gray-400 p-2 align-top text-center text-xs">${item.quantity}</td>
                                        <td class="border-r border-gray-400 p-2 align-top text-right text-xs pr-4">${currencySymbol} ${item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td class="p-2 align-top text-right text-xs pr-4">${currencySymbol} ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    `).join('')}
                                    <tr class="font-bold bg-gray-50">
                                        <td class="border-r border-gray-400 p-2 text-right text-xs" colspan="5">TOTAL ESTIMATE AMOUNT</td>
                                        <td class="p-2 text-right text-sm pr-4">${currencySymbol} ${data.grandTotalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr class="border-t border-gray-400">
                                        <td class="p-2 text-xs pl-3 italic" colspan="6">Amount In Words : ${data.amountInWords}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mb-6 pl-2">
                            <h3 class="text-[#8B2323] font-bold text-base mb-4 border-b border-[#8B2323] inline-block">Company Bank Details</h3>
                            <div class="text-xs text-gray-900 leading-6">
                                <div class="mb-2">Account Holder Name: <span class="font-bold">${data.companyName || 'SOLARICA ENERGY INDIA PRIVATE LIMITED'}</span></div>
                                <div class="grid grid-cols-[140px_1fr] gap-y-0.5">
                                    <div>Bank Name:</div><div class="font-medium">${data.bankName || 'KOTAK MAHINDRA BANK LTD'}</div>
                                    <div>Address :</div><div class="font-medium">Narhe Road, Pune-411041.</div>
                                    <div>Bank A\c No.:</div><div class="font-bold">${data.accountNumber || '4745055271'}</div>
                                    <div>IFSC code:</div><div class="font-bold">${data.ifscCode || 'KKBK0001801'}</div>
                                    <div class="font-bold mt-1 text-[#8B2323]">SWIFT CODE :</div><div class="font-bold mt-1 text-[#8B2323]">${(data as any).swiftCode || 'KKBKINBBXXX'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <!-- Page 2 Content (Terms, Signatory) - Now Flowing in Same Body -->
                    <div class="px-12 mb-12" style="font-family: 'Times New Roman', serif;">
                        <div class="mb-6 text-sm leading-6 text-gray-900">
                            <h3 class="text-accent font-bold text-lg mb-6 uppercase border-b border-accent inline-block">Terms And Conditions</h3>
                            <ol class="list-decimal list-outside ml-6 space-y-3">
                                <li>Price quoted is FOB (which includes packing forwarding clearance and Transport cost up to nearest Seaport)</li>
                                <li>Supply Period will Vary as per Quantity requirement.</li>
                                <li>Payment terms 60 % in Advance with Purchase order and 40% Balance payment before delivery of final Product i.e at the time of ready to dispatch and ship product. (Mode -Bank to Bank Wire Transfer)</li>
                                <li>Cancellation Charged 10% of Order Value. No Cancellation is allowed after Material is Produced/Procured.</li>
                                <li>FRI (final random inspection) can be done by Buyer before delivery at delivery location by Buyer's private shipping company or any Third-party inspection agency appointed by Buyer. (Cost to be incurred by Buyer)</li>
                                <li>Buyer can Take Appropriate Partial Shipment Also for consignment.</li>
                            </ol>
                        </div>
                        <div class="mt-20 flex flex-col items-end pr-8">
                            <p class="font-bold text-lg uppercase text-right">For : ${data.companyName || 'SOLARICA ENERGY INDIA PVT LTD.'}</p>
                            <div class="w-48 h-auto my-4 grayscale opacity-90">
                                <img src="${stampBase64}" alt="Stamp" class="w-full h-auto object-contain" />
                            </div>
                            <p class="font-bold text-base mt-2">Authorized Signatory</p>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
        
    </table>
</body>
</html>
  `;
};

