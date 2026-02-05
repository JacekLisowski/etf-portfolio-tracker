import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { LABELS } from '@/config/labels'
import { LABELS_EN } from '@/config/labels-en'

type Language = 'PL' | 'EN'

// Use a more flexible type that works for both label sets
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Labels = typeof LABELS | typeof LABELS_EN

interface LanguageContextValue {
  language: Language
  labels: Labels
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { data: session } = useSession()
  const [language, setLanguageState] = useState<Language>('PL')

  // Initialize language from session
  useEffect(() => {
    if (session?.user?.language) {
      setLanguageState(session.user.language as Language)
    }
  }, [session?.user?.language])

  const labels = useMemo(() => {
    return language === 'EN' ? LABELS_EN : LABELS
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const value = useMemo(() => ({
    language,
    labels,
    setLanguage,
  }), [language, labels])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper hook to get just labels (for components that don't need language changing)
export function useLabels() {
  const { labels } = useLanguage()
  return labels
}
