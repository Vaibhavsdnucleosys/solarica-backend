/*
  Warnings:

  - You are about to drop the column `budget` on the `Quotation` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `Quotation` table. All the data in the column will be lost.
  - Added the required column `netPayableAmount` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemCapacityKw` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemCost` to the `Quotation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "budget",
DROP COLUMN "serviceType",
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "netPayableAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subsidyAmount" DOUBLE PRECISION,
ADD COLUMN     "systemCapacityKw" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "systemCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specification" TEXT,
    "make" TEXT,
    "quantity" TEXT NOT NULL,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
