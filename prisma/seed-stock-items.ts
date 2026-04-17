import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding dummy stock items...')

  // 1. Get the first company
  const company = await prisma.company.findFirst({
        where: { isActive: true }
  })

  if (!company) {
    console.error('❌ No active company found. Please create a company first.')
    return
  }

  console.log(`🏢 Using Company: ${company.name} (${company.id})`)

  // 2. Ensure a "Nos" unit exists
  const unit = await prisma.unit.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Nos'
      }
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Nos',
      formalName: 'Numbers',
      decimalPlaces: 0,
      isSimple: true
    }
  })

  console.log(`📏 Using Unit: ${unit.name}`)

  // 3. Create dummy stock items
  const dummyItems = [
    { name: 'Solar Panel 400W', rate: 25000 },
    { name: 'Lithium Battery 100Ah', rate: 45000 },
    { name: 'On-Grid Inverter 5kW', rate: 35000 },
    { name: 'Solar Street Light 30W', rate: 8500 },
    { name: 'DC Wire 4sqmm (100m)', rate: 4200 },
    { name: 'MC4 Connectors (Pair)', rate: 150 },
    { name: 'Structure Rail 2m', rate: 1200 }
  ]

  for (const item of dummyItems) {
    await prisma.stockItem.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: item.name
        }
      },
      update: {
        standardRate: item.rate,
        currentBalance: 100 // Add some opening stock
      },
      create: {
        companyId: company.id,
        name: item.name,
        unitId: unit.id,
        standardRate: item.rate,
        openingBalance: 100,
        currentBalance: 100
      }
    })
    console.log(`📦 Created/Updated item: ${item.name}`)
  }

  console.log('✅ Dummy stock items seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
