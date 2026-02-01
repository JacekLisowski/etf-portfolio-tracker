import Head from 'next/head'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, isAuthenticated, isLoading, isPremium } = useAuth()

  return (
    <>
      <Head>
        <title>ETF Portfolio Tracker</title>
        <meta name="description" content="Portfolio tracker for Polish ETF investors" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" mb={4}>
              ETF Portfolio Tracker
            </Heading>
            <Text fontSize="xl" color="gray.500">
              Aplikacja dla polskich inwestorów w ETF
            </Text>
          </Box>

          <Card>
            <CardHeader>
              <Heading size="md">Status inicjalizacji</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Text>✅ Next.js 16.x z Pages Router</Text>
                <Text>✅ TypeScript skonfigurowany</Text>
                <Text>✅ Chakra UI zainstalowany</Text>
                <Text>✅ Dark mode: {colorMode === 'dark' ? 'Ciemny' : 'Jasny'}</Text>
                <Text>✅ Prisma 7.x ORM</Text>
                <Text>✅ NextAuth.js + Magic Link</Text>
                <Text>
                  {isAuthenticated ? '✅' : '⏳'} Autentykacja:{' '}
                  {isLoading ? (
                    'Ładowanie...'
                  ) : isAuthenticated ? (
                    <>
                      Zalogowany jako {user?.email}{' '}
                      <Badge colorScheme={isPremium ? 'purple' : 'gray'}>{user?.tier}</Badge>
                    </>
                  ) : (
                    'Niezalogowany'
                  )}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <HStack spacing={4} justify="center">
            <Button onClick={toggleColorMode} variant="outline" size="lg">
              Przełącz na {colorMode === 'light' ? 'ciemny' : 'jasny'} motyw
            </Button>

            {isAuthenticated ? (
              <Button onClick={() => signOut()} colorScheme="red" size="lg">
                Wyloguj
              </Button>
            ) : (
              <Link href="/auth/signin">
                <Button colorScheme="brand" size="lg">
                  Zaloguj się
                </Button>
              </Link>
            )}
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
