/*
  Warnings:

  - You are about to drop the column `specification` on the `QuotationItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuotationItem" DROP COLUMN "specification",
ADD COLUMN     "specification1" TEXT,
ADD COLUMN     "specification2" TEXT,
ADD COLUMN     "specification3" TEXT,
ADD COLUMN     "specification7" TEXT,
ADD COLUMN     "specification8" TEXT,
ADD COLUMN     "specification9" TEXT;
