import { Box, Container, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import Head from 'next/head'

export default function VerifyRequest() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <>
      <Head>
        <title>Sprawdź email - ETF Portfolio Tracker</title>
      </Head>
      <Box minH="100vh" bg={bgColor} py={20}>
        <Container maxW="md">
          <VStack spacing={8}>
            <Box w="full" bg={cardBg} p={8} borderRadius="lg" shadow="md" textAlign="center">
              <VStack spacing={4}>
                <Text fontSize="6xl">📧</Text>
                <Heading size="lg">Sprawdź swoją skrzynkę email</Heading>
                <Text color="gray.500">Wysłaliśmy Ci link do logowania na podany adres email.</Text>
                <Text fontSize="sm" color="gray.400" mt={4}>
                  Link jest ważny przez 24 godziny.
                  <br />
                  <strong>Tryb deweloperski:</strong> Sprawdź konsolę serwera - link pojawi się tam.
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
