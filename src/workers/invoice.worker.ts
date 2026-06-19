import { Worker } from "bullmq";
import prisma from "../config/prisma";
import { generateInvoicePDF } from "../services/pdf.service";
import { uploadPDFToSupabase } from "../config/supabase";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

new Worker(
  "invoiceQueue",
  async (job) => {
    const { invoiceId } = job.data;

    console.log("🚀 Worker started:", invoiceId);

    // const invoice = await prisma.invoice.findUnique({
    //   where: { id: invoiceId },
    //   include: { items: true },
    // });

    const invoice = await prisma.invoice.findUnique({
  where: {
    id: invoiceId
  },

  include: {

    items: true,

    assignedTo: {

      select: {

        id: true,

        name: true,

        phone: true

      }

    }

  },
});

    if (!invoice) throw new Error("Invoice not found");

    // STANDARD PDF
    const standardPdfBuffer = await generateInvoicePDF(invoice, "STANDARD");

    const standardUrl = await uploadPDFToSupabase(
      standardPdfBuffer,
      `invoices/${new Date().getFullYear()}/INV-${invoice.invoiceNumber}.pdf`,
      "application/pdf",
      "invoices"
    );

    // SALES PDF
    const salesPdfBuffer = await generateInvoicePDF(invoice, "SALES");

    const salesUrl = await uploadPDFToSupabase(
      salesPdfBuffer,
      `invoices/${new Date().getFullYear()}/SALES-INV-${invoice.invoiceNumber}.pdf`,
      "application/pdf",
      "invoices"
    );

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfFilePath: standardUrl,
        // @ts-ignore
        pdfSalesFilePath: salesUrl,
        pdfStatus: "GENERATED",
      },
    });

    console.log("✅ PDF done:", invoiceId);
  },
  { connection }
);