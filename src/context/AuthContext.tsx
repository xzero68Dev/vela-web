'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type LineUser = {
  lineUserId:  string
  displayName: string
  pictureUrl?: string
  phone?:      string
  isNewUser?:  boolean
}

type AuthContextType = {
  user:      LineUser | null
  loading:   boolean
  login:     () => Promise<void>
  logout:    () => void
  savePhone: (phone: string) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: false,
  login: async () => {}, logout: () => {}, savePhone: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<LineUser | null>(null)
  const [loading, setLoading] = useState(false)

  // โหลด user จาก localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vela_user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
  }, [])

  const login = async () => {
    setLoading(true)
    try {
      const liff = (await import('@line/liff')).default
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2010290578-odw3e7nF' })

      if (!liff.isLoggedIn()) {
        liff.login()
        return
      }

      const profile = await liff.getProfile()
      const saved   = localStorage.getItem('vela_user')
      const existing = saved ? JSON.parse(saved) : null

      const newUser: LineUser = {
        lineUserId:  profile.userId,
        displayName: profile.displayName,
        pictureUrl:  profile.pictureUrl,
        phone:       existing?.lineUserId === profile.userId ? existing.phone : undefined,
        isNewUser:   !existing || existing.lineUserId !== profile.userId,
      }

      setUser(newUser)
      localStorage.setItem('vela_user', JSON.stringify(newUser))
    } catch (e) {
      console.error('LINE login error:', e)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vela_user')
  }

  const savePhone = (phone: string) => {
    if (!user) return
    const updated = { ...user, phone, isNewUser: false }
    setUser(updated)
    localStorage.setItem('vela_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, savePhone }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
