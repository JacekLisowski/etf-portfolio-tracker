import { signIn } from 'next-auth/react'
import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
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
  Link as ChakraLink,
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!consent) {
      setError('Musisz zaakceptować regulamin i politykę prywatności.')
      return
    }

    setIsLoading(true)

    try {
      // Check if email already exists
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (checkResponse.status === 409) {
        setError('Ten email jest już zarejestrowany. Zaloguj się.')
        setIsLoading(false)
        return
      }

      if (!checkResponse.ok) {
        setError('Wystąpił błąd. Spróbuj ponownie.')
        setIsLoading(false)
        return
      }

      // Send Magic Link
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        if (result.error === 'RATE_LIMITED') {
          setError('Zbyt wiele prób. Poczekaj 5 minut.')
        } else {
          setError('Wystąpił błąd. Spróbuj ponownie.')
        }
        setIsLoading(false)
      } else {
        // Redirect to verify-request page
        window.location.href = '/auth/verify-request'
      }
    } catch {
      setError('Wystąpił nieoczekiwany błąd.')
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Zarejestruj się - ETF Portfolio Tracker</title>
      </Head>
      <Box minH="100vh" bg={bgColor} py={20}>
        <Container maxW="md">
          <VStack spacing={8}>
            <VStack spacing={2}>
              <Heading size="xl">ETF Portfolio Tracker</Heading>
              <Text color="gray.500">Utwórz konto aby rozpocząć</Text>
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

                  <FormControl isRequired>
                    <Checkbox
                      isChecked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      colorScheme="brand"
                    >
                      <Text fontSize="sm">
                        Akceptuję{' '}
                        <ChakraLink color="brand.500" href="/regulamin" isExternal>
                          regulamin
                        </ChakraLink>{' '}
                        i{' '}
                        <ChakraLink color="brand.500" href="/prywatnosc" isExternal>
                          politykę prywatności
                        </ChakraLink>
                      </Text>
                    </Checkbox>
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
                    Zarejestruj się
                  </Button>

                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Wyślemy Ci email z linkiem do aktywacji konta.
                    <br />W trybie deweloperskim link pojawi się w konsoli.
                  </Text>

                  <Text fontSize="sm" textAlign="center">
                    Masz już konto?{' '}
                    <Link href="/auth/signin" passHref legacyBehavior>
                      <ChakraLink color="brand.500">Zaloguj się</ChakraLink>
                    </Link>
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
