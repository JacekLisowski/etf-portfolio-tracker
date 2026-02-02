import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Skeleton,
} from '@chakra-ui/react'
import { LABELS } from '@/config/labels'

export interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalReturn: number
  dailyChange: number
  dailyChangePercent: number
  currency: string
}

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary | null
  isLoading?: boolean
}

export function PortfolioSummaryCards({
  summary,
  isLoading = false,
}: PortfolioSummaryCardsProps) {
  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={8}>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <Skeleton height="80px" />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  if (!summary) {
    return null
  }

  const {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalReturn,
    dailyChange,
    dailyChangePercent,
    currency,
  } = summary

  const isPositiveReturn = totalGainLoss >= 0
  const isPositiveDailyChange = dailyChange >= 0

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={8}>
      {/* Total Value */}
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>{LABELS.portfolio.totalValue}</StatLabel>
            <StatNumber>
              {LABELS.units.currency.format(totalValue, currency)}
            </StatNumber>
            <StatHelpText>&nbsp;</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Total Invested */}
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>{LABELS.portfolio.totalInvested}</StatLabel>
            <StatNumber>
              {LABELS.units.currency.format(totalInvested, currency)}
            </StatNumber>
            <StatHelpText>&nbsp;</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Total Gain/Loss */}
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>{LABELS.portfolio.totalGainLoss}</StatLabel>
            <StatNumber color={isPositiveReturn ? 'green.500' : 'red.500'}>
              {isPositiveReturn ? '+' : ''}
              {LABELS.units.currency.format(totalGainLoss, currency)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={isPositiveReturn ? 'increase' : 'decrease'} />
              {LABELS.units.percent.format(totalReturn)}
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Total Return % */}
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>{LABELS.portfolio.totalReturn}</StatLabel>
            <StatNumber color={isPositiveReturn ? 'green.500' : 'red.500'}>
              {isPositiveReturn ? '+' : ''}
              {LABELS.units.percent.format(totalReturn)}
            </StatNumber>
            <StatHelpText>&nbsp;</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Daily Change */}
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>{LABELS.portfolio.dailyChange}</StatLabel>
            <StatNumber
              color={isPositiveDailyChange ? 'green.500' : 'red.500'}
            >
              {isPositiveDailyChange ? '+' : ''}
              {LABELS.units.currency.format(dailyChange, currency)}
            </StatNumber>
            <StatHelpText>
              <StatArrow
                type={isPositiveDailyChange ? 'increase' : 'decrease'}
              />
              {LABELS.units.percent.format(dailyChangePercent)}
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  )
}
