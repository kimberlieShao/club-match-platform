'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'zh' | 'en'
const LanguageContext = createContext<{language: Language, setLanguage: (l: Language) => void}>({language: 'zh', setLanguage: () => {}})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved) setLanguage(saved)
  }, [])
  const handleSet = (l: Language) => {
    setLanguage(l)
    localStorage.setItem('language', l)
  }
  return <LanguageContext.Provider value={{language, setLanguage: handleSet}}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
