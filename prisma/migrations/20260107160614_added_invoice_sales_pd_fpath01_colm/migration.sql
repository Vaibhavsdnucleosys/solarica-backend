/*
  Warnings:

  - You are about to drop the column `pdfSalesFilePath` on the `Quotation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "pdfSalesFilePath" TEXT;

-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "pdfSalesFilePath";
