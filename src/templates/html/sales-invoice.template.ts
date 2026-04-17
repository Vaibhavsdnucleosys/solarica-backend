import { getBase64Image } from './utils';

/**
 * HTML Builder for Sales Invoices (Mobile optimized/Modern design)
 */
export const buildSalesInvoiceHTML = (data: any): string => {
  const logoBase64 = getBase64Image('src/assets/solarics_logo.webp');
  const qrBase64 = getBase64Image('src/assets/invoice_domestic_qr.png');
  const stampBase64 = getBase64Image('src/assets/invoice_domestic_stamp.png');
  const currencySymbol = data.currency === 'USD' ? '$' : '₹';
  const currencyLabel = data.currency === 'USD' ? 'USD' : 'INR';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Invoice Details</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "#1d4ed8", 
            secondary: "#dc2626", 
            "background-light": "#f3f4f6", 
            "background-dark": "#111827", 
            "paper-light": "#ffffff",
            "paper-dark": "#1f2937",
            "border-light": "#e5e7eb",
            "border-dark": "#374151",
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Playfair Display', 'serif'],
          },
          borderRadius: {
            DEFAULT: "0.375rem",
          },
        },
      },
    };
  </script>
  <style>
      @media print {
          table { page-break-inside: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          .print-border-none { border: none !important; }
          .print-shadow-none { box-shadow: none !important; }
      }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 min-h-screen p-4 md:p-8 font-sans transition-colors duration-200">

<table class="w-full max-w-5xl mx-auto bg-paper-light dark:bg-paper-dark shadow-xl rounded-xl overflow-hidden border border-border-light dark:border-border-dark print-shadow-none print:border-none print:m-0 print:max-w-none border-separate border-spacing-0">
  
  <!-- Header Section (Repeats on each page) -->
  <thead>
    <tr>
      <td>
        <div class="border-b print:border-t border-border-light dark:border-border-dark">
            <!-- Logo and Company Info -->
            <div class="px-8 pt-8 pb-4 flex justify-between items-start">
                <div class="flex flex-col items-start justify-center w-1/3">
                <div class="w-40 h-24 flex items-center justify-start overflow-hidden">
                    ${logoBase64 ? `<img alt="Solarica Energy Logo" class="object-contain max-w-full max-h-full" src="${logoBase64}"/>` : '<span class="text-xl font-bold text-primary">SOLARICA</span>'}
                </div>
                </div>
                
                <div class="text-right w-2/3 space-y-1">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white font-sans uppercase tracking-tight mb-2">${data.companyName}</h2>
                <p class="font-medium text-gray-800 dark:text-gray-200 text-sm">Narhe, Pune, Maharashtra</p>
                <p class="text-sm text-gray-600 dark:text-gray-300 flex justify-end items-center gap-2">
                    <span class="flex items-center gap-1"><span class="material-icons text-xs text-primary">call</span> +91-7420074167, +91-8956759167</span>
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-300 flex justify-end items-center gap-2">
                    <span class="flex items-center gap-1"><span class="material-icons text-xs text-primary">email</span> Business@solarica.in</span>
                </p>
                <p class="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">GST NO.: 27AALCP2722L1Z4</p>
                </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800/50 border-y border-border-light dark:border-border-dark py-1 text-center relative">
                <h3 class="text-sm font-bold uppercase text-gray-800 dark:text-white tracking-wider">${data.documentTitle || 'Tax Invoice'}</h3>
                <div class="absolute top-1 right-4 text-[10px] text-gray-400 dark:text-gray-500 hidden print:block">Original For Recipient</div>
            </div>
        </div>
      </td>
    </tr>
  </thead>

  <!-- Body Section -->
  <tbody>
    <!-- Page 1 Only Content: Customer Details -->
    <tr>
      <td>
         <!-- Bill To / Ship To / Invoice Details - Forced 3 Columns -->
        <div class="grid grid-cols-3 text-xs divide-x divide-gray-200 dark:divide-gray-700 border-b border-border-light dark:border-border-dark">
            
            <div class="p-4">
            <h4 class="font-bold text-gray-900 dark:text-white mb-2 uppercase text-[10px] tracking-wider text-primary">Bill To</h4>
            <div class="space-y-1 text-gray-700 dark:text-gray-300">
                <p class="font-bold text-sm">${data.customerName}</p>
                <p class="leading-relaxed">${data.customerAddress?.replace(/\n/g, '<br/>') || ''}</p>
                <p><span class="font-semibold">Contact:</span> ${data.customerContact || ''}</p>
                <p><span class="font-semibold">GSTIN:</span> <span class="font-mono">${data.gstinNumber || data.customerGstinUin || '-'}</span></p>
            </div>
            </div>

            <div class="p-4">
            <h4 class="font-bold text-gray-900 dark:text-white mb-2 uppercase text-[10px] tracking-wider text-primary">Ship To</h4>
            <div class="space-y-1 text-gray-700 dark:text-gray-300">
                <p class="font-bold text-sm">${data.recipientName || data.customerName}</p>
                <p class="leading-relaxed">${(data.shippingAddress || data.customerAddress)?.replace(/\n/g, '<br/>') || ''}</p>
                <p><span class="font-semibold">Contact:</span> ${data.customerContact || ''}</p>
                <p><span class="font-semibold">GSTIN:</span> <span class="font-mono">${data.gstinNumber || data.customerGstinUin || '-'}</span></p>
            </div>
            </div>

            <div class="p-4 bg-gray-50/50 dark:bg-gray-800/30">
            <h4 class="font-bold text-gray-900 dark:text-white mb-2 uppercase text-[10px] tracking-wider text-primary">Invoice Details</h4>
            <div class="space-y-2">
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                <span class="text-gray-500 dark:text-gray-400">Invoice No</span>
                <span class="font-bold text-gray-900 dark:text-white">${data.invoiceNumber}</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                <span class="text-gray-500 dark:text-gray-400">Date</span>
                <span class="font-bold text-gray-900 dark:text-white">${new Date(data.invoiceDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                <span class="text-gray-500 dark:text-gray-400">Order No</span>
                <span class="font-semibold text-gray-900 dark:text-white">-</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                <span class="text-gray-500 dark:text-gray-400">Despatch Mode</span>
                <span class="font-semibold text-gray-900 dark:text-white">${data.modeOfDispatch || '-'}</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                <span class="text-gray-500 dark:text-gray-400">Payment Terms</span>
                <span class="font-semibold text-gray-900 dark:text-white">${data.paymentStatus || '-'}</span>
                </div>
                ${data.deliveryDate ? `
                <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                <span class="text-gray-500 dark:text-gray-400">Delivery Date</span>
                <span class="font-bold text-primary">${new Date(data.deliveryDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                </div>
                ` : ''}
                <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400">LR No/Date</span>
                <span class="font-semibold text-gray-900 dark:text-white">-</span>
                </div>
            </div>
            </div>
        </div>
      </td>
    </tr>

    <!-- Items Table Row -->
    <tr>
      <td>
          <!-- Items Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white uppercase font-bold border-b border-gray-300 dark:border-gray-600">
                <tr>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-10 text-center">Sr</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700">Item Description</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-20">HSN/SAC</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-12 text-center">GST %</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-20 text-right">Quantity</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-16 text-center">Unit</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-20 text-right">Rate</th>
                  <th class="px-3 py-2 border-r dark:border-gray-700 w-16 text-right">Disc %</th>
                  <th class="px-3 py-2 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                ${data.items.map((item: any, i: number) => `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-center text-gray-500">${i + 1}</td>
                  <td class="px-3 py-2 border-r dark:border-gray-700">
                    <div class="font-bold text-gray-900 dark:text-white">${item.itemDescription}</div>
                  </td>
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-gray-600 dark:text-gray-300">${item.hsnSac || ''}</td>
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-center text-gray-600 dark:text-gray-300">18</td> 
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-right text-gray-900 dark:text-white">${item.quantity.toFixed(2)}</td>
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-center text-gray-600 dark:text-gray-300">${item.unit || 'Nos'}</td>
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-right text-gray-900 dark:text-white">${currencySymbol}${item.rate}</td>
                  <td class="px-3 py-2 border-r dark:border-gray-700 text-right text-gray-600 dark:text-gray-300">${item.discount ? item.discount + '%' : '-'}</td>
                  <td class="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">${currencySymbol}${parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                `).join('')}
                
                <tr class="h-24 md:h-32">
                  <td class="border-r dark:border-gray-700"></td>
                  <td class="border-r dark:border-gray-700 relative p-4"></td>
                  <td class="border-r dark:border-gray-700"></td>
                  <td class="border-r dark:border-gray-700"></td>
                  <td class="border-r dark:border-gray-700"></td>
                  <td class="border-r dark:border-gray-700"></td>
                  <td class="border-r dark:border-gray-700"></td>
                  <td class="border-r dark:border-gray-700"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary and Totals -->
          <div class="flex flex-col md:flex-row border-t border-border-light dark:border-border-dark">
            
            <!-- Left Side: Amount in Words & Signatories -->
            <div class="md:w-2/3 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark">
              <div class="p-4 space-y-4">
                <div class="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Total Amount In Words</p>
                  <p class="text-sm font-bold text-gray-800 dark:text-gray-200 italic">${currencyLabel} ${data.amountInWords}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-gray-500 dark:text-gray-400 block">Bill By:</span>
                    <span class="font-semibold text-gray-800 dark:text-white">SOLARICA</span>
                  </div>
                  <div>
                    <span class="text-gray-500 dark:text-gray-400 block">Collected By:</span>
                    <span class="font-semibold text-gray-800 dark:text-white">-</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-gray-500 dark:text-gray-400 block">Order By:</span>
                    <span class="font-semibold text-gray-800 dark:text-white">${data.customerName}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Calculations -->
       
            <div class="md:w-1/3 bg-gray-50 dark:bg-gray-800/30">
  <div class="text-xs">

    <!-- NEW: Taxable Amount -->
    <div class="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-gray-600 dark:text-gray-400">Taxable Amount</span>
      <span class="font-semibold text-gray-900 dark:text-white">
        ${currencySymbol}${parseFloat(data.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <!-- EXISTING -->
    <div class="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-gray-600 dark:text-gray-400">
        Cash Discount ${data.discountPercentage ? data.discountPercentage : ''}
      </span>
      <span class="text-red-600 dark:text-red-400">
        (-) ${currencySymbol}${parseFloat(data.cashDiscount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <!-- NEW: GST TOTAL -->
    <div class="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-gray-600 dark:text-gray-400">Total GST</span>
      <span class="font-semibold text-gray-900 dark:text-white">
        ${currencySymbol}${(parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <!-- CGST -->
    <div class="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-gray-600 dark:text-gray-400">CGST</span>
      <span class="font-semibold text-gray-900 dark:text-white">
        ${currencySymbol}${parseFloat(data.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <!-- SGST -->
    <div class="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-gray-600 dark:text-gray-400">SGST</span>
      <span class="font-semibold text-gray-900 dark:text-white">
        ${currencySymbol}${parseFloat(data.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>

    <!-- ROUND OFF -->
    <div class="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-gray-600 dark:text-gray-400">Round Off</span>
      <span class="font-semibold text-gray-900 dark:text-white">
        ${currencySymbol}${parseFloat(data.roundOff || 0).toFixed(2)}
      </span>
    </div>

    <!-- GRAND TOTAL -->
    <div class="flex justify-between p-3 bg-primary/10 dark:bg-primary/20">
      <span class="font-bold text-primary text-sm">Grand Total</span>
      <span class="font-bold text-primary text-lg">
        ${currencySymbol}${parseFloat(data.grandTotalPayable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>

  </div>
</div>
          </div>

          <!-- Tax Breakdown -->
          <div class="overflow-x-auto border-t border-border-light dark:border-border-dark">
            <table class="w-full text-left text-[10px]">
              <thead class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-300 dark:border-gray-600">
                <tr>
                  <th class="px-2 py-1 border-r dark:border-gray-700">HSN/SAC</th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-right">Taxable Value</th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-center bg-gray-200 dark:bg-gray-700" colspan="2">Central Tax</th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-center bg-gray-200 dark:bg-gray-700" colspan="2">State Tax</th>
                  <th class="px-2 py-1 text-right">Total Tax</th>
                </tr>
                <tr>
                  <th class="border-r dark:border-gray-700"></th>
                  <th class="border-r dark:border-gray-700"></th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-right w-16">Rate</th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-right">Amount</th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-right w-16">Rate</th>
                  <th class="px-2 py-1 border-r dark:border-gray-700 text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-gray-600 dark:text-gray-400">
                <tr>
                  <td class="px-2 py-1 border-r dark:border-gray-700">-</td>
                  <td class="px-2 py-1 border-r dark:border-gray-700 text-right">${currencySymbol}${parseFloat(data.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="px-2 py-1 border-r dark:border-gray-700 text-right">9%</td>
                  <td class="px-2 py-1 border-r dark:border-gray-700 text-right">${currencySymbol}${parseFloat(data.cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="px-2 py-1 border-r dark:border-gray-700 text-right">9%</td>
                  <td class="px-2 py-1 border-r dark:border-gray-700 text-right">${currencySymbol}${parseFloat(data.sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="px-2 py-1 text-right">${currencySymbol}${(parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="px-4 py-2 border-b border-border-light dark:border-border-dark text-[10px] font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/20">
              Tax Amount (in words): ${data.taxAmountInWords || '-'}
          </div>

          <!-- Footer Details -->
          <div class="grid grid-cols-1 text-[10px] border-b border-border-light dark:border-border-dark">
            <div class="p-4 flex flex-col justify-center space-y-3">
              <div class="space-y-1">
                <p><span class="font-bold">GST No:</span> 27AALCP2722L1Z4</p>
                <p><span class="font-bold">PAN No:</span> AABFT0519Q</p>
              </div>
            </div>
          </div>
          
          <div class="p-3 text-[9px] text-gray-500 dark:text-gray-400 border-b border-border-light dark:border-border-dark">
            <p>TERMS: ${data.termsAndConditions || '(1) Subject to Pune Jurisdiction. (2) Goods once sold will not be taken back. (3) Interest @ 18% will be charged if payment is not made on due date.'}</p>
          </div>

          <!-- Stamp Section -->
          <div class="border-b border-border-light dark:border-border-dark py-4 flex flex-col items-center justify-center min-h-[140px]">
            ${stampBase64 ? `<img alt="Stamp" class="h-32 object-contain" src="${stampBase64}"/>` : '<p class="text-[10px] font-bold italic text-gray-400">Company Stamp</p>'}
          </div>

          <!-- Solarica Group Companies -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-border-light">
            <div class="text-[10px] font-bold text-center text-gray-400 mb-2 uppercase tracking-wide">Solarica Group Of Companies</div>
            <div class="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] font-bold text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-1"><span class="text-primary">•</span> Solarica Energy India Pvt Ltd</div>
              <div class="flex items-center gap-1"><span class="text-primary">•</span> Solarica Systems Pvt Ltd</div>
              <div class="flex items-center gap-1"><span class="text-primary">•</span> Solarica Fabtech Pvt Ltd</div>
              <div class="flex items-center gap-1"><span class="text-primary">•</span> Solarica Industries Pvt Ltd</div>
              <div class="flex items-center gap-1"><span class="text-primary">•</span> Solarica Greenwheels Pvt Ltd</div>
            </div>
          </div>

          <div class="bg-primary text-white text-center py-2 text-xs font-semibold flex justify-between px-4">
            <span>Manufacturers, Exporters, Supplier</span>
            <span>We appreciate your Business with us.</span>
          </div>

      </td>
    </tr>
  </tbody>
  
</table>

</body>
</html>
  `;
};

