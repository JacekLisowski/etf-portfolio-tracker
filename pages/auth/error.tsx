import { useRouter } from 'next/router'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
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
import Link from 'next/link'

const errorMessages: Record<string, { title: string; message: string; showResend: boolean }> = {
  Configuration: {
    title: 'Błąd konfiguracji',
    message: 'Wystąpił problem z konfiguracją serwera.',
    showResend: false,
  },
  AccessDenied: {
    title: 'Brak dostępu',
    message: 'Nie masz dostępu do tej strony.',
    showResend: false,
  },
  Verification: {
    title: 'Link wygasł',
    message: 'Link wygasł. Poproś o nowy.',
    showResend: true,
  },
  Default: {
    title: 'Błąd',
    message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    showResend: false,
  },
}

export default function ErrorPage() {
  const router = useRouter()
  const { error } = router.query

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  const errorConfig = errorMessages[(error as string) || 'Default'] || errorMessages.Default

  const handleResendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setResendError(null)
    setResendSuccess(false)
    setIsLoading(true)

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        if (result.error === 'RATE_LIMITED') {
          setResendError('Zbyt wiele prób. Poczekaj 5 minut.')
        } else {
          setResendError('Wystąpił błąd. Spróbuj ponownie.')
        }
      } else {
        setResendSuccess(true)
      }
    } catch {
      setResendError('Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsLoading(false)
    }
  }

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
                <Heading size="lg">{errorConfig.title}</Heading>
                <Text color="gray.500">{errorConfig.message}</Text>

                {errorConfig.showResend && !resendSuccess && (
                  <Box w="full" pt={4}>
                    <form onSubmit={handleResendMagicLink}>
                      <VStack spacing={4}>
                        <FormControl>
                          <FormLabel textAlign="center">Podaj email aby otrzymać nowy link</FormLabel>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="twoj.email@example.com"
                            size="lg"
                            required
                          />
                        </FormControl>

                        {resendError && (
                          <Alert status="error">
                            <AlertIcon />
                            {resendError}
                          </Alert>
                        )}

                        <Button
                          type="submit"
                          colorScheme="brand"
                          size="lg"
                          w="full"
                          isLoading={isLoading}
                        >
                          Wyślij nowy link
                        </Button>
                      </VStack>
                    </form>
                  </Box>
                )}

                {resendSuccess && (
                  <Alert status="success">
                    <AlertIcon />
                    Nowy link został wysłany! Sprawdź swoją skrzynkę email.
                  </Alert>
                )}

                {!errorConfig.showResend && (
                  <Link href="/auth/signin" passHref legacyBehavior>
                    <Button as="a" colorScheme="brand" size="lg">
                      Spróbuj ponownie
                    </Button>
                  </Link>
                )}
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  )
}
