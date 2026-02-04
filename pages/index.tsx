import Head from 'next/head'
import {
  Box,
  Heading,
  Text,
  VStack,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  SkeletonText,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/middleware/withAuthPage'
import { LABELS } from '@/config/labels'

export default function Dashboard() {
  const { user, isLoading, isPremium, isAdmin } = useAuth()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Show skeleton while loading session on client
  if (isLoading) {
    return (
      <AppLayout>
        <Head>
          <title>Dashboard - ETF Portfolio Tracker</title>
        </Head>
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="300px" />
          <SkeletonText mt="4" noOfLines={2} spacing="4" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="120px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        </VStack>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Head>
        <title>Dashboard - ETF Portfolio Tracker</title>
        <meta name="description" content="Twoje portfolio ETF w jednym miejscu" />
      </Head>

      <VStack spacing={8} align="stretch">
        {/* Welcome Section */}
        <Box>
          <Heading size="lg" mb={2}>
            {LABELS.dashboard.welcome}, {user?.email?.split('@')[0] || LABELS.dashboard.welcomeFallback}!
          </Heading>
          <HStack spacing={2}>
            <Text color="gray.500">{LABELS.dashboard.loggedInAs} {user?.email}</Text>
            <Badge colorScheme={isPremium ? 'purple' : 'gray'}>
              {user?.tier || 'FREE'}
            </Badge>
            {isAdmin && (
              <Badge colorScheme="red">ADMIN</Badge>
            )}
          </HStack>
        </Box>

        {/* Portfolio Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>{LABELS.dashboard.portfolioValue}</StatLabel>
                <StatNumber>{LABELS.units.currency.format(0, 'PLN')}</StatNumber>
                <StatHelpText>{LABELS.dashboard.noData}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>{LABELS.dashboard.gainLoss}</StatLabel>
                <StatNumber>{LABELS.units.currency.format(0, 'PLN')}</StatNumber>
                <StatHelpText>{LABELS.units.percent.format(0)}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>{LABELS.dashboard.positionsCount}</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>{LABELS.dashboard.etfsUnit}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Placeholder for Portfolio Content */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">{LABELS.dashboard.yourPortfolio}</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} py={8}>
              <Text color="gray.500" textAlign="center">
                {LABELS.dashboard.noPositions}
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                {LABELS.dashboard.noPositionsHint}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </AppLayout>
  )
}

// Server-side authentication - redirects to signin if not logged in
export const getServerSideProps = requireAuth
