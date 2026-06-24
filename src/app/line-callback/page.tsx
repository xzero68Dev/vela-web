'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

export default function LineCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('กำลังเข้าสู่ระบบ...')

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code  = params.get('code')
      const state = params.get('state')
      const error = params.get('error')

      if (error) {
        setStatus('ยกเลิกการเข้าสู่ระบบ')
        setTimeout(() => router.push('/'), 1500)
        return
      }

      const savedState = localStorage.getItem('line_oauth_state')
      if (!code || state !== savedState) {
        setStatus('เกิดข้อผิดพลาด กรุณาลองใหม่')
        setTimeout(() => router.push('/account'), 2000)
        return
      }

      localStorage.removeItem('line_oauth_state')

      try {
        const res = await fetch(`${API}/auth/line-oauth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: window.location.origin + '/line-callback',
          }),
        })
        const data = await res.json()
        if (data.customer) {
          localStorage.setItem('vela_user', JSON.stringify(data.customer))
          setStatus('เข้าสู่ระบบสำเร็จ! ✓')
          const returnUrl = localStorage.getItem('vela_return_url') || '/'
          localStorage.removeItem('vela_return_url')
          setTimeout(() => router.push(returnUrl), 800)
        } else {
          setStatus('เกิดข้อผิดพลาด กรุณาลองใหม่')
          setTimeout(() => router.push('/account'), 2000)
        }
      } catch {
        setStatus('เชื่อมต่อไม่ได้ กรุณาลองใหม่')
        setTimeout(() => router.push('/account'), 2000)
      }
    }

    handleCallback()
  }, [])

  return (
    <main style={{ background: '#EDE8DF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '4px solid #E0D9CE',
          borderTopColor: '#D64B2A', borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 16px'
        }} />
        <p style={{ fontFamily: 'sans-serif', color: '#8C7B6E', fontSize: '14px' }}>{status}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </main>
  )
}
