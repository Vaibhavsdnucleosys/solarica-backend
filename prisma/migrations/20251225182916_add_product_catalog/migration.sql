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
