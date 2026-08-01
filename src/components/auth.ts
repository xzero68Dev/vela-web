'use client'

const SESSION_KEY = 'vela_admin_session'
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

interface Session { token: string; expires: number }

/** ล็อกอิน admin — ส่งรหัสไปตรวจฝั่ง server แล้วเก็บ session token ที่ได้กลับมา
 *  (ไม่มี admin key จริงฝังในหน้าเว็บอีกต่อไป) */
export async function login(password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (!data?.token) return false
    const expires = data.expires_at ? data.expires_at * 1000 : Date.now() + 8 * 60 * 60 * 1000
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: data.token, expires }))
    return true
  } catch {
    return false
  }
}

function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (!s?.token || Date.now() > s.expires) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return s
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}

/** token สำหรับแนบไปกับ request ไปยัง endpoint /admin/* */
export function getAdminToken(): string {
  return getSession()?.token || ''
}

/** header สำเร็จรูปสำหรับเรียก admin API (แนบ token อัตโนมัติ) */
export function adminHeaders(extra?: Record<string, string>): Record<string, string> {
  return { 'x-api-key': getAdminToken(), ...(extra || {}) }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}
