import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)

  const testUser = await prisma.user.upsert({
    where: { email: 'test@wealthvue.com' },
    update: {},
    create: {
      email: 'test@wealthvue.com',
      name: 'Test User',
      passwordHash: hashedPassword,
      linkStatus: 'NONE',
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create sample categories
  const categories = [
    { name: 'Groceries', color: '#22c55e', icon: '🛒' },
    { name: 'Restaurants', color: '#ef4444', icon: '🍽️' },
    { name: 'Transportation', color: '#3b82f6', icon: '🚗' },
    { name: 'Entertainment', color: '#a855f7', icon: '🎬' },
    { name: 'Shopping', color: '#ec4899', icon: '🛍️' },
    { name: 'Utilities', color: '#f59e0b', icon: '⚡' },
    { name: 'Healthcare', color: '#06b6d4', icon: '🏥' },
    { name: 'Income', color: '#10b981', icon: '💰' },
    { name: 'Transfers', color: '#94a3b8', icon: '🔁' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: testUser.id,
          name: cat.name,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        carryOver: false,
      },
    })
  }

  console.log(`✅ Created ${categories.length} sample categories`)

  // Create a sample bank account
  const account = await prisma.account.create({
    data: {
      userId: testUser.id,
      name: 'Chase Checking',
      type: 'CHECKING',
      currentBalance: 5000.0,
      availableBalance: 5000.0,
      isActive: true,
    },
  })

  console.log('✅ Created sample bank account')

  // Create sample transactions
  const groceryCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: 'Groceries' },
  })

  if (groceryCategory) {
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        date: new Date('2024-01-10'),
        description: 'Whole Foods Market',
        merchant: 'Whole Foods',
        amount: -125.5,
        categoryId: groceryCategory.id,
        source: 'MANUAL',
        pending: false,
      },
    })

    await prisma.transaction.create({
      data: {
        accountId: account.id,
        date: new Date('2024-01-12'),
        description: 'Trader Joes',
        merchant: 'Trader Joes',
        amount: -87.32,
        categoryId: groceryCategory.id,
        source: 'MANUAL',
        pending: false,
      },
    })

    console.log('✅ Created sample transactions')
  }

  // Create investment account
  const investmentAccount = await prisma.investmentAccount.create({
    data: {
      userId: testUser.id,
      name: 'Vanguard Brokerage',
      type: 'BROKERAGE',
      taxAdvantaged: false,
    },
  })

  console.log('✅ Created investment account')

  // Create sample investments
  await prisma.investment.create({
    data: {
      accountId: investmentAccount.id,
      assetClass: 'STOCK',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      costBasis: 1500.0,
      purchaseDate: new Date('2023-06-01'),
      currentPrice: 185.0,
      lastPriceUpdate: new Date(),
      manualPrice: false,
    },
  })

  await prisma.investment.create({
    data: {
      accountId: investmentAccount.id,
      assetClass: 'ETF',
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      quantity: 50,
      costBasis: 10000.0,
      purchaseDate: new Date('2023-01-15'),
      currentPrice: 225.0,
      lastPriceUpdate: new Date(),
      manualPrice: false,
    },
  })

  console.log('✅ Created sample investments')

  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('Test user credentials:')
  console.log('  Email: test@wealthvue.com')
  console.log('  Password: password123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
