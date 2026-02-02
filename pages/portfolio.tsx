import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  PortfolioSummaryCards,
  HoldingsTable,
  AddTransactionModal,
  PortfolioSummary,
  Holding,
} from '@/components/portfolio'
import { LABELS } from '@/config/labels'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'

export default function PortfolioPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch portfolio data
  const fetchPortfolioData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get or create default portfolio
      const portfolioResponse = await fetch('/api/portfolio')
      if (!portfolioResponse.ok) {
        throw new Error('Failed to fetch portfolio')
      }
      const portfolioData = await portfolioResponse.json()
      const pId = portfolioData.portfolio?.id

      if (!pId) {
        throw new Error('Portfolio ID not found')
      }

      setPortfolioId(pId)

      // Fetch holdings
      const holdingsResponse = await fetch(`/api/portfolio/${pId}/holdings`)
      if (!holdingsResponse.ok) {
        throw new Error('Failed to fetch holdings')
      }
      const holdingsData = await holdingsResponse.json()

      // Transform holdings data
      const transformedHoldings: Holding[] = holdingsData.holdings.map((h: any) => ({
        id: h.id,
        symbol: h.etf?.ticker || h.isin,
        name: h.instrument.name,
        isin: h.instrument.isin,
        isinTemporary: h.instrument.isinTemporary,
        exchange: h.etf?.exchangeId || '',
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice: h.currentPrice || h.avgPrice,
        marketValue: h.marketValue,
        totalCost: h.totalCost,
        gainLoss: h.gainLoss,
        gainLossPercent: h.gainLossPercent,
        allocation: h.allocation,
        currency: h.currency,
        lastUpdate: new Date(h.lastUpdate),
      }))

      setHoldings(transformedHoldings)

      // Calculate summary
      const totalValue = transformedHoldings.reduce((sum, h) => sum + h.marketValue, 0)
      const totalCost = transformedHoldings.reduce((sum, h) => sum + h.totalCost, 0)
      const totalGainLoss = totalValue - totalCost
      const totalReturn = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

      setSummary({
        totalValue,
        totalInvested: totalCost,
        totalGainLoss,
        totalReturn,
        dailyChange: 0, // TODO: Calculate from price changes
        dailyChangePercent: 0,
        currency: 'EUR', // TODO: Get from user preferences
      })
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast({
        title: LABELS.errors.general,
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioData()
    }
  }, [isAuthenticated])

  const handleTransactionSuccess = () => {
    fetchPortfolioData()
    toast({
      title: LABELS.success.transactionCreated,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  if (authLoading) {
    return (
      <AppLayout>
        <Skeleton height="400px" />
      </AppLayout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>{LABELS.portfolio.title} | {LABELS.appName}</title>
        <meta name="description" content="Manage your ETF portfolio" />
      </Head>

      <AppLayout>
        <Box>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={6}
          >
            <Heading size="xl">{LABELS.portfolio.title}</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
              isDisabled={!portfolioId}
            >
              {LABELS.portfolio.addTransaction}
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              <AlertTitle>{LABELS.errors.general}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <PortfolioSummaryCards summary={summary} isLoading={isLoading} />

          {/* Holdings Table */}
          <Box>
            <Heading size="md" mb={4}>
              {LABELS.portfolio.holdings}
            </Heading>
            <HoldingsTable holdings={holdings} isLoading={isLoading} />
          </Box>

          {/* Add Transaction Modal */}
          {portfolioId && (
            <AddTransactionModal
              isOpen={isOpen}
              onClose={onClose}
              onSuccess={handleTransactionSuccess}
              portfolioId={portfolioId}
            />
          )}
        </Box>
      </AppLayout>
    </>
  )
}
