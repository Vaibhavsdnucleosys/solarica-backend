-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "category" TEXT DEFAULT 'DOMESTIC',
ADD COLUMN     "currency" TEXT DEFAULT 'INR';
