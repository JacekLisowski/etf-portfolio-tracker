import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  Badge,
  Spinner,
  InputGroup,
  InputLeftElement,
  useOutsideClick,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { LABELS } from '@/config/labels'

export interface EtfOption {
  id: string
  symbol: string
  name: string
  isin: string
  isinTemporary: boolean
  exchange: string
  exchangeName: string
}

interface EtfSearchInputProps {
  value?: EtfOption | null
  onChange: (etf: EtfOption | null) => void
  placeholder?: string
  isDisabled?: boolean
}

export function EtfSearchInput({
  value,
  onChange,
  placeholder,
  isDisabled = false,
}: EtfSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EtfOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  })

  // Debounced search function
  const searchEtfs = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/etf/search?q=${encodeURIComponent(searchQuery)}`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.etfs || [])
    } catch (error) {
      console.error('ETF search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    // Debounce search with 300ms delay
    const timeoutId = setTimeout(() => {
      searchEtfs(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchEtfs])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setIsOpen(true)

    if (!newQuery) {
      onChange(null)
    }
  }

  const handleSelect = (etf: EtfOption) => {
    setQuery(`${etf.symbol} - ${etf.name}`)
    onChange(etf)
    setIsOpen(false)
  }

  const handleFocus = () => {
    if (results.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <Box position="relative" ref={containerRef}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || LABELS.etf.searchPlaceholder}
          isDisabled={isDisabled}
        />
      </InputGroup>

      {isOpen && (query.length >= 2) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
          zIndex={1000}
        >
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Spinner size="sm" mr={2} />
              <Text display="inline">{LABELS.actions.loading}</Text>
            </Box>
          ) : results.length > 0 ? (
            <List>
              {results.map((etf) => (
                <ListItem
                  key={etf.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleSelect(etf)}
                  borderBottom="1px"
                  borderColor="gray.100"
                  _last={{ borderBottom: 'none' }}
                >
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Text fontWeight="bold" mr={2}>
                        {etf.symbol}
                      </Text>
                      {etf.isinTemporary && (
                        <Badge colorScheme="orange" fontSize="xs">
                          {LABELS.etf.temporaryIsin}
                        </Badge>
                      )}
                    </Box>
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                      {etf.name}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      {etf.exchangeName} • {etf.isin}
                    </Text>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={4} textAlign="center">
              <Text color="gray.500">{LABELS.etf.noResults}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
