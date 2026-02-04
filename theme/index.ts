import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { colors } from './colors'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    mono: `'JetBrains Mono', 'Fira Code', monospace`,
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        _dark: {
          bg: '#1A202C',
        },
      },
    },
  },
})

export default theme
