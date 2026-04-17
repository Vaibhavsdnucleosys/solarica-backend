/*
  Warnings:

  - You are about to drop the column `make` on the `QuotationItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `QuotationItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `QuotationItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuotationItem" DROP COLUMN "make",
DROP COLUMN "name",
DROP COLUMN "quantity",
ADD COLUMN     "make1" TEXT,
ADD COLUMN     "make2" TEXT;
