import puppeteer from 'puppeteer';
import { buildInvoiceHTML, buildSalesInvoiceHTML } from '../templates/html/invoice.template';
import { buildWorkOrderHTML } from '../templates/html/workorder.template';
import { logger } from '../config/logger.config';
import { amountToWords } from '../utils/accounting/helpers';

/**
 * Service to generate Invoice PDFs using Puppeteer
 */
export const generateInvoicePDF = async (invoiceData: any, templateType: 'STANDARD' | 'SALES' = 'STANDARD'): Promise<Buffer> => {
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



const browser = await puppeteer.launch({
  executablePath: "/home/ubuntu/.cache/puppeteer/chrome/linux-143.0.7499.169/chrome-linux64/chrome",
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ]
});




    try {
        const page = await browser.newPage();
        
        const html = templateType === 'SALES' ? buildSalesInvoiceHTML(invoiceData) : buildInvoiceHTML(invoiceData);

        await page.setContent(html, { waitUntil: 'networkidle0' });

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
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const html = buildWorkOrderHTML(data);

        await page.setContent(html, { waitUntil: 'networkidle0' });

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

