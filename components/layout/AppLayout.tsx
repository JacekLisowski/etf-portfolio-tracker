import { ReactNode } from 'react'
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
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { LABELS } from '@/config/labels'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const navItems = [
    { label: LABELS.nav.home, href: '/' },
    { label: LABELS.nav.portfolio, href: '/portfolio' },
    { label: LABELS.nav.transactions, href: '/transactions' },
    { label: LABELS.nav.analytics, href: '/analytics' },
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
                {LABELS.appName}
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
                    <Avatar size="sm" name={user.email || undefined} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem isDisabled>
                      <Box>
                        <Box fontWeight="semibold">{user.email}</Box>
                        <Box fontSize="xs" color="gray.500">
                          {user.tier}
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuDivider />
                    <Link href="/settings">
                      <MenuItem>{LABELS.nav.settings}</MenuItem>
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin">
                        <MenuItem>{LABELS.nav.admin}</MenuItem>
                      </Link>
                    )}
                    <MenuDivider />
                    <MenuItem onClick={() => signOut()} color="red.500">
                      {LABELS.nav.logout}
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

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  )
}
