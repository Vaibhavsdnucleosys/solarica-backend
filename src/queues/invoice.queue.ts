import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const invoiceQueue = new Queue("invoiceQueue", {
  connection,
});

export const queueInvoicePDFJob = async (invoiceId: string) => {
  await invoiceQueue.add(
    "generate-pdf",
    { invoiceId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
};