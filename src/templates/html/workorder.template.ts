import { getBase64Image } from './utils';

/**
 * HTML Builder for Work Order (Job Work Out Challan)
 */
export const buildWorkOrderHTML = (data: any): string => {
    const logoBase64 = getBase64Image('src/assets/solarics_logo.webp');
    // Using stamp if available, otherwise might need a specific one or generic
    const stampBase64 = getBase64Image('src/assets/invoice_domestic_stamp.png');
    const currencySymbol = '₹'; // Assuming INR based on context

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Job Work Out (Challan)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
    <style>
        @page { size: A4; margin: 10mm; }
        @media print {
            body { background: white; }
            .no-print { display: none; }
            .print-padding { padding: 0; }
            table { page-break-inside: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            tr { page-break-inside: auto; page-break-after: auto; }
            .item-row { page-break-inside: avoid; }
        }
        body { font-family: 'Inter', sans-serif; min-height: max(297mm, 100dvh); }
    </style>
</head>
<body class="bg-gray-100 p-4 text-xs text-black flex justify-center">
    
    <table class="w-full max-w-[210mm] bg-white shadow-lg mx-auto border-separate border-spacing-0">
        <!-- Header Section (Repeats on every page) -->
        <thead>
            <tr>
                <td class="px-8 pt-8 pb-0">
                    <div class="flex justify-between items-start border-b pb-4">
                        <div class="w-2/3">
                            <h1 class="text-xl font-bold uppercase text-black">SOLARICA ENERGY INDIA PVT LTD</h1>
                            <div class="mt-2 text-[10px] leading-tight text-gray-700">
                                <p>AUDUMBAR NIVYA COMPLEX, OFFICE NO 203, NARHE,</p>
                                <p>SHREE CONTROL CHOWK, PUNE-411041</p>
                                <p class="mt-1">Phone no.: 8956189167</p>
                                <p>Email: Kiran@solarica.in</p>
                                <p>GSTIN: 27AALCP2722L1Z4</p>
                                <p>State: 27-Maharashtra</p>
                            </div>
                        </div>
                        <div class="w-1/3 flex justify-end">
                            <div class="w-24 h-auto">
                                <img alt="Logo" class="w-full object-contain" src="${logoBase64}" />
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </thead>
        
        <!-- Body Section -->
        <tbody>
            <!-- Page 1 Specific Content (Title, Details, etc.) -->
            <tr>
                <td class="px-8 pt-0 pb-0">
                     <!-- Title -->
                     <div class="text-center py-2 border-b border-violet-200">
                        <h2 class="text-lg font-bold text-violet-600 uppercase">Job Work Out (Challan)</h2>
                    </div>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-3 gap-4 py-4 text-[10px] border-b">
                        
                        <!-- Col 1: Job Work Out For -->
                        <div>
                            <p class="font-bold mb-1">Job Work Out (Challan) for</p>
                            <p class="font-bold text-sm mb-1">${data.customerName || ''}</p>
                            <div class="text-gray-700 leading-tight">
                                <p>${data.customerAddress || ''}</p>
                                <p class="mt-2">Contact No.: ${data.customerContact || ''}</p>
                                <p>GSTIN: ${data.customerGst || ''}</p>
                                <p>State: ${data.customerState || ''}</p>
                            </div>
                        </div>

                        <!-- Col 2: Ship To -->
                        <div>
                            <p class="font-bold mb-1">Ship To</p>
                            <div class="text-gray-700 leading-tight">
                                <p>${data.shipToAddress || data.customerAddress || ''}</p>
                            </div>
                        </div>

                        <!-- Col 3: Challan Details -->
                        <div class="text-right">
                            <p class="font-bold mb-1">Challan Details</p>
                            <div class="space-y-1">
                                <p><span class="font-semibold">Job ID:</span> ${data.jobId || '-'}</p>
                                <p><span class="font-semibold">Date:</span> ${data.date ? new Date(data.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</p>
                                <p><span class="font-semibold">Delivery Date:</span> ${data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString('en-GB') : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Finished Goods Header -->
                    <div class="bg-violet-500 text-white font-bold px-2 py-1 text-xs mt-2">
                        Finished Goods
                    </div>
                </td>
            </tr>

            <!-- Items & Footer -->
            <tr>
                <td class="px-8 py-0">
                     <!-- Finished Good Item Name -->
                    <div class="py-2 font-bold text-sm">
                        ${data.finishedGoodName || 'SOLARICA FINISHED GOOD'} (${data.finishedGoodQty || 1})
                    </div>

                    <!-- Items Table -->
                    <table class="w-full text-xs text-left mb-8">
                        <thead class="bg-violet-400 text-white font-semibold">
                            <tr>
                                <th class="px-2 py-2 w-8 text-center text-white">#</th>
                                <th class="px-2 py-2 text-white">Raw Material</th>
                                <th class="px-2 py-2 w-16 text-center text-white">QTY</th>
                                <th class="px-2 py-2 w-16 text-center text-white">Unit</th>
                                <th class="px-2 py-2 w-24 text-right text-white">Purchase Price/Unit</th>
                                <th class="px-2 py-2 w-24 text-right text-white">Estimated Cost</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${data.items.map((item: any, i: number) => `
                            <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} item-row">
                                <td class="px-2 py-2 text-center align-top">${i + 1}</td>
                                <td class="px-2 py-2 align-top font-semibold uppercase">${item.name}</td>
                                <td class="px-2 py-2 text-center align-top">${item.quantity}</td>
                                <td class="px-2 py-2 text-center align-top">${item.unit || 'Nos'}</td>
                                <td class="px-2 py-2 text-right align-top">${currencySymbol} ${Number(item.rate || 0).toFixed(2)}</td>
                                <td class="px-2 py-2 text-right align-top">${currencySymbol} ${Number(item.amount || 0).toFixed(2)}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <!-- Footer Content (Terms, Signatory etc) -->
                    <div class="mt-4 border-t border-violet-200 pt-2">
                        <!-- Additional Cost Section matching purple bar style -->
                        <div class="bg-violet-400 text-white font-bold px-2 py-1 text-xs flex justify-between">
                            <span>Description</span>
                            <span>Amount</span>
                        </div>
                        
                        <div class="text-xs">
                             <div class="flex justify-between px-2 py-1 border-b border-gray-100">
                                <span>Item Total</span>
                                <span>${currencySymbol} ${data.items.reduce((acc: number, item: any) => acc + Number(item.amount || 0), 0).toFixed(2)}</span>
                             </div>
                             <div class="flex justify-between px-2 py-1 border-b border-gray-100">
                                <span>Additional Cost</span>
                                <span>${currencySymbol} ${Number(data.additionalCost || 0).toFixed(2)}</span>
                             </div>
                             <div class="flex justify-between px-2 py-1 font-bold bg-gray-50">
                                <span>Grand Total</span>
                                <span>${currencySymbol} ${(data.items.reduce((acc: number, item: any) => acc + Number(item.amount || 0), 0) + Number(data.additionalCost || 0)).toFixed(2)}</span>
                             </div>
                        </div>

                        <div class="flex justify-between items-end mt-12 pb-8">
                            <div class="w-1/2">
                                <h3 class="font-bold mb-2">Terms and Conditions</h3>
                                <div class="text-[10px] space-y-1 text-gray-700">
                                    <p>1. Output Material to be returned within 60 days from date of Challan.</p>
                                    <p>2. Material not returned will be debited to your account.</p>
                                </div>
                            </div>
                            <div class="w-1/3 text-right flex flex-col items-end">
                                <p class="text-[10px] font-bold mb-4">FOR: SOLARICA ENERGY INDIA PVT LTD</p>
                                <div class="w-24 h-24 relative flex items-center justify-center">
                                     <img alt="Stamp" class="w-full h-full object-contain opacity-90 rotate-[-1deg]" src="${stampBase64}" />
                                </div>
                                <p class="font-bold text-xs mt-2">Authorized Signatory</p>
                            </div>
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

