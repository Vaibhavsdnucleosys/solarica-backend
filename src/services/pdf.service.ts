
import { buildInvoiceHTML, buildSalesInvoiceHTML } from '../templates/html/invoice.template';
import { buildWorkOrderHTML } from '../templates/html/workorder.template';
import { logger } from '../config/logger.config';
import { amountToWords } from '../utils/accounting/helpers';
import { buildTaxInvoiceHTML } from '../templates/html/taxInvoice.template';
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
/**
 * Service to generate Invoice PDFs using Puppeteer
 */
export const generateInvoicePDF = async (
  invoiceData: any,
  templateType: 'STANDARD' | 'SALES' | 'TAX' = 'STANDARD'
): Promise<Buffer> =>{

    invoiceData = {
    ...invoiceData,

    items: invoiceData.items || []
  };

  console.log(
    "PDF DEBUG",
    invoiceData.items
  );
    logger.info(`[PDF Service] Starting ${templateType} PDF generation for invoice: ${invoiceData.invoiceNumber}`);

    // [FIX] Fallback for missing amountInWords
    if (!invoiceData.amountInWords && invoiceData.grandTotalPayable) {
        invoiceData.amountInWords = amountToWords(Number(invoiceData.grandTotalPayable));
        logger.info(`[PDF Service] Generated amountInWords: ${invoiceData.amountInWords}`);
    }

    // const browser = await puppeteer.launch({
    //     headless: true,
    //     args: ['--no-sandbox', '--disable-setuid-sandbox']
    // });



// const browser = await puppeteer.launch({
//   executablePath: "/home/ubuntu/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome",
//   headless: true,
//   args: [
//     "--no-sandbox",
//     "--disable-setuid-sandbox",
//     "--disable-dev-shm-usage",
//     "--disable-gpu"
//   ]
// });

// const browser = await puppeteer.launch({
//   headless: true,
//   executablePath: process.env.CHROME_PATH || undefined,
//   args: [
//     "--no-sandbox",
//     "--disable-setuid-sandbox",
//     "--disable-dev-shm-usage",
//     "--disable-gpu",
//   ],
// });




const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),

  args: [
    ...chromium.args,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ],

  headless: true
});




    try {
        const page = await browser.newPage();
        
        // const html = templateType === 'SALES' ? buildSalesInvoiceHTML(invoiceData) : buildInvoiceHTML(invoiceData);
// const html =
//   templateType === 'SALES'

//     ? buildSalesInvoiceHTML({
//         ...invoiceData,
//         documentTitle: 'DELIVERY CHALLAN'
//       })

//    :templateType === 'TAX'

// ? buildTaxInvoiceHTML({
//     ...invoiceData,
//     documentTitle: 'TAX INVOICE',
//     isTaxInvoice: true
//   })

//     : buildInvoiceHTML({
//         ...invoiceData,
//         documentTitle: 'ESTIMATE'
//       });


const html =
  templateType === "SALES"
    ? buildSalesInvoiceHTML({
        ...invoiceData,
        documentTitle: "DELIVERY CHALLAN",
      })

    : templateType === "TAX"
    ? buildTaxInvoiceHTML({
        ...invoiceData,
        documentTitle: "TAX INVOICE",
        isTaxInvoice: true,
      })

    : buildInvoiceHTML({
        ...invoiceData,
        documentTitle: "ESTIMATE",
      });
       await page.setContent(html, {
  waitUntil: 'domcontentloaded'
});

await page.waitForNetworkIdle();

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            }
        });

        logger.info(`[PDF Service] ${templateType} PDF generated successfully for invoice: ${invoiceData.invoiceNumber}`);
        return Buffer.from(pdfBuffer);
    } catch (error: any) {
        logger.error(`[PDF Service] Error in ${templateType} generation: ${error.message}`);
        throw new Error(`Failed to generate ${templateType} invoice PDF: ${error.message}`);
    } finally {
        await browser.close();
    }
};

/**
 * Service to generate Work Order PDF
 */
export const generateWorkOrderPDF = async (data: any): Promise<Buffer> => {
    logger.info(`[PDF Service] Starting Work Order PDF generation for Job ID: ${data.jobId}`);

const browser = await puppeteer.launch({
  executablePath:
    process.env.RENDER
      ? await chromium.executablePath()
      : process.env.CHROME_PATH,

  args: process.env.RENDER
    ? chromium.args
    : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],

  headless: true,
});

    try {
        const page = await browser.newPage();
        const html = buildWorkOrderHTML(data);

        await page.setContent(html, {
  waitUntil: 'domcontentloaded'
});

await page.waitForNetworkIdle();

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            }
        });

        logger.info(`[PDF Service] Work Order PDF generated successfully for Job ID: ${data.jobId}`);
        return Buffer.from(pdfBuffer);
    } catch (error: any) {
        logger.error(`[PDF Service] Error in Work Order generation: ${error.message}`);
        throw new Error(`Failed to generate Work Order PDF: ${error.message}`);
    } finally {
        await browser.close();
    }
};

