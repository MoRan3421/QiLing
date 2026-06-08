import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('qiling_api_key'))
  const [tier, setTier] = useState('free')

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('qiling_api_key', apiKey)
    } else {
      localStorage.removeItem('qiling_api_key')
    }
  }, [apiKey])

  const login = (key) => {
    setApiKey(key)
    setUser({ apiKey: key })
  }

  const logout = () => {
    setApiKey(null)
    setUser(null)
    setTier('free')
  }

  return (
    <AuthContext.Provider value={{ user, apiKey, tier, setTier, login, logout, isLoggedIn: !!apiKey }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}