-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "company" TEXT NOT NULL DEFAULT 'Solarica Energy India Pvt Ltd';
