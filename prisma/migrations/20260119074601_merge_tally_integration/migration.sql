-- DropIndex
DROP INDEX "Invoice_createdById_idx";

-- DropIndex
DROP INDEX "Invoice_invoiceNumber_idx";

-- AlterTable
ALTER TABLE "QuotationItem" ADD COLUMN     "specification" TEXT;
