'use client'
// Customer session token — ออกตอน login (OTP/LINE) เก็บไว้แนบทุก request ข้อมูลส่วนตัว
const TOKEN_KEY = 'vela_token'

export function setAuthToken(t?: string | null) {
  if (typeof window === 'undefined') return
  if (t) localStorage.setItem(TOKEN_KEY, t)
}

export function getAuthToken(): string {
  if (typeof window === 'undefined') return ''
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY)
}

/** header สำหรับเรียก endpoint ข้อมูลส่วนตัว (แนบ x-auth-token ถ้ามี) */
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const t = getAuthToken()
  return { ...(extra || {}), ...(t ? { 'x-auth-token': t } : {}) }
}

/** ถ้า 401 = token หมดอายุ/ไม่มี → เคลียร์ session ลูกค้า (หน้าจะเด้งไปให้ login ใหม่)
 *  คืน true ถ้าจัดการแล้ว */
export function onCustomerUnauthorized(res: Response): boolean {
  if (res.status === 401) {
    clearAuthToken()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vela_user')
      window.dispatchEvent(new Event('vela-logout'))
    }
    return true
  }
  return false
}
