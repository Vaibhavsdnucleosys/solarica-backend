import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding static product catalogs...')

  /* ===============================
     CLEAN EXISTING DATA
  =============================== */
  await prisma.solarHeaterCatalog.deleteMany()
  await prisma.solarPanelCatalog.deleteMany()
  await prisma.solarInverterCatalog.deleteMany()
  await prisma.decorativeLightCatalog.deleteMany()
  await prisma.solarCameraCatalog.deleteMany()
  await prisma.solarPumpDcCatalog.deleteMany()
  await prisma.solarAcPumpControllerCatalog.deleteMany()
  await prisma.solarStreetLightAllInOneCatalog.deleteMany()

  /* ===============================
     1. SOLAR HEATER CATALOG
  =============================== */
  await prisma.solarHeaterCatalog.createMany({
    data: [
      {
        particular: '100 LPD SOLAR WATER HEATER',
        basicPrice: 14200,
        gst: 1704,
        totalAmount: 15904
      },
      {
        particular: '150 LPD SOLAR WATER HEATER',
        basicPrice: 16500,
        gst: 1980,
        totalAmount: 18480
      },
      {
        particular: '200 LPD SOLAR WATER HEATER',
        basicPrice: 20600,
        gst: 2472,
        totalAmount: 23072
      },
      {
        particular: '250 LPD SOLAR WATER HEATER',
        basicPrice: 26400,
        gst: 3168,
        totalAmount: 29568
      },
      {
        particular: '300 LPD SOLAR WATER HEATER',
        basicPrice: 29700,
        gst: 3564,
        totalAmount: 33264
      },
      {
        particular: '500 LPD SOLAR WATER HEATER',
        basicPrice: 36500,
        gst: 4380,
        totalAmount: 40880
      }
    ]
  })

  /* ===============================
     2. SOLAR PANEL CATALOG
  =============================== */
  await prisma.solarPanelCatalog.createMany({
    data: [
      { brand: 'DHOOP', rateRange: 'Rs 24.50 per watt', wattRange: '335 WATT' },
      { brand: 'GAUTAM SOLAR', rateRange: 'Rs 24.70 to 26 per watt', wattRange: '335 WATT' },
      { brand: 'NAVITAS', rateRange: 'Rs 26.50 per watt', wattRange: '335 WATT' },
      { brand: 'JYOTI TECH', rateRange: 'Rs 25 to 25.50 per watt', wattRange: '335 WATT' },
      { brand: 'AXITECH', rateRange: 'Rs 27 to 30 per watt', wattRange: '335 WATT' },
      { brand: 'WAREE', rateRange: 'Rs 28 to 29 per watt', wattRange: '335 WATT' },
      { brand: 'VIKRAM', rateRange: 'Rs 29.50 to 30 per watt', wattRange: '350 WATT' },
      { brand: 'MAX POWER', rateRange: 'Rs 26 to 28 per watt', wattRange: '335 WATT' },
      { brand: 'GOLDI', rateRange: 'Rs 25.50 to 26.50 per watt', wattRange: '335 WATT' },
      { brand: 'INNHOLIA', rateRange: 'Rs 25.50 to 26.50 per watt', wattRange: '335 WATT' },
      { brand: 'ADANI', rateRange: 'Rs 26.50 to 28.50 per watt', wattRange: '335 WATT' },

      {
        brand: 'DHOOP',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'NAVITAS',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'JYOTI TECH',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'AXITECH',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'WAREE',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'VIKRAM',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'MAX POWER',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'GOLDI',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'INNHOLIA',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      },
      {
        brand: 'ADANI',
        rateRange: 'Rs 27 to 32 per watt',
        wattRange: '440, 445, 455, 540 WATT'
      }
    ]
  })

  /* ===============================
     3. SOLAR INVERTER CATALOG
  =============================== */
  await prisma.solarInverterCatalog.createMany({
    data: [
      { capacityKw: 2, phase: 'SINGLE PHASE', dealerPrice: 18600 },
      { capacityKw: 3, phase: 'SINGLE PHASE', dealerPrice: 19600 },
      { capacityKw: 3.3, phase: 'SINGLE PHASE', dealerPrice: 19600 },
      { capacityKw: 4, phase: 'SINGLE PHASE', dealerPrice: 32600 },
      { capacityKw: 5, phase: 'SINGLE PHASE', dealerPrice: 33100 },
      { capacityKw: 6, phase: 'SINGLE PHASE', dealerPrice: 33700 },

      { capacityKw: 3, phase: 'THREE PHASE', dealerPrice: 51300 },
      { capacityKw: 5, phase: 'THREE PHASE', dealerPrice: 53000 },
      { capacityKw: 6, phase: 'THREE PHASE', dealerPrice: 54000 },
      { capacityKw: 8, phase: 'THREE PHASE', dealerPrice: 59100 },
      { capacityKw: 10, phase: 'THREE PHASE', dealerPrice: 60050 },
      { capacityKw: 12, phase: 'THREE PHASE', dealerPrice: 64300 },
      { capacityKw: 15, phase: 'THREE PHASE', dealerPrice: 67100 },
      { capacityKw: 20, phase: 'THREE PHASE', dealerPrice: 88200 },
      { capacityKw: 25, phase: 'THREE PHASE', dealerPrice: 89200 },
      { capacityKw: 30, phase: 'THREE PHASE', dealerPrice: 121200 },
      { capacityKw: 33, phase: 'THREE PHASE', dealerPrice: 132000 },
      { capacityKw: 40, phase: 'THREE PHASE', dealerPrice: 142000 },
      { capacityKw: 50, phase: 'THREE PHASE', dealerPrice: 159000 },
      { capacityKw: 60, phase: 'THREE PHASE', dealerPrice: 165400 },
      { capacityKw: 70, phase: 'THREE PHASE', dealerPrice: 223000 },
      { capacityKw: 80, phase: 'THREE PHASE', dealerPrice: 229400 },
      { capacityKw: 100, phase: 'THREE PHASE', dealerPrice: 297500 },
      { capacityKw: 125, phase: 'THREE PHASE', dealerPrice: 315400 },
      { capacityKw: 185, phase: 'THREE PHASE', dealerPrice: 387200 },
      { capacityKw: 250, phase: 'THREE PHASE', dealerPrice: 406400 },
      { capacityKw: 253, phase: 'THREE PHASE', dealerPrice: 413200 }
    ]
  })

  /* ===============================
     4. DECORATIVE LIGHT CATALOG
  =============================== */
  await prisma.decorativeLightCatalog.createMany({
    data: [
      {
        particular: 'GARDEN BOLLARD 96 NOS',
        price: 1365,
        gst: 163.8,
        totalPrice: 1528.8
      },
      {
        particular: 'LED SOLAR PATH/GARDEN LIGHT SEPL/GDL/SL16 (120W)',
        price: 4670,
        gst: 560.4,
        totalPrice: 5230.4
      },
      {
        particular: 'LED SOLAR PATH/GARDEN LIGHT SEPL/GDL/SL16 (5W)',
        price: 0,
        gst: 0,
        totalPrice: 0
      }
    ]
  })

  /* ===============================
     5. SOLAR CAMERA CATALOG
  =============================== */
  await prisma.solarCameraCatalog.createMany({
    data: [
      {
        particular:
          '4G CCTV Solar Camera (Bullet/Dome) 3–5 MP with 40W Panel, 12Ah Battery, Mounting Stand (without pole)',
        basicPrice: 14500,
        gst: 1740,
        totalAmount: 16240
      }
    ]
  })

  // -------------------------------
  // DC SOLAR PUMP (Pump + Motor + Controller Set)
  // -------------------------------
  await prisma.solarPumpDcCatalog.createMany({
    data: [
      {
        solarPumpSet: "1 HP",
        totalDutyHead: "30 Mtr",
        mtrInFootBoreSize: "96 foot",
        workingCapacity: "single head",
        waterFlowOnGround: "200-300 foot",
        pipeline: "1-1.5 inch",
        sellingPriceGstExtra: 29500,
        pvArray: "900 Watt",
        noOfPanelsRequired: null,
        waterFlow: "60 LPM",
      },
      {
        solarPumpSet: "1 HP",
        totalDutyHead: "60 Mtr",
        mtrInFootBoreSize: "193 foot",
        workingCapacity: "single head",
        waterFlowOnGround: "200-300 foot",
        pipeline: "1-1.5 inch",
        sellingPriceGstExtra: 31650,
        pvArray: "900 Watt",
        noOfPanelsRequired: null,
        waterFlow: "27 LPM",
      },
      {
        solarPumpSet: "1 HP",
        totalDutyHead: "90 Mtr",
        mtrInFootBoreSize: "289.8",
        workingCapacity: "single head",
        waterFlowOnGround: "200-300 foot",
        pipeline: "1-1.5 inch",
        sellingPriceGstExtra: 36500,
        pvArray: "900 Watt",
        noOfPanelsRequired: null,
        waterFlow: "14 LPM",
      },
      {
        solarPumpSet: "2 HP",
        totalDutyHead: "30 Mtr",
        mtrInFootBoreSize: "96 foot",
        workingCapacity: "multiply by 2 head",
        waterFlowOnGround: "200-300 foot",
        pipeline: "1-2 inch",
        sellingPriceGstExtra: 36200,
        pvArray: "1800 Watt",
        noOfPanelsRequired: null,
        waterFlow: "120 LPM",
      },
      {
        solarPumpSet: "2 HP",
        totalDutyHead: "60 Mtr",
        mtrInFootBoreSize: "193 foot",
        workingCapacity: "multiply by 2 head",
        waterFlowOnGround: "200-300 foot",
        pipeline: "1-2 inch",
        sellingPriceGstExtra: 39100,
        pvArray: "1800 Watt",
        noOfPanelsRequired: null,
        waterFlow: "55 LPM",
      },
      {
        solarPumpSet: "2 HP",
        totalDutyHead: "90 Mtr",
        mtrInFootBoreSize: "289.8",
        workingCapacity: "multiply by 2 head",
        waterFlowOnGround: "200-300 foot",
        pipeline: "1-2 inch",
        sellingPriceGstExtra: 41200,
        pvArray: "1800 Watt",
        noOfPanelsRequired: null,
        waterFlow: "35 LPM",
      },
      {
        solarPumpSet: "3 HP",
        totalDutyHead: "30 Mtr",
        mtrInFootBoreSize: "96 foot",
        workingCapacity: "3 hp so 3 head pump",
        waterFlowOnGround: "4000 foot",
        pipeline: "2.5-3 inch",
        sellingPriceGstExtra: 39600,
        pvArray: "3000 Watt",
        noOfPanelsRequired: null,
        waterFlow: "240 LPM",
      },
      {
        solarPumpSet: "3 HP",
        totalDutyHead: "70 Mtr",
        mtrInFootBoreSize: "225 foot",
        workingCapacity: "3 hp so 3 head pump",
        waterFlowOnGround: "4000 foot",
        pipeline: "2.5-3 inch",
        sellingPriceGstExtra: 45600,
        pvArray: "3000 Watt",
        noOfPanelsRequired: null,
        waterFlow: "90 LPM",
      },
      {
        solarPumpSet: "3 HP",
        totalDutyHead: "100 Mtr",
        mtrInFootBoreSize: "322 foot",
        workingCapacity: "3 hp motor so 3 head pump",
        waterFlowOnGround: "4000-5000 foot",
        pipeline: "2.5-3 inch",
        sellingPriceGstExtra: 47500,
        pvArray: "3000 Watt",
        noOfPanelsRequired: null,
        waterFlow: "60 LPM",
      },
      {
        solarPumpSet: "5 HP",
        totalDutyHead: "30 Mtr",
        mtrInFootBoreSize: "96 foot",
        workingCapacity: "5 hp motor so 5 head pump",
        waterFlowOnGround: "5000-7500 foot",
        pipeline: "3-5 inch",
        sellingPriceGstExtra: 49700,
        pvArray: "4800 Watt",
        noOfPanelsRequired: null,
        waterFlow: "300 LPM",
      },
      {
        solarPumpSet: "5 HP",
        totalDutyHead: "70 Mtr",
        mtrInFootBoreSize: "225 foot",
        workingCapacity: "5 hp motor so 5 head pump",
        waterFlowOnGround: "5000-7500 foot",
        pipeline: "3-5 inch",
        sellingPriceGstExtra: 52100,
        pvArray: "4800 Watt",
        noOfPanelsRequired: null,
        waterFlow: "150 LPM",
      },
      {
        solarPumpSet: "5 HP",
        totalDutyHead: "100 Mtr",
        mtrInFootBoreSize: "322 foot",
        workingCapacity: "5 hp motor so 5 head pump",
        waterFlowOnGround: "5000-7500 foot",
        pipeline: "3-5 inch",
        sellingPriceGstExtra: 56400,
        pvArray: "4800 Watt",
        noOfPanelsRequired: null,
        waterFlow: "115 LPM",
      },
      {
        solarPumpSet: "7.5 HP",
        totalDutyHead: "100 Mtr",
        mtrInFootBoreSize: "322 foot",
        workingCapacity: "7.5 hp motor so 7.5 head pump",
        waterFlowOnGround: "10000 foot",
        pipeline: "3-7 inch",
        sellingPriceGstExtra: 90200,
        pvArray: "7800 Watt",
        noOfPanelsRequired: "26 Nos",
        waterFlow: "250 LPM",
      },
    ],
  });

  // -------------------------------
  // SOLAR AC PUMP CONTROLLER
  // -------------------------------
  await prisma.solarAcPumpControllerCatalog.createMany({
    data: [
      {
        solarPumpController: "1 HP 110Vac 8A 3Phase",
        singlePhaseAvailable: true,
        sellingPrice: 16500,
        panelWattageRequired: "1200 Watt",
        noOfPanelsRequired: "4 Nos",
      },
      {
        solarPumpController: "2 HP 160Vac 9A 3Phase",
        singlePhaseAvailable: true,
        sellingPrice: 18500,
        panelWattageRequired: "1800 Watt",
        noOfPanelsRequired: "6 Nos",
      },
      {
        solarPumpController: "3 HP 230Vac 9A 3Phase",
        singlePhaseAvailable: true,
        sellingPrice: 19500,
        panelWattageRequired: "3000 Watt",
        noOfPanelsRequired: "10 Nos",
      },
      {
        solarPumpController: "5 HP 380/415Vac 9A 3Phase",
        singlePhaseAvailable: true,
        sellingPrice: 23200,
        panelWattageRequired: "4800 Watt",
        noOfPanelsRequired: "16 Nos",
      },
      {
        solarPumpController: "7.5 HP 300Vac 16A 3Phase",
        singlePhaseAvailable: true,
        sellingPrice: 34500,
        panelWattageRequired: "7800 Watt",
        noOfPanelsRequired: "26 Nos",
      },
      {
        solarPumpController: "7.5 HP 415Vac 14A 3Phase",
        singlePhaseAvailable: true,
        sellingPrice: 31200,
        panelWattageRequired: "8400 Watt",
        noOfPanelsRequired: "28 Nos",
      },
      {
        solarPumpController: "10 HP 380/415Vac 16A 3Phase",
        singlePhaseAvailable: false,
        sellingPrice: 37900,
        panelWattageRequired: "9600 Watt",
        noOfPanelsRequired: "32 Nos",
      },
      {
        solarPumpController: "15 HP 415Vac 24A 3Phase",
        singlePhaseAvailable: false,
        sellingPrice: 48600,
        panelWattageRequired: "14400 Watt",
        noOfPanelsRequired: "48 Nos",
      },
      {
        solarPumpController: "20 HP 415Vac 32A 3Phase",
        singlePhaseAvailable: false,
        sellingPrice: 72000,
        panelWattageRequired: "19200 Watt",
        noOfPanelsRequired: "64 Nos",
      },
    ],
  });

  // -------------------------------
  // SOLAR STREET LIGHT (ALL IN ONE - ALUMINIUM BODY)
  // -------------------------------
  await prisma.solarStreetLightAllInOneCatalog.createMany({
    data: [
      {
        brand: "SOLARICA",
        description:
          "Solarica make 9 watt all in one Solar Street Light Aluminium casting with Lithium ion life P04 battery of 9 Ah and inbuilt Solar panel of 40 watt with 5 years warranty",
        basePrice: 5700,
        gst: 684,
        totalAmount: 6384,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 12-14 watt all in one Aluminium casting Solar Street Light with Lithium ion life P04 battery of 12 Ah and inbuilt Solar panel of 40 watt with 5 years warranty",
        basePrice: 6800,
        gst: 816,
        totalAmount: 7616,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 15-18 watt all in one Aluminium casting Solar Street Light with Lithium ion life P04 battery of 18 Ah and panel of 40 watt with 5 years warranty",
        basePrice: 7100,
        gst: 852,
        totalAmount: 7952,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 24 watt all in one Aluminium casting Solar Street Light with Lithium ion life P04 battery of 24 Ah and inbuilt Solar panel of 40 watt with 5 years warranty",
        basePrice: 8650,
        gst: 1038,
        totalAmount: 9688,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 30 watt all in one Aluminium casting Solar Street Light with Lithium ion life P04 battery of 30 Ah and inbuilt Solar panel of 60 watt with 5 years warranty",
        basePrice: 10450,
        gst: 1254,
        totalAmount: 11704,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 40 watt all in one Aluminium casting Solar Street Light with Lithium ion life P04 battery of 36 Ah and inbuilt Solar panel of 60 watt with 5 years warranty",
        basePrice: 11050,
        gst: 1326,
        totalAmount: 12376,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 60 watt all in one Aluminium casting (Slim Model) Solar Street Light with Lithium ion life P04 battery of 54 Ah and inbuilt Solar panel of 100 watt with 5 years warranty",
        basePrice: 17900,
        gst: 2148,
        totalAmount: 20048,
      },
      {
        brand: "SOLARICA",
        description:
          "Solarica make 100 watt all in one Aluminium casting Solar Street Light with Lithium ion life P04 battery of 80-100 Ah and inbuilt Solar panel of 150 watt with 5 years warranty",
        basePrice: 24500,
        gst: 2940,
        totalAmount: 27440,
      },
    ],
  });

  console.log('✅ Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
