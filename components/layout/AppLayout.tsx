import { ReactNode, Component, ErrorInfo } from 'react'
import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  IconButton,
  VStack,
  Text,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { useLabels } from '@/contexts/LanguageContext'

// ErrorBoundary component for catching React errors
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={20}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg">Coś poszło nie tak</Heading>
            <Text color="gray.500">
              Przepraszamy, wystąpił nieoczekiwany błąd.
            </Text>
            <Text fontSize="sm" color="gray.400">
              {this.state.error?.message}
            </Text>
            <Button
              colorScheme="brand"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Spróbuj ponownie
            </Button>
          </VStack>
        </Container>
      )
    }

    return this.props.children
  }
}

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const labels = useLabels()

  // Display name: prefer user's name, fallback to email
  const displayName = user?.name || user?.email || ''

  const navItems = [
    { label: labels.nav.home, href: '/' },
    { label: labels.nav.portfolio, href: '/portfolio' },
    { label: labels.nav.transactions, href: '/transactions' },
    { label: labels.nav.analytics, href: '/analytics' },
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <Box minH="100vh">
      {/* Navigation Bar */}
      <Box
        as="nav"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderBottom="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        px={4}
        py={3}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            {/* Logo */}
            <Link href="/">
              <Heading size="md" cursor="pointer">
                {labels.appName}
              </Heading>
            </Link>

            {/* Navigation Links */}
            {isAuthenticated && (
              <HStack spacing={4}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? 'solid' : 'ghost'}
                      colorScheme={isActive(item.href) ? 'blue' : 'gray'}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </HStack>
            )}

            {/* Right Side: Theme Toggle + User Menu */}
            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
              />

              {isAuthenticated && user ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    cursor="pointer"
                    minW={0}
                  >
                    <Avatar size="sm" name={displayName || undefined} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem isDisabled>
                      <Box>
                        <Box fontWeight="semibold">{displayName}</Box>
                        <Box fontSize="xs" color="gray.500">
                          {user.email} - {user.tier}
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuDivider />
                    <Link href="/settings">
                      <MenuItem>{labels.nav.settings}</MenuItem>
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin">
                        <MenuItem>{labels.nav.admin}</MenuItem>
                      </Link>
                    )}
                    <MenuDivider />
                    <MenuItem
                      onClick={() => signOut({ callbackUrl: '/auth/signin?logout=true' })}
                      color="red.500"
                    >
                      {labels.nav.logout}
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Link href="/auth/signin">
                  <Button colorScheme="blue">Zaloguj się</Button>
                </Link>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content with ErrorBoundary */}
      <ErrorBoundary>
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </ErrorBoundary>
    </Box>
  )
}
