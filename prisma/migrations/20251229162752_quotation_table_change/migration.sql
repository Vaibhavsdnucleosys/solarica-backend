-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "customerType" TEXT,
ADD COLUMN     "gstRate" DOUBLE PRECISION,
ADD COLUMN     "numberOfFlats" INTEGER,
ADD COLUMN     "onGrid" TEXT,
ADD COLUMN     "phase" TEXT,
ADD COLUMN     "subsidyType" TEXT;
