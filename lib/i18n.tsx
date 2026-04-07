'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'zh' | 'en'

const LanguageContext = createContext<{
  language: Language
  setLanguage: (l: Language) => void
}>({ language: 'zh', setLanguage: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('language') as Language
    if (saved === 'en' || saved === 'zh') setLanguage(saved)
  }, [])

  const handleSet = (l: Language) => {
    setLanguage(l)
    localStorage.setItem('language', l)
  }

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSet }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
