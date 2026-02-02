import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Badge,
  Tooltip,
  IconButton,
  Skeleton,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { LABELS } from '@/config/labels'

export interface Holding {
  id: string
  symbol: string
  name: string
  isin: string
  isinTemporary: boolean
  exchange: string
  quantity: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
  allocation: number
  currency: string
  lastUpdate: Date
}

interface HoldingsTableProps {
  holdings: Holding[]
  isLoading?: boolean
  onRowClick?: (holding: Holding) => void
}

export function HoldingsTable({
  holdings,
  isLoading = false,
  onRowClick,
}: HoldingsTableProps) {
  if (isLoading) {
    return (
      <Box>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="60px" mb={2} />
        ))}
      </Box>
    )
  }

  if (holdings.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          {LABELS.portfolio.noHoldings}
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          {LABELS.portfolio.noHoldingsDescription}
        </Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>{LABELS.portfolio.table.symbol}</Th>
            <Th>{LABELS.portfolio.table.name}</Th>
            <Th>{LABELS.portfolio.table.exchange}</Th>
            <Th isNumeric>{LABELS.portfolio.table.quantity}</Th>
            <Th isNumeric>{LABELS.portfolio.table.avgPrice}</Th>
            <Th isNumeric>{LABELS.portfolio.table.currentPrice}</Th>
            <Th isNumeric>{LABELS.portfolio.table.marketValue}</Th>
            <Th isNumeric>{LABELS.portfolio.table.totalCost}</Th>
            <Th isNumeric>{LABELS.portfolio.table.gainLoss}</Th>
            <Th isNumeric>{LABELS.portfolio.table.allocation}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {holdings.map((holding) => {
            const isPositive = holding.gainLoss >= 0
            const exchangeName =
              LABELS.exchange[holding.exchange as keyof typeof LABELS.exchange] ||
              holding.exchange

            return (
              <Tr
                key={holding.id}
                cursor={onRowClick ? 'pointer' : 'default'}
                onClick={() => onRowClick?.(holding)}
                _hover={{ bg: 'gray.50' }}
              >
                {/* Symbol */}
                <Td>
                  <Box>
                    <Text fontWeight="bold">{holding.symbol}</Text>
                    {holding.isinTemporary && (
                      <Tooltip label={LABELS.etf.temporaryIsinTooltip}>
                        <Badge colorScheme="orange" fontSize="xs">
                          {LABELS.etf.temporaryIsin}
                        </Badge>
                      </Tooltip>
                    )}
                  </Box>
                </Td>

                {/* Name */}
                <Td>
                  <Text fontSize="sm" noOfLines={2}>
                    {holding.name}
                  </Text>
                </Td>

                {/* Exchange */}
                <Td>
                  <Text fontSize="sm">{exchangeName}</Text>
                </Td>

                {/* Quantity */}
                <Td isNumeric>
                  <Text>{LABELS.units.number.format(holding.quantity)}</Text>
                </Td>

                {/* Avg Price */}
                <Td isNumeric>
                  <Text>
                    {LABELS.units.currency.format(
                      holding.avgPrice,
                      holding.currency
                    )}
                  </Text>
                </Td>

                {/* Current Price */}
                <Td isNumeric>
                  <Text>
                    {LABELS.units.currency.format(
                      holding.currentPrice,
                      holding.currency
                    )}
                  </Text>
                </Td>

                {/* Market Value */}
                <Td isNumeric>
                  <Text fontWeight="semibold">
                    {LABELS.units.currency.format(
                      holding.marketValue,
                      holding.currency
                    )}
                  </Text>
                </Td>

                {/* Total Cost */}
                <Td isNumeric>
                  <Text>
                    {LABELS.units.currency.format(
                      holding.totalCost,
                      holding.currency
                    )}
                  </Text>
                </Td>

                {/* Gain/Loss */}
                <Td isNumeric>
                  <Box>
                    <Text
                      color={isPositive ? 'green.500' : 'red.500'}
                      fontWeight="semibold"
                    >
                      {isPositive ? '+' : ''}
                      {LABELS.units.currency.format(
                        holding.gainLoss,
                        holding.currency
                      )}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={isPositive ? 'green.500' : 'red.500'}
                    >
                      ({isPositive ? '+' : ''}
                      {LABELS.units.percent.format(holding.gainLossPercent)})
                    </Text>
                  </Box>
                </Td>

                {/* Allocation */}
                <Td isNumeric>
                  <Text>{LABELS.units.percent.format(holding.allocation)}</Text>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Box>
  )
}
