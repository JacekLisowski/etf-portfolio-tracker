import { signIn } from 'next-auth/react'
import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import Head from 'next/head'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        setError('Wystąpił błąd. Spróbuj ponownie.')
        setIsLoading(false)
      } else {
        // Redirect to verify-request page
        window.location.href = '/auth/verify-request'
      }
    } catch (err) {
      setError('Wystąpił nieoczekiwany błąd.')
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Zaloguj się - ETF Portfolio Tracker</title>
      </Head>
      <Box minH="100vh" bg={bgColor} py={20}>
        <Container maxW="md">
          <VStack spacing={8}>
            <VStack spacing={2}>
              <Heading size="xl">ETF Portfolio Tracker</Heading>
              <Text color="gray.500">Zaloguj się aby kontynuować</Text>
            </VStack>

            <Box w="full" bg={cardBg} p={8} borderRadius="lg" shadow="md">
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Adres email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="twoj.email@example.com"
                      size="lg"
                      autoFocus
                    />
                  </FormControl>

                  {error && (
                    <Alert status="error">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Wyślij link do logowania
                  </Button>

                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Wyślemy Ci email z linkiem do logowania.
                    <br />W trybie deweloperskim link pojawi się w konsoli.
                  </Text>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
