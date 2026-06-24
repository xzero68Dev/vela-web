'use client'
import { useEffect } from 'react'

/**
 * หน้านี้รับ OAuth callback จาก LINE login popup
 * flow: LINE OAuth → redirect มาที่นี่ → ส่ง code กลับไปให้ parent window → ปิด popup
 */
export default function LineCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code  = params.get('code')
    const state = params.get('state')

    if (window.opener) {
      // ส่งข้อมูลกลับไปให้ parent window แล้วปิด popup
      window.opener.postMessage({ type: 'LINE_OAUTH_CALLBACK', code, state }, window.location.origin)
      window.close()
    } else {
      // ถ้าไม่มี opener (redirect flow) → ให้ AuthContext จัดการเอง
      window.location.href = '/'
    }
  }, [])

  return (
    <main style={{ background: '#EDE8DF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'sans-serif', color: '#8C7B6E', fontSize: '14px' }}>กำลังเข้าสู่ระบบ...</p>
    </main>
  )
}
