-- AlterEnum
ALTER TYPE "PaymentProofType" ADD VALUE 'LIGHT_BILL';

-- DropForeignKey
ALTER TABLE "PaymentProof" DROP CONSTRAINT "PaymentProof_quotationId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "baseCurrencyFormalName" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "baseCurrencySymbol" TEXT NOT NULL DEFAULT '₹',
ADD COLUMN     "fax" TEXT,
ADD COLUMN     "financialYearFrom" TIMESTAMP(3),
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "telephone" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "salesPersonName" TEXT,
ADD COLUMN     "salesPersonPhone" TEXT,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "transportThrough" TEXT;

-- AlterTable
ALTER TABLE "Ledger" ADD COLUMN     "tdsApplicable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tdsLimit" DOUBLE PRECISION,
ADD COLUMN     "tdsNatureOfPayment" TEXT,
ADD COLUMN     "tdsRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PaymentProof" ADD COLUMN     "invoiceId" TEXT,
ALTER COLUMN "quotationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "leadStatus" TEXT,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Voucher" ADD COLUMN     "partyLedgerId" TEXT;

-- CreateTable
CREATE TABLE "ProductionTask" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetQuantity" INTEGER NOT NULL,
    "completedQuantity" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "priority" TEXT NOT NULL,
    "category" TEXT,
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "qcPassed" BOOLEAN NOT NULL DEFAULT false,
    "qcRemarks" TEXT,
    "dispatchDate" TIMESTAMP(3),
    "dispatchNotes" TEXT,
    "dispatchQty" INTEGER,
    "quotationId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "orderDetails" TEXT,
    "systemCapacity" DOUBLE PRECISION,
    "deliveryAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherItem" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "rate" DECIMAL(15,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "VoucherItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductionTask_status_idx" ON "ProductionTask"("status");

-- CreateIndex
CREATE INDEX "ProductionTask_assigneeId_idx" ON "ProductionTask"("assigneeId");

-- CreateIndex
CREATE INDEX "VoucherItem_voucherId_idx" ON "VoucherItem"("voucherId");

-- CreateIndex
CREATE INDEX "PaymentProof_invoiceId_idx" ON "PaymentProof"("invoiceId");

-- CreateIndex
CREATE INDEX "Voucher_partyLedgerId_idx" ON "Voucher"("partyLedgerId");

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_partyLedgerId_fkey" FOREIGN KEY ("partyLedgerId") REFERENCES "Ledger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherItem" ADD CONSTRAINT "VoucherItem_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
