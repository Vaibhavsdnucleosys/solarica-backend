-- CreateEnum
CREATE TYPE "PaymentProofType" AS ENUM ('ADVANCE', 'FULL', 'LIGHT_BILL');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'OPC', 'NGO', 'TRUST', 'SOCIETY', 'HUF', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'ADMIN', 'ACCOUNTANT', 'AUDITOR', 'DATA_ENTRY', 'VIEWER');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('PRIMARY', 'SECONDARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AccountNature" AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "VoucherCategory" AS ENUM ('PAYMENT', 'RECEIPT', 'CONTRA', 'JOURNAL', 'SALES', 'PURCHASE', 'DEBIT_NOTE', 'CREDIT_NOTE', 'PAYROLL');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'POST', 'REVERSE', 'LOCK', 'UNLOCK');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE_WITH_PAY', 'LEAVE_WITHOUT_PAY', 'HOLIDAY', 'WEEKLY_OFF');

-- CreateEnum
CREATE TYPE "CalcType" AS ENUM ('AS_USER_DEFINED_VALUE', 'AS_COMPUTED_VALUE', 'FLAT_RATE', 'ON_ATTENDANCE');

-- CreateEnum
CREATE TYPE "ComputeOn" AS ENUM ('CURRENT_EARNINGS_TOTAL', 'CURRENT_DEDUCTIONS_TOTAL', 'SPECIFIED_PAY_HEADS', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PayHeadType" AS ENUM ('EARNINGS_FOR_EMPLOYEES', 'DEDUCTIONS_FROM_EMPLOYEES', 'EMPLOYERS_STATUTORY_CONTRIBUTIONS', 'EMPLOYERS_OTHER_CHARGES', 'BONUS', 'REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "SalaryVoucherStatus" AS ENUM ('DRAFT', 'PROCESSED', 'APPROVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salesTarget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reportsToId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "accessGrants" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "teamId" TEXT,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaderId" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'Solarica Energy India Pvt Ltd',

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "isFinalized" BOOLEAN DEFAULT false,
    "finalizedAt" TIMESTAMP(6),
    "finalizedBy" TEXT,
    "finalizationNotes" TEXT,
    "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentsSubmitted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budgetConfirmed" BOOLEAN DEFAULT false,
    "technicalApproved" BOOLEAN DEFAULT false,
    "creditCheckDone" BOOLEAN DEFAULT false,
    "aadhaarNumber" TEXT,
    "aadhaarVerified" BOOLEAN DEFAULT false,
    "aadhaarVerifiedAt" TIMESTAMP(6),
    "aadhaarName" TEXT,
    "aadhaarAddress" TEXT,
    "aadhaarDOB" TEXT,
    "aadhaarGender" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "pdfFilePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "companyPhone" TEXT,
    "gstAmount" DOUBLE PRECISION,
    "netPayableAmount" DOUBLE PRECISION NOT NULL,
    "subsidyAmount" DOUBLE PRECISION,
    "systemCapacityKw" DOUBLE PRECISION NOT NULL,
    "systemCost" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION,
    "fromCompanyName" TEXT,
    "BillingNumber" TEXT,
    "CustomerNumber" TEXT,
    "consumerNumber" TEXT,
    "gstNumber" TEXT,
    "customerType" TEXT,
    "gstRate" DOUBLE PRECISION,
    "numberOfFlats" INTEGER,
    "onGrid" TEXT,
    "phase" TEXT,
    "subsidyType" TEXT,
    "validityDays" INTEGER,
    "rejectionReason" TEXT,
    "doc1" TEXT,
    "doc2" TEXT,
    "doc3" TEXT,
    "leadStatus" TEXT,
    "remarks" TEXT,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "make1" TEXT,
    "make2" TEXT,
    "specification1" TEXT,
    "specification2" TEXT,
    "specification3" TEXT,
    "specification7" TEXT,
    "specification8" TEXT,
    "specification9" TEXT,
    "specification" TEXT,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotationId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" TEXT NOT NULL,
    "type" "PaymentProofType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "quotationId" TEXT,
    "invoiceId" TEXT,

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarHeaterCatalog" (
    "id" SERIAL NOT NULL,
    "particular" TEXT NOT NULL,
    "basicPrice" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SolarHeaterCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarPanelCatalog" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "rateRange" TEXT NOT NULL,
    "wattRange" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "SolarPanelCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarInverterCatalog" (
    "id" SERIAL NOT NULL,
    "capacityKw" DOUBLE PRECISION NOT NULL,
    "phase" TEXT NOT NULL,
    "dealerPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SolarInverterCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecorativeLightCatalog" (
    "id" SERIAL NOT NULL,
    "particular" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DecorativeLightCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarCameraCatalog" (
    "id" SERIAL NOT NULL,
    "particular" TEXT NOT NULL,
    "basicPrice" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SolarCameraCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hsn_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "description" TEXT,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hsn_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gstinNumber" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "modeOfDispatch" TEXT,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerContact" TEXT NOT NULL,
    "customerGstinUin" TEXT,
    "recipientName" TEXT,
    "shippingAddress" TEXT,
    "stateCode" TEXT,
    "placeOfSupply" TEXT,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "cashDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotalPayable" DOUBLE PRECISION NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "termsAndConditions" TEXT,
    "amountInWords" TEXT,
    "pdfFilePath" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerEmail" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "category" TEXT DEFAULT 'DOMESTIC',
    "currency" TEXT DEFAULT 'INR',
    "pdfSalesFilePath" TEXT,
    "remarks" TEXT,
    "salesPersonName" TEXT,
    "salesPersonPhone" TEXT,
    "trackingNumber" TEXT,
    "transportThrough" TEXT,
    "exchangeRate" DOUBLE PRECISION,
    "isProforma" BOOLEAN NOT NULL DEFAULT false,
    "referenceNumber" TEXT,
    "rejectionReason" TEXT,
    "swiftCode" TEXT,
    "voucherId" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "hsnSac" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarPumpDcCatalog" (
    "id" SERIAL NOT NULL,
    "solarPumpSet" TEXT NOT NULL,
    "totalDutyHead" TEXT NOT NULL,
    "mtrInFootBoreSize" TEXT NOT NULL,
    "workingCapacity" TEXT NOT NULL,
    "waterFlowOnGround" TEXT NOT NULL,
    "pipeline" TEXT NOT NULL,
    "sellingPriceGstExtra" DOUBLE PRECISION NOT NULL,
    "pvArray" TEXT NOT NULL,
    "noOfPanelsRequired" TEXT,
    "waterFlow" TEXT NOT NULL,

    CONSTRAINT "SolarPumpDcCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarAcPumpControllerCatalog" (
    "id" SERIAL NOT NULL,
    "solarPumpController" TEXT NOT NULL,
    "singlePhaseAvailable" BOOLEAN NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "panelWattageRequired" TEXT NOT NULL,
    "noOfPanelsRequired" TEXT NOT NULL,

    CONSTRAINT "SolarAcPumpControllerCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarStreetLightAllInOneCatalog" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SolarStreetLightAllInOneCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "displayName" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL DEFAULT 'PRIVATE_LIMITED',
    "industry" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "tan" TEXT,
    "cin" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "pincode" TEXT,
    "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
    "financialYearStart" TEXT NOT NULL DEFAULT '04-01',
    "booksBeginningFrom" TIMESTAMP(3) NOT NULL,
    "enableGST" BOOLEAN NOT NULL DEFAULT true,
    "enableTDS" BOOLEAN NOT NULL DEFAULT false,
    "enableInventory" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "baseCurrencyFormalName" TEXT NOT NULL DEFAULT 'INR',
    "baseCurrencySymbol" TEXT NOT NULL DEFAULT '₹',
    "fax" TEXT,
    "financialYearFrom" TIMESTAMP(3),
    "mobile" TEXT,
    "telephone" TEXT,
    "parentId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUser" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'ACCOUNTANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialYear" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "yearName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountGroup" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "parentId" TEXT,
    "groupType" "GroupType" NOT NULL DEFAULT 'CUSTOM',
    "nature" "AccountNature" NOT NULL,
    "affectsGrossProfit" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "AccountGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "openingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "openingBalanceType" "BalanceType" NOT NULL DEFAULT 'DEBIT',
    "currentBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currentBalanceType" "BalanceType" NOT NULL DEFAULT 'DEBIT',
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "branch" TEXT,
    "isBankAccount" BOOLEAN NOT NULL DEFAULT false,
    "isCashAccount" BOOLEAN NOT NULL DEFAULT false,
    "isPartyAccount" BOOLEAN NOT NULL DEFAULT false,
    "isTaxAccount" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "tdsApplicable" BOOLEAN NOT NULL DEFAULT false,
    "tdsLimit" DOUBLE PRECISION,
    "tdsNatureOfPayment" TEXT,
    "tdsRate" DOUBLE PRECISION,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "financialYearId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "balanceType" "BalanceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TO_DO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedTarget" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherType" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "VoucherCategory" NOT NULL,
    "prefix" TEXT,
    "suffix" TEXT,
    "startingNumber" INTEGER NOT NULL DEFAULT 1,
    "currentNumber" INTEGER NOT NULL DEFAULT 1,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "voucherTypeId" TEXT NOT NULL,
    "financialYearId" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "voucherDate" TIMESTAMP(3) NOT NULL,
    "referenceNumber" TEXT,
    "referenceDate" TIMESTAMP(3),
    "narration" TEXT,
    "status" "VoucherStatus" NOT NULL DEFAULT 'DRAFT',
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "reversedBy" TEXT,
    "reversalVoucherId" TEXT,
    "originalVoucherId" TEXT,
    "totalDebit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "partyLedgerId" TEXT,
    "invoiceNumber" TEXT,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bankDate" TIMESTAMP(3),
    "instrumentDate" TIMESTAMP(3),
    "instrumentNumber" TEXT,
    "instrumentType" TEXT,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" TIMESTAMP(3),
    "reconciledBy" TEXT,

    CONSTRAINT "VoucherEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingAuditLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changes" JSONB,
    "description" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "voucherId" TEXT,

    CONSTRAINT "AccountingAuditLog_pkey" PRIMARY KEY ("id")
);

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
    "invoiceId" TEXT,
    "workOrderUrl" TEXT,

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

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "attendanceType" "AttendanceType" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeGroup" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "parentId" TEXT,
    "defineSalaryDetails" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PTSlab" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "salaryFrom" DECIMAL(15,2) NOT NULL,
    "salaryTo" DECIMAL(15,2) NOT NULL,
    "monthlyAmount" DECIMAL(15,2) NOT NULL,
    "isFebruaryOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PTSlab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayHead" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "payHeadType" "PayHeadType" NOT NULL,
    "incomeType" TEXT NOT NULL DEFAULT 'Fixed',
    "ledgerGroupName" TEXT,
    "ledgerId" TEXT,
    "affectNetSalary" BOOLEAN NOT NULL DEFAULT true,
    "calcType" "CalcType" NOT NULL DEFAULT 'AS_USER_DEFINED_VALUE',
    "computeOn" "ComputeOn" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "computePercentage" DECIMAL(8,4),
    "computePayHeadIds" TEXT[],
    "isSlabBased" BOOLEAN NOT NULL DEFAULT false,
    "payslipDisplayName" TEXT,
    "useForGratuity" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isStatutory" BOOLEAN NOT NULL DEFAULT false,
    "statutoryType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollEmployee" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "employeeNumber" TEXT,
    "dateOfJoining" TIMESTAMP(3) NOT NULL,
    "dateOfLeaving" TIMESTAMP(3),
    "designation" TEXT,
    "department" TEXT,
    "function" TEXT,
    "location" TEXT,
    "employeeGroupId" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "bloodGroup" TEXT,
    "fatherMotherName" TEXT,
    "spouseName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "ifscCode" TEXT,
    "bankBranch" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "uan" TEXT,
    "pfAccountNumber" TEXT,
    "pran" TEXT,
    "esiNumber" TEXT,
    "pfApplicable" BOOLEAN NOT NULL DEFAULT false,
    "esiApplicable" BOOLEAN NOT NULL DEFAULT false,
    "ptApplicable" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "pfJoinDate" TIMESTAMP(3),

    CONSTRAINT "PayrollEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollLock" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedBy" TEXT NOT NULL,
    "employeeGroupId" TEXT,

    CONSTRAINT "PayrollLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeGroupId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructureItem" (
    "id" TEXT NOT NULL,
    "salaryStructureId" TEXT NOT NULL,
    "payHeadId" TEXT NOT NULL,
    "amount" DECIMAL(15,2),
    "percentage" DECIMAL(8,4),
    "formula" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SalaryStructureItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryVoucher" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalWorkingDays" DECIMAL(5,1) NOT NULL,
    "daysPresent" DECIMAL(5,1) NOT NULL,
    "daysAbsent" DECIMAL(5,1) NOT NULL,
    "leaveWithPay" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "grossEarnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "employerContributions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "SalaryVoucherStatus" NOT NULL DEFAULT 'DRAFT',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "voucherId" TEXT,
    "narration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryVoucherItem" (
    "id" TEXT NOT NULL,
    "salaryVoucherId" TEXT NOT NULL,
    "payHeadId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "computedPercentage" DECIMAL(8,4),
    "computedOnAmount" DECIMAL(15,2),
    "payHeadType" "PayHeadType" NOT NULL,
    "affectsNetSalary" BOOLEAN NOT NULL DEFAULT true,
    "payHeadName" TEXT NOT NULL,

    CONSTRAINT "SalaryVoucherItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutoryConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "pfEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pfRegistrationNumber" TEXT,
    "pfEstablishmentId" TEXT,
    "pfWageCeiling" DECIMAL(15,2),
    "esiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "esiRegistrationNumber" TEXT,
    "esiWageCeiling" DECIMAL(15,2),
    "ptEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ptRegistrationNumber" TEXT,
    "ptState" TEXT,
    "payrollEnabled" BOOLEAN NOT NULL DEFAULT true,
    "attendanceRequired" BOOLEAN NOT NULL DEFAULT true,
    "defaultWorkingDays" INTEGER NOT NULL DEFAULT 26,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "StatutoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCategory" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "underId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "StockCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockGroup" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "underId" TEXT,
    "shouldAddQuantities" BOOLEAN NOT NULL DEFAULT false,
    "gstApplicable" TEXT NOT NULL DEFAULT 'Applicable',
    "hsnSac" TEXT,
    "hsnDescription" TEXT,
    "taxabilityType" TEXT,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "StockGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "groupId" TEXT,
    "categoryId" TEXT,
    "unitId" TEXT,
    "gstApplicable" TEXT NOT NULL DEFAULT 'Applicable',
    "hsnSource" TEXT NOT NULL DEFAULT 'As per Company/Stock Group',
    "hsnSac" TEXT,
    "hsnDescription" TEXT,
    "gstRateSource" TEXT NOT NULL DEFAULT 'As per Company/Stock Group',
    "taxabilityType" TEXT,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "typeOfSupply" TEXT NOT NULL DEFAULT 'Goods',
    "rateOfDuty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Simple',
    "symbol" TEXT NOT NULL,
    "formalName" TEXT NOT NULL,
    "uqc" TEXT,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT,
    "customerAddress" TEXT,
    "customerContact" TEXT,
    "customerGst" TEXT,
    "customerState" TEXT,
    "shipToAddress" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "finishedGoodName" TEXT,
    "finishedGoodQty" INTEGER,
    "items" JSONB NOT NULL,
    "additionalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Godown" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "underId" TEXT,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Godown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GodownStock" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "companyId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "godownId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GodownStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "customerType" TEXT DEFAULT 'Individual',
    "creditLimit" DOUBLE PRECISION DEFAULT 0,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSN" (
    "id" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "cessRate" DOUBLE PRECISION DEFAULT 0,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HSN_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "vendorName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "paymentTerms" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "productCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN DEFAULT true,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_email_key" ON "Worker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_leaderId_key" ON "Team"("leaderId");

-- CreateIndex
CREATE INDEX "PaymentProof_uploadedById_idx" ON "PaymentProof"("uploadedById");

-- CreateIndex
CREATE INDEX "PaymentProof_quotationId_idx" ON "PaymentProof"("quotationId");

-- CreateIndex
CREATE INDEX "PaymentProof_invoiceId_idx" ON "PaymentProof"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "hsn_master_code_key" ON "hsn_master"("code");

-- CreateIndex
CREATE INDEX "hsn_master_code_idx" ON "hsn_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Company_ownerId_idx" ON "Company"("ownerId");

-- CreateIndex
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_name_key" ON "Company"("ownerId", "name");

-- CreateIndex
CREATE INDEX "CompanyUser_userId_idx" ON "CompanyUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUser_companyId_userId_key" ON "CompanyUser"("companyId", "userId");

-- CreateIndex
CREATE INDEX "FinancialYear_companyId_isActive_idx" ON "FinancialYear"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialYear_companyId_yearName_key" ON "FinancialYear"("companyId", "yearName");

-- CreateIndex
CREATE INDEX "AccountGroup_companyId_groupType_idx" ON "AccountGroup"("companyId", "groupType");

-- CreateIndex
CREATE INDEX "AccountGroup_parentId_idx" ON "AccountGroup"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountGroup_companyId_name_key" ON "AccountGroup"("companyId", "name");

-- CreateIndex
CREATE INDEX "Ledger_companyId_groupId_idx" ON "Ledger"("companyId", "groupId");

-- CreateIndex
CREATE INDEX "Ledger_companyId_isActive_idx" ON "Ledger"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_companyId_name_key" ON "Ledger"("companyId", "name");

-- CreateIndex
CREATE INDEX "OpeningBalance_companyId_financialYearId_idx" ON "OpeningBalance"("companyId", "financialYearId");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_ledgerId_financialYearId_key" ON "OpeningBalance"("ledgerId", "financialYearId");

-- CreateIndex
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherType_companyId_code_key" ON "VoucherType"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_reversalVoucherId_key" ON "Voucher"("reversalVoucherId");

-- CreateIndex
CREATE INDEX "Voucher_companyId_voucherDate_idx" ON "Voucher"("companyId", "voucherDate");

-- CreateIndex
CREATE INDEX "Voucher_companyId_status_idx" ON "Voucher"("companyId", "status");

-- CreateIndex
CREATE INDEX "Voucher_financialYearId_idx" ON "Voucher"("financialYearId");

-- CreateIndex
CREATE INDEX "Voucher_partyLedgerId_idx" ON "Voucher"("partyLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_companyId_voucherNumber_financialYearId_key" ON "Voucher"("companyId", "voucherNumber", "financialYearId");

-- CreateIndex
CREATE INDEX "VoucherEntry_voucherId_idx" ON "VoucherEntry"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherEntry_ledgerId_idx" ON "VoucherEntry"("ledgerId");

-- CreateIndex
CREATE INDEX "VoucherEntry_companyId_ledgerId_idx" ON "VoucherEntry"("companyId", "ledgerId");

-- CreateIndex
CREATE INDEX "VoucherEntry_isReconciled_idx" ON "VoucherEntry"("isReconciled");

-- CreateIndex
CREATE INDEX "AccountingAuditLog_companyId_entityType_entityId_idx" ON "AccountingAuditLog"("companyId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "AccountingAuditLog_companyId_performedAt_idx" ON "AccountingAuditLog"("companyId", "performedAt");

-- CreateIndex
CREATE INDEX "AccountingAuditLog_voucherId_idx" ON "AccountingAuditLog"("voucherId");

-- CreateIndex
CREATE INDEX "ProductionTask_status_idx" ON "ProductionTask"("status");

-- CreateIndex
CREATE INDEX "ProductionTask_assigneeId_idx" ON "ProductionTask"("assigneeId");

-- CreateIndex
CREATE INDEX "ProductionTask_invoiceId_idx" ON "ProductionTask"("invoiceId");

-- CreateIndex
CREATE INDEX "VoucherItem_voucherId_idx" ON "VoucherItem"("voucherId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_companyId_date_idx" ON "AttendanceRecord"("companyId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_companyId_employeeId_date_idx" ON "AttendanceRecord"("companyId", "employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_companyId_employeeId_date_key" ON "AttendanceRecord"("companyId", "employeeId", "date");

-- CreateIndex
CREATE INDEX "EmployeeGroup_companyId_parentId_idx" ON "EmployeeGroup"("companyId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_companyId_name_key" ON "EmployeeGroup"("companyId", "name");

-- CreateIndex
CREATE INDEX "PTSlab_state_idx" ON "PTSlab"("state");

-- CreateIndex
CREATE UNIQUE INDEX "PTSlab_state_salaryFrom_isFebruaryOverride_key" ON "PTSlab"("state", "salaryFrom", "isFebruaryOverride");

-- CreateIndex
CREATE INDEX "PayHead_companyId_isStatutory_idx" ON "PayHead"("companyId", "isStatutory");

-- CreateIndex
CREATE INDEX "PayHead_companyId_payHeadType_idx" ON "PayHead"("companyId", "payHeadType");

-- CreateIndex
CREATE UNIQUE INDEX "PayHead_companyId_name_key" ON "PayHead"("companyId", "name");

-- CreateIndex
CREATE INDEX "PayrollEmployee_companyId_employeeGroupId_idx" ON "PayrollEmployee"("companyId", "employeeGroupId");

-- CreateIndex
CREATE INDEX "PayrollEmployee_companyId_isActive_idx" ON "PayrollEmployee"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "PayrollEmployee_companyId_state_idx" ON "PayrollEmployee"("companyId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollEmployee_companyId_employeeNumber_key" ON "PayrollEmployee"("companyId", "employeeNumber");

-- CreateIndex
CREATE INDEX "PayrollLock_companyId_month_year_idx" ON "PayrollLock"("companyId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollLock_companyId_month_year_employeeGroupId_key" ON "PayrollLock"("companyId", "month", "year", "employeeGroupId");

-- CreateIndex
CREATE INDEX "SalaryStructure_companyId_employeeGroupId_idx" ON "SalaryStructure"("companyId", "employeeGroupId");

-- CreateIndex
CREATE INDEX "SalaryStructure_companyId_employeeId_idx" ON "SalaryStructure"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "SalaryStructure_effectiveFrom_idx" ON "SalaryStructure"("effectiveFrom");

-- CreateIndex
CREATE INDEX "SalaryStructureItem_payHeadId_idx" ON "SalaryStructureItem"("payHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructureItem_salaryStructureId_payHeadId_key" ON "SalaryStructureItem"("salaryStructureId", "payHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryVoucher_voucherId_key" ON "SalaryVoucher"("voucherId");

-- CreateIndex
CREATE INDEX "SalaryVoucher_companyId_month_year_idx" ON "SalaryVoucher"("companyId", "month", "year");

-- CreateIndex
CREATE INDEX "SalaryVoucher_companyId_status_idx" ON "SalaryVoucher"("companyId", "status");

-- CreateIndex
CREATE INDEX "SalaryVoucher_employeeId_idx" ON "SalaryVoucher"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryVoucher_companyId_employeeId_month_year_key" ON "SalaryVoucher"("companyId", "employeeId", "month", "year");

-- CreateIndex
CREATE INDEX "SalaryVoucherItem_payHeadId_idx" ON "SalaryVoucherItem"("payHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryVoucherItem_salaryVoucherId_payHeadId_key" ON "SalaryVoucherItem"("salaryVoucherId", "payHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "StatutoryConfig_companyId_key" ON "StatutoryConfig"("companyId");

-- CreateIndex
CREATE INDEX "StockCategory_companyId_idx" ON "StockCategory"("companyId");

-- CreateIndex
CREATE INDEX "StockCategory_underId_idx" ON "StockCategory"("underId");

-- CreateIndex
CREATE UNIQUE INDEX "StockCategory_companyId_name_key" ON "StockCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "StockGroup_companyId_idx" ON "StockGroup"("companyId");

-- CreateIndex
CREATE INDEX "StockGroup_underId_idx" ON "StockGroup"("underId");

-- CreateIndex
CREATE UNIQUE INDEX "StockGroup_companyId_name_key" ON "StockGroup"("companyId", "name");

-- CreateIndex
CREATE INDEX "StockItem_categoryId_idx" ON "StockItem"("categoryId");

-- CreateIndex
CREATE INDEX "StockItem_companyId_idx" ON "StockItem"("companyId");

-- CreateIndex
CREATE INDEX "StockItem_groupId_idx" ON "StockItem"("groupId");

-- CreateIndex
CREATE INDEX "StockItem_unitId_idx" ON "StockItem"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_companyId_name_key" ON "StockItem"("companyId", "name");

-- CreateIndex
CREATE INDEX "Unit_companyId_idx" ON "Unit"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_companyId_symbol_key" ON "Unit"("companyId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_jobId_key" ON "WorkOrder"("jobId");

-- CreateIndex
CREATE INDEX "WorkOrder_createdById_idx" ON "WorkOrder"("createdById");

-- CreateIndex
CREATE INDEX "WorkOrder_jobId_idx" ON "WorkOrder"("jobId");

-- CreateIndex
CREATE INDEX "Godown_companyId_idx" ON "Godown"("companyId");

-- CreateIndex
CREATE INDEX "Godown_underId_idx" ON "Godown"("underId");

-- CreateIndex
CREATE UNIQUE INDEX "Godown_companyId_name_key" ON "Godown"("companyId", "name");

-- CreateIndex
CREATE INDEX "GodownStock_companyId_idx" ON "GodownStock"("companyId");

-- CreateIndex
CREATE INDEX "GodownStock_godownId_idx" ON "GodownStock"("godownId");

-- CreateIndex
CREATE INDEX "GodownStock_stockItemId_idx" ON "GodownStock"("stockItemId");

-- CreateIndex
CREATE UNIQUE INDEX "GodownStock_stockItemId_godownId_key" ON "GodownStock"("stockItemId", "godownId");

-- CreateIndex
CREATE UNIQUE INDEX "HSN_hsnCode_key" ON "HSN"("hsnCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialYear" ADD CONSTRAINT "FinancialYear_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountGroup" ADD CONSTRAINT "AccountGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountGroup" ADD CONSTRAINT "AccountGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AccountGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AccountGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherType" ADD CONSTRAINT "VoucherType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_partyLedgerId_fkey" FOREIGN KEY ("partyLedgerId") REFERENCES "Ledger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_reversalVoucherId_fkey" FOREIGN KEY ("reversalVoucherId") REFERENCES "Voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_voucherTypeId_fkey" FOREIGN KEY ("voucherTypeId") REFERENCES "VoucherType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEntry" ADD CONSTRAINT "VoucherEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEntry" ADD CONSTRAINT "VoucherEntry_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherEntry" ADD CONSTRAINT "VoucherEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingAuditLog" ADD CONSTRAINT "AccountingAuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingAuditLog" ADD CONSTRAINT "AccountingAuditLog_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherItem" ADD CONSTRAINT "VoucherItem_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "PayrollEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayHead" ADD CONSTRAINT "PayHead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayHead" ADD CONSTRAINT "PayHead_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEmployee" ADD CONSTRAINT "PayrollEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEmployee" ADD CONSTRAINT "PayrollEmployee_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLock" ADD CONSTRAINT "PayrollLock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLock" ADD CONSTRAINT "PayrollLock_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "PayrollEmployee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructureItem" ADD CONSTRAINT "SalaryStructureItem_payHeadId_fkey" FOREIGN KEY ("payHeadId") REFERENCES "PayHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructureItem" ADD CONSTRAINT "SalaryStructureItem_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryVoucher" ADD CONSTRAINT "SalaryVoucher_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryVoucher" ADD CONSTRAINT "SalaryVoucher_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "PayrollEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryVoucher" ADD CONSTRAINT "SalaryVoucher_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryVoucherItem" ADD CONSTRAINT "SalaryVoucherItem_payHeadId_fkey" FOREIGN KEY ("payHeadId") REFERENCES "PayHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryVoucherItem" ADD CONSTRAINT "SalaryVoucherItem_salaryVoucherId_fkey" FOREIGN KEY ("salaryVoucherId") REFERENCES "SalaryVoucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatutoryConfig" ADD CONSTRAINT "StatutoryConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCategory" ADD CONSTRAINT "StockCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCategory" ADD CONSTRAINT "StockCategory_underId_fkey" FOREIGN KEY ("underId") REFERENCES "StockCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockGroup" ADD CONSTRAINT "StockGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockGroup" ADD CONSTRAINT "StockGroup_underId_fkey" FOREIGN KEY ("underId") REFERENCES "StockGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StockCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StockGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Godown" ADD CONSTRAINT "Godown_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Godown" ADD CONSTRAINT "Godown_underId_fkey" FOREIGN KEY ("underId") REFERENCES "Godown"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GodownStock" ADD CONSTRAINT "GodownStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GodownStock" ADD CONSTRAINT "GodownStock_godownId_fkey" FOREIGN KEY ("godownId") REFERENCES "Godown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GodownStock" ADD CONSTRAINT "GodownStock_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

