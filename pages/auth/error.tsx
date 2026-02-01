import { useRouter } from 'next/router'
import { Box, Button, Container, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'

const errorMessages: Record<string, string> = {
  Configuration: 'Wystąpił problem z konfiguracją serwera.',
  AccessDenied: 'Nie masz dostępu do tej strony.',
  Verification: 'Link wygasł lub został już użyty. Spróbuj zalogować się ponownie.',
  Default: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
}

export default function ErrorPage() {
  const router = useRouter()
  const { error } = router.query

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const errorMessage = errorMessages[(error as string) || 'Default'] || errorMessages.Default

  return (
    <>
      <Head>
        <title>Błąd logowania - ETF Portfolio Tracker</title>
      </Head>
      <Box minH="100vh" bg={bgColor} py={20}>
        <Container maxW="md">
          <VStack spacing={8}>
            <Box w="full" bg={cardBg} p={8} borderRadius="lg" shadow="md" textAlign="center">
              <VStack spacing={6}>
                <Text fontSize="6xl">⚠️</Text>
                <Heading size="lg">Problem z logowaniem</Heading>
                <Text color="gray.500">{errorMessage}</Text>
                <Link href="/auth/signin" passHref>
                  <Button colorScheme="brand" size="lg">
                    Spróbuj ponownie
                  </Button>
                </Link>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
