import { getBase64Image } from './utils';

/**
 * HTML Builder for TAX INVOICE PDF
 */
export const buildTaxInvoiceHTML = (data: any): string => {

    const logoBase64 = getBase64Image(
        'src/assets/solarics_logo.webp'
    );

    const stampBase64 = getBase64Image(
        'src/assets/invoice_domestic_stamp.png'
    );

    const currencySymbol =
        data.currency === 'USD'
            ? '$'
            : '₹';

    const currencyLabel =
        data.currency === 'USD'
            ? 'USD'
            : 'INR';

    return `

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8"/>

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <title>
        TAX INVOICE
    </title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    />

    <style>

        body{
            font-family: 'Inter', sans-serif;
            background:#f3f4f6;
        }

        @media print {

            body{
                background:white;
            }

            table{
                page-break-inside:auto;
            }

            tr{
                page-break-inside:avoid;
            }

            thead{
                display:table-header-group;
            }

            tfoot{
                display:table-footer-group;
            }
        }

    </style>

</head>

<body class="p-6">

<div class="max-w-6xl mx-auto bg-white border border-gray-300 shadow-lg">

    <!-- HEADER -->

    <div class="border-b border-gray-300">

        <div class="flex justify-between items-start p-6">

            <!-- LOGO -->

            <div class="w-1/3">

                ${
                    logoBase64
                    ? `
                        <img
                            src="${logoBase64}"
                            class="w-40 object-contain"
                        />
                    `
                    : ''
                }

            </div>

            <!-- COMPANY -->

            <div class="w-2/3 text-right">

                <h1 class="text-3xl font-black uppercase text-gray-900">
                    ${data.companyName || 'SOLARICA ENERGY INDIA PVT LTD'}
                </h1>

                <p class="text-sm text-gray-600 mt-2">
                    Narhe, Pune, Maharashtra
                </p>

                <p class="text-sm text-gray-600">
                    +91-7420074167
                </p>

                <p class="text-sm text-gray-600">
                    Business@solarica.in
                </p>

                <p class="text-sm font-bold mt-2">
                    GSTIN :
                    ${data.fromGstin || '27AALCP2722L1Z4'}
                </p>

            </div>

        </div>

        <!-- TITLE -->

        <div class="bg-gray-100 border-t border-b border-gray-300 py-3 text-center relative">

            <h2 class="text-xl font-black tracking-widest uppercase">
                TAX INVOICE
            </h2>

            <div class="absolute right-4 top-3 text-[10px] text-gray-500">
                Original For Recipient
            </div>

        </div>

    </div>

    <!-- CUSTOMER SECTION -->

    <div class="grid grid-cols-3 border-b border-gray-300 text-sm">

        <!-- BILL TO -->

        <div class="p-4 border-r border-gray-300">

            <h3 class="font-black uppercase text-xs text-blue-700 mb-3">
                Bill To
            </h3>

            <p class="font-bold text-gray-900">
                ${data.customerName || '-'}
            </p>

            <p class="mt-2 text-gray-700 leading-6">
                ${(data.customerAddress || '').replace(/\n/g, '<br/>')}
            </p>

            <p class="mt-2">
                <span class="font-semibold">
                    Contact :
                </span>

                ${data.customerContact || '-'}
            </p>

            <p>
                <span class="font-semibold">
                    GSTIN :
                </span>

                ${data.customerGstinUin || '-'}
            </p>

            <p>
                <span class="font-semibold">
                    State :
                </span>

                ${data.buyerStateName || '-'}
            </p>

        </div>

        <!-- SHIP TO -->

        <div class="p-4 border-r border-gray-300">

            <h3 class="font-black uppercase text-xs text-blue-700 mb-3">
                Ship To
            </h3>

            <p class="font-bold text-gray-900">
                ${data.recipientName || data.customerName || '-'}
            </p>

            <p class="mt-2 text-gray-700 leading-6">
                ${(
                    data.shippingAddress ||
                    data.customerAddress ||
                    ''
                ).replace(/\n/g, '<br/>')}
            </p>

            <p class="mt-2">
                <span class="font-semibold">
                    Contact :
                </span>

                ${data.customerContact || '-'}
            </p>

        </div>

        <!-- INVOICE DETAILS -->

        <div class="p-4 bg-gray-50">

            <h3 class="font-black uppercase text-xs text-blue-700 mb-3">
                Invoice Details
            </h3>

            <div class="space-y-2 text-sm">

                <div class="flex justify-between">
                    <span>Invoice No</span>
                    <span class="font-bold">
                        ${data.invoiceNumber || '-'}
                    </span>
                </div>

                <div class="flex justify-between">
                    <span>Date</span>
                    <span class="font-bold">
                        ${
                            data.invoiceDate
                            ? new Date(
                                data.invoiceDate
                              ).toLocaleDateString('en-GB')
                            : '-'
                        }
                    </span>
                </div>

                <div class="flex justify-between">
                    <span>Dispatch Mode</span>
                    <span class="font-bold">
                        ${data.modeOfDispatch || '-'}
                    </span>
                </div>

                <div class="flex justify-between">
                    <span>Payment Status</span>
                    <span class="font-bold">
                        ${data.paymentStatus || '-'}
                    </span>
                </div>

                <div class="flex justify-between">
                    <span>Reverse Charge</span>
                    <span class="font-bold">
                        ${
                            data.reverseCharge
                                ? 'YES'
                                : 'NO'
                        }
                    </span>
                </div>

            </div>

        </div>

    </div>

    <!-- EXTRA TAX DETAILS -->

    <div class="grid grid-cols-4 border-b border-gray-300 text-xs">

        <div class="p-3 border-r border-gray-300">

            <div class="text-gray-500">
                eWay Bill No
            </div>

            <div class="font-bold mt-1">
                ${data.ewayBillNumber || '-'}
            </div>

        </div>

        <div class="p-3 border-r border-gray-300">

            <div class="text-gray-500">
                Vehicle No
            </div>

            <div class="font-bold mt-1">
                ${data.vehicleNumber || '-'}
            </div>

        </div>

        <div class="p-3 border-r border-gray-300">

            <div class="text-gray-500">
                LR Number
            </div>

            <div class="font-bold mt-1">
                ${data.lrNumber || '-'}
            </div>

        </div>

        <div class="p-3">

            <div class="text-gray-500">
                Dispatch Doc No
            </div>

            <div class="font-bold mt-1">
                ${data.dispatchDocNumber || '-'}
            </div>

        </div>

    </div>

    <!-- ITEMS TABLE -->

    <table class="w-full text-sm border-collapse">

        <thead class="bg-gray-100">

            <tr>

                <th class="border border-gray-300 px-3 py-2">
                    Sr
                </th>

                <th class="border border-gray-300 px-3 py-2 text-left">
                    Description
                </th>

                <th class="border border-gray-300 px-3 py-2">
                    HSN
                </th>

                <th class="border border-gray-300 px-3 py-2">
                    Qty
                </th>

                <th class="border border-gray-300 px-3 py-2">
                    Unit
                </th>

                <th class="border border-gray-300 px-3 py-2 text-right">
                    Rate
                </th>

                <th class="border border-gray-300 px-3 py-2 text-right">
                    Amount
                </th>

            </tr>

        </thead>

        <tbody>

        ${(data.items ?? []).map((item:any,index:number)=>`

                <tr>

                    <td class="border border-gray-300 px-3 py-2 text-center">
                        ${index + 1}
                    </td>

                    <td class="border border-gray-300 px-3 py-2">
                        ${item.itemDescription || '-'}
                    </td>

                    <td class="border border-gray-300 px-3 py-2 text-center">
                        ${item.hsnSac || '-'}
                    </td>

                    <td class="border border-gray-300 px-3 py-2 text-center">
                        ${item.quantity || 0}
                    </td>

                    <td class="border border-gray-300 px-3 py-2 text-center">
                        ${item.unit || 'Nos'}
                    </td>

                    <td class="border border-gray-300 px-3 py-2 text-right">
                        ${currencySymbol}${parseFloat(item.rate || 0).toFixed(2)}
                    </td>

                    <td class="border border-gray-300 px-3 py-2 text-right font-semibold">
                        ${currencySymbol}${parseFloat(item.amount || 0).toFixed(2)}
                    </td>

                </tr>

            `).join('')}

        </tbody>

    </table>

    <!-- TOTALS -->

    <div class="flex border-t border-gray-300">

        <!-- LEFT -->

        <div class="w-2/3 p-4 border-r border-gray-300">

            <p class="text-xs text-gray-500 uppercase">
                Amount In Words
            </p>

            <p class="font-bold italic text-gray-800 mt-2">
                ${currencyLabel}
                ${data.amountInWords || '-'}
            </p>

            <div class="mt-6 text-xs text-gray-600 leading-6">

                <p>
                    TERMS :
                    ${
                        data.termsOfDelivery ||
                        data.termsAndConditions ||
                        'Subject to Pune Jurisdiction.'
                    }
                </p>

            </div>

        </div>

        <!-- RIGHT -->

        <div class="w-1/3 bg-gray-50">

            <div class="text-sm">

                <div class="flex justify-between px-4 py-2 border-b border-gray-300">
                    <span>Taxable Amount</span>

                    <span class="font-bold">
                        ${currencySymbol}${parseFloat(data.netAmount || 0).toFixed(2)}
                    </span>
                </div>

                <div class="flex justify-between px-4 py-2 border-b border-gray-300">
                    <span>CGST</span>

                    <span class="font-bold">
                        ${currencySymbol}${parseFloat(data.cgst || 0).toFixed(2)}
                    </span>
                </div>

                <div class="flex justify-between px-4 py-2 border-b border-gray-300">
                    <span>SGST</span>

                    <span class="font-bold">
                        ${currencySymbol}${parseFloat(data.sgst || 0).toFixed(2)}
                    </span>
                </div>

                <div class="flex justify-between px-4 py-2 border-b border-gray-300">
                    <span>Round Off</span>

                    <span class="font-bold">
                        ${currencySymbol}${parseFloat(data.roundOff || 0).toFixed(2)}
                    </span>
                </div>

                <div class="flex justify-between px-4 py-4 bg-blue-50">

                    <span class="font-black text-lg text-blue-700">
                        GRAND TOTAL
                    </span>

                    <span class="font-black text-xl text-blue-700">
                        ${currencySymbol}${parseFloat(data.grandTotalPayable || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2
                        })}
                    </span>

                </div>

            </div>

        </div>

    </div>

    <!-- FOOTER -->

    <div class="grid grid-cols-2 border-t border-gray-300">

        <!-- BANK -->

        <div class="p-4 text-xs border-r border-gray-300">

            <h4 class="font-bold mb-3 uppercase">
                Bank Details
            </h4>

            <div class="space-y-1">

                <p>
                    Bank :
                    ${data.bankName || '-'}
                </p>

                <p>
                    Account No :
                    ${data.accountNumber || '-'}
                </p>

                <p>
                    IFSC :
                    ${data.ifscCode || '-'}
                </p>

                <p>
                    PAN :
                    ${data.companyPan || '-'}
                </p>

            </div>

        </div>

        <!-- SIGN -->

        <div class="p-4 flex flex-col items-center justify-center">

            ${
                stampBase64
                ? `
                    <img
                        src="${stampBase64}"
                        class="h-28 object-contain"
                    />
                `
                : ''
            }

            <div class="mt-2 text-sm font-bold">
                ${data.authorizedSignatory || 'Authorized Signatory'}
            </div>

            <div class="text-xs text-gray-500 mt-1">
                For ${data.companyName || 'SOLARICA'}
            </div>

        </div>

    </div>

</div>

</body>
</html>

`;
};