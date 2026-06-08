import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('qiling_settings')
      return saved ? JSON.parse(saved) : {
        mode: 'cute',
        theme: 'dark',
        useTools: true,
        useMemory: true,
        streamResponse: true,
        soundEnabled: false,
        fontSize: 14
      }
    } catch {
      return { mode: 'cute', theme: 'dark', useTools: true, useMemory: true, streamResponse: true, soundEnabled: false, fontSize: 14 }
    }
  })

  useEffect(() => {
    localStorage.setItem('qiling_settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}