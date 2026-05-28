'use client'

const SESSION_KEY  = 'vela_admin_session'
const SESSION_HOURS = 8

export function login(password: string): boolean {
  const correct = process.env.NEXT_PUBLIC_ADMIN_PASS || 'vela2024'
  if (password !== correct) return false
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000
  localStorage.setItem(SESSION_KEY, JSON.stringify({ expires }))
  return true
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const { expires } = JSON.parse(raw)
    if (Date.now() > expires) {
      localStorage.removeItem(SESSION_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}
