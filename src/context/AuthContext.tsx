'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type Customer = {
  id?:          number
  line_user_id: string
  display_name: string
  picture_url?: string
  phone?:       string
  name?:        string
  address?:     string
  province?:    string
  zip?:         string
}

type AuthContextType = {
  user:          Customer | null
  loading:       boolean
  login:         () => Promise<void>
  logout:        () => void
  updateProfile: (data: Partial<Customer>) => Promise<void>
  setUser:       (user: Customer | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: false,
  login: async () => {}, logout: () => {}, updateProfile: async () => {}, setUser: () => {},
})

async function upsertCustomer(data: Partial<Customer> & { line_user_id: string }) {
  const res = await fetch(
    `${SB_URL}/rest/v1/customers?line_user_id=eq.${data.line_user_id}&on_conflict=line_user_id`,
    {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    }
  )
  const result = await res.json()
  return Array.isArray(result) ? result[0] : result
}

async function fetchCustomer(lineUserId: string): Promise<Customer | null> {
  const res = await fetch(
    `${SB_URL}/rest/v1/customers?line_user_id=eq.${lineUserId}&limit=1`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
  )
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)

  // โหลด user จาก localStorage ตอนเริ่ม
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vela_user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
  }, [])

  // auto-login ถ้าเปิดอยู่ใน LINE browser และยังไม่ได้ login
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const saved = localStorage.getItem('vela_user')
        if (saved) return  // login แล้ว ไม่ต้องทำอะไร

        const liff = (await import('@line/liff')).default

        // รองรับทั้ง 3 LIFF ID ตามหน้าที่เปิด
        const LIFF_IDS: Record<string, string> = {
          '/account':     '2010290578-fIH4NUCe',
          '/leaderboard': '2010290578-QJ6pXszj',
        }
        const path = window.location.pathname
        const liffId = LIFF_IDS[path] || '2010290578-odw3e7nF'

        await liff.init({ liffId })

        // เฉพาะตอนอยู่ใน LINE browser เท่านั้น
        if (!liff.isInClient()) return

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }

        // login แล้ว ดึงโปรไฟล์
        setLoading(true)
        const profile = await liff.getProfile()
        let customer = await fetchCustomer(profile.userId)
        if (!customer) {
          customer = await upsertCustomer({
            line_user_id: profile.userId,
            display_name: profile.displayName,
            picture_url:  profile.pictureUrl,
          })
        }
        if (customer) {
          setUser(customer)
          localStorage.setItem('vela_user', JSON.stringify(customer))
        }
      } catch (e) {
        console.error('[auto-login]', e)
      } finally {
        setLoading(false)
      }
    }
    autoLogin()
  }, [])

  const login = async () => {
    setLoading(true)
    try {
      const liff = (await import('@line/liff')).default

      // ใช้ LIFF ID ที่ถูกต้องตาม path ปัจจุบัน
      const LIFF_IDS: Record<string, string> = {
        '/account':     '2010290578-fIH4NUCe',
        '/leaderboard': '2010290578-QJ6pXszj',
      }
      const path = window.location.pathname
      const liffId = LIFF_IDS[path] || '2010290578-odw3e7nF'

      await liff.init({ liffId })

      // ถ้าไม่ได้เปิดใน LINE browser → เปิด LINE OA แทน
      if (!liff.isInClient()) {
        window.open('https://line.me/R/ti/p/@301saklb', '_blank')
        setLoading(false)
        return
      }

      if (!liff.isLoggedIn()) {
        const returnUrl = window.location.href
        sessionStorage.setItem('vela_return_url', returnUrl)
        liff.login({ redirectUri: window.location.origin })
        return
      }

      const profile = await liff.getProfile()

      // ดึงข้อมูลจาก database ก่อน (อาจมีอยู่แล้ว)
      let customer = await fetchCustomer(profile.userId)

      if (!customer) {
        // สร้างใหม่
        customer = await upsertCustomer({
          line_user_id: profile.userId,
          display_name: profile.displayName,
          picture_url:  profile.pictureUrl,
        })
      } else {
        // อัพเดทชื่อและรูปล่าสุด
        customer = await upsertCustomer({
          line_user_id: profile.userId,
          display_name: profile.displayName,
          picture_url:  profile.pictureUrl,
        })
      }

      const userData: Customer = {
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url:  profile.pictureUrl,
        ...customer,
      }

      setUser(userData)
      localStorage.setItem('vela_user', JSON.stringify(userData))
      // redirect กลับหน้าเดิมถ้ามี
      const returnUrl = sessionStorage.getItem('vela_return_url')
      if (returnUrl && returnUrl !== window.location.href) {
        sessionStorage.removeItem('vela_return_url')
        window.location.href = returnUrl
      }
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

  const updateProfile = async (data: Partial<Customer>) => {
    if (!user) return
    try {
      const updated = await upsertCustomer({
        line_user_id: user.line_user_id,
        ...data,
      })
      const newUser = { ...user, ...updated }
      setUser(newUser)
      localStorage.setItem('vela_user', JSON.stringify(newUser))
    } catch (e) {
      console.error('update profile error:', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
