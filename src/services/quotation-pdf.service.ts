import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import { uploadPDFToSupabase } from "../config/supabase";
import { logger } from "../config/logger.config";

/**
 * Service to generate Quotation PDFs from DOCX templates
 * Requires LibreOffice installed on the system (sofice)
 */
export const generateQuotationPDF = async (quotationData: any) => {
    logger.info(`[Quotation Service] Received quotation generation request for: ${quotationData.companyName}`);

    try {
        // Determine which template to use
        const isSociety = quotationData.customerType?.toLowerCase() === 'society';
        const templateName = isSociety ? "societyTemplate.docx" : "individualTemplate.docx";

        logger.info(`[Quotation Service] Customer Type: ${quotationData.customerType} -> Using template: ${templateName}`);

        const templatePath = path.join(
            process.cwd(),
            "src/templates",
            templateName
        );

        if (!fs.existsSync(templatePath)) {
            logger.error(`[Quotation Service] Template not found at ${templatePath}`);
            throw new Error(`Template not found at ${templatePath}`);
        }

        // Load DOCX template
        const content = await fs.readFile(templatePath, "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: "{{", end: "}}" },
        });

        // Inject data & Render DOCX
        doc.render({
            client_name: quotationData.companyName,
            client_email: quotationData.companyEmail,
            consumer_number: quotationData.consumerNumber,
            billing_number: quotationData.BillingNumber,
            customer_number: quotationData.CustomerNumber,
            gst_number: quotationData.gstNumber,
            quotation_date: new Date().toLocaleDateString('en-IN'),
            system_capacity: quotationData.systemCapacityKw,
            validity_days: quotationData.validityDays || quotationData.validity_days || '5',
            system_cost: quotationData.systemCost,
            total_system_cost: quotationData.totalAmount,
            gst_amount: quotationData.gstAmount || quotationData.gst_amount || 0,
            subsidyAmount: quotationData.subsidyAmount,
            net_investment_cost: quotationData.netPayableAmount || quotationData.net_investment_cost,
            // Map specifications from each item's 'specification' field (main spec per item row)
            // Item 0 = Solar PV Modules, Item 1 = Solar Inverter, Item 2 = Solar Structure, etc.
            specification_1: quotationData.items?.[0]?.specification || quotationData.items?.[0]?.specification1 || '',
            specification_2: quotationData.items?.[1]?.specification || quotationData.items?.[1]?.specification2 || '',
            specification_3: quotationData.items?.[2]?.specification || quotationData.items?.[2]?.specification3 || '',
            specification_7: quotationData.items?.[3]?.specification || quotationData.items?.[3]?.specification7 || '',
            specification_8: quotationData.items?.[4]?.specification || quotationData.items?.[4]?.specification8 || '',
            specification_9: quotationData.items?.[5]?.specification || quotationData.items?.[5]?.specification9 || '',
            // Make fields: make2 contains the actual brand/make
            make_1: quotationData.items?.[0]?.make2 || quotationData.items?.[0]?.make || '',
            make_2: quotationData.items?.[1]?.make2 || quotationData.items?.[1]?.make || '',
            items: (quotationData.items || []).map((item: any) => ({
                name: item.name || item.make1,
                specification_1: item.specification1 || '',
                specification_2: item.specification2 || '',
                specification_3: item.specification3 || '',
                specification_7: item.specification7 || '',
                specification_8: item.specification8 || '',
                specification_9: item.specification9 || '',
                make: item.make || item.make2,
                quantity: item.quantity || '',
            })),
        });

        // Save DOCX temporarily
        const tempDir = path.join(process.cwd(), "tmp");
        await fs.ensureDir(tempDir);

        const qtnNumber = quotationData.quotation_number || quotationData.id || 'temp';
        const docxPath = path.join(tempDir, `QTN-${qtnNumber}.docx`);
        const pdfPath = docxPath.replace(".docx", ".pdf");

        try {
            await fs.writeFile(
                docxPath,
                doc.getZip().generate({ type: "nodebuffer" })
            );

            // Convert DOCX → PDF
            const soffice = process.env.LIBREOFFICE_PATH || 'soffice';

            await new Promise<void>((resolve, reject) => {
                const command = `"${soffice}" --headless --convert-to pdf "${docxPath}" --outdir "${tempDir}"`;
                exec(command, (err, stdout, stderr) => {
                    if (err) {
                        logger.error(`[Quotation Service] LibreOffice Error: ${err.message}`);
                        reject(new Error(`PDF conversion failed: ${err.message}`));
                    } else {
                        resolve();
                    }
                });
            });

            // Upload to Supabase
            const pdfBuffer = await fs.readFile(pdfPath);
            const fileName = `quotations/2025/QTN-${qtnNumber}.pdf`;

            const pdfUrl = await uploadPDFToSupabase(pdfBuffer, fileName, "application/pdf", "quotations");
            return pdfUrl;
        } finally {
            // Cleanup temporary files
            await Promise.all([
                fs.remove(docxPath).catch(() => { }),
                fs.remove(pdfPath).catch(() => { })
            ]);
        }

    } catch (error: any) {
        logger.error(`[Quotation Service] Error: ${error.message}`);
        throw error;
    }
};

