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
