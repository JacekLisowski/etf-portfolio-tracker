import { prisma } from '../lib/prisma'
import { createTransaction, getUserTransactions } from '../lib/services/transaction'
import { getUserPortfolio } from '../lib/services/portfolio'
import { searchEtfs } from '../lib/services/etf'

async function main() {
  console.log('🧪 Testowanie API ETF Portfolio Tracker\n')

  // 1. Utwórz test usera
  console.log('1️⃣ Tworzenie test usera...')
  let testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  })

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tier: 'FREE',
      },
    })
    console.log('✅ Test user utworzony:', testUser.email)
  } else {
    console.log('✅ Test user już istnieje:', testUser.email)
  }

  // 2. Test wyszukiwania ETF (pusta baza na start)
  console.log('\n2️⃣ Test wyszukiwania ETF...')
  const etfSearch = await searchEtfs({ search: 'VWCE', exchangeId: 'clx001xetr' })
  console.log('✅ Znaleziono ETF:', etfSearch.total)

  // 3. Test dodawania pierwszej transakcji (utworzy portfolio + ETF)
  console.log('\n3️⃣ Test dodawania transakcji...')
  try {
    const transaction = await createTransaction(testUser.id, {
      etf: {
        isin: 'IE00BK5BQT80',
        exchangeId: 'clx001xetr',
        ticker: 'VWCE',
        instrumentName: 'Vanguard FTSE All-World UCITS ETF',
        tradingCurrency: 'EUR',
      },
      type: 'BUY',
      date: new Date().toISOString(),
      quantity: 10,
      pricePerUnit: 105.50,
      currency: 'EUR',
      fees: 2.50,
      notes: 'Test zakupu przez API',
    })
    console.log('✅ Transakcja utworzona:')
    console.log('   - ID:', transaction.id)
    console.log('   - Typ:', transaction.type)
    console.log('   - ETF:', transaction.etf?.ticker, '@', transaction.etf?.exchange?.mic)
    console.log('   - Ilość:', transaction.quantity)
    console.log('   - Wartość:', transaction.totalAmount, transaction.currency)
  } catch (error: any) {
    console.log('❌ Błąd:', error.message)
  }

  // 4. Test pobierania transakcji
  console.log('\n4️⃣ Test pobierania transakcji...')
  const { transactions, total } = await getUserTransactions(testUser.id)
  console.log('✅ Liczba transakcji:', total)
  if (transactions.length > 0) {
    console.log('   Ostatnia transakcja:')
    console.log('   -', transactions[0].type, transactions[0].quantity, 'x', transactions[0].etf?.ticker)
  }

  // 5. Test pobierania portfolio
  console.log('\n5️⃣ Test pobierania portfolio...')
  const portfolio = await getUserPortfolio(testUser.id)
  if (portfolio) {
    console.log('✅ Portfolio:', portfolio.name)
    console.log('   - ID:', portfolio.id)
    console.log('   - Liczba transakcji:', portfolio.transactions?.length || 0)
  }

  // 6. Test dodania drugiej transakcji (ten sam ETF)
  console.log('\n6️⃣ Test dodawania drugiej transakcji (istniejący ETF)...')
  try {
    const etf = await prisma.etf.findFirst({
      where: { ticker: 'VWCE' },
    })

    if (etf) {
      const transaction2 = await createTransaction(testUser.id, {
        etfId: etf.id,
        type: 'BUY',
        date: new Date(Date.now() + 86400000).toISOString(), // +1 dzień
        quantity: 5,
        pricePerUnit: 106.00,
        currency: 'EUR',
        fees: 1.50,
      })
      console.log('✅ Druga transakcja utworzona:')
      console.log('   - Ilość:', transaction2.quantity)
      console.log('   - Wartość:', transaction2.totalAmount, transaction2.currency)
    }
  } catch (error: any) {
    console.log('❌ Błąd:', error.message)
  }

  // 7. Podsumowanie
  console.log('\n📊 Podsumowanie testów:')
  const finalPortfolio = await getUserPortfolio(testUser.id)
  if (finalPortfolio) {
    console.log('✅ Portfolio:', finalPortfolio.name)
    console.log('✅ Liczba transakcji:', finalPortfolio.transactions?.length || 0)

    const totalValue = finalPortfolio.transactions?.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    ) || 0
    console.log('✅ Suma wartości transakcji:', totalValue.toFixed(2), 'EUR')
  }

  // 8. Sprawdź czy ETF został utworzony
  const etfs = await searchEtfs({ search: 'VWCE' })
  console.log('✅ ETF w bazie:', etfs.total)
  if (etfs.etfs.length > 0) {
    console.log('   -', etfs.etfs[0].ticker, '|', etfs.etfs[0].isin, '|', etfs.etfs[0].exchange?.mic)
  }

  console.log('\n✅ Wszystkie testy zakończone!')
}

main()
  .catch((error) => {
    console.error('❌ Błąd krytyczny:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
