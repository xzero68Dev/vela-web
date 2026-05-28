'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/components/auth'
import VelaBunny from '@/components/VelaBunny'

export default function LoginPage() {
  const [pass,  setPass]  = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    if (login(pass)) {
      router.push('/admin')
    } else {
      setError('รหัสผ่านไม่ถูกต้อง')
      setPass('')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: '#EDE8DF' }}>
      <div className="w-full max-w-xs text-center">
        <div className="animate-float inline-block mb-4">
          <VelaBunny size={52} />
        </div>
        <h1 className="text-4xl font-black uppercase mb-1"
          style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          VeLA Admin
        </h1>
        <p className="text-xs font-mono mb-8" style={{ color: '#8C7B6E' }}>
          Cold Brew Coffee
        </p>

        <div className="rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          <input
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="รหัสผ่าน"
            autoFocus
            className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono mb-3 focus:outline-none transition-all"
            style={{ background: '#EDE8DF', borderColor: error ? '#D64B2A' : '#D8D0C5', color: '#3D1F0F' }}
            onFocus={e => e.target.style.borderColor = '#D64B2A'}
            onBlur={e => e.target.style.borderColor = error ? '#D64B2A' : '#D8D0C5'}
          />
          {error && (
            <p className="text-xs font-mono mb-3" style={{ color: '#D64B2A' }}>⚠ {error}</p>
          )}
          <button onClick={handleLogin}
            className="w-full py-3 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95"
            style={{ fontFamily: 'var(--font-display)', fontSize: '16px', background: '#D64B2A', color: '#EDE8DF' }}>
            เข้าสู่ระบบ
          </button>
          <p className="text-xs font-mono mt-4" style={{ color: '#C5BAB0' }}>
            Session หมดอายุใน 8 ชั่วโมง
          </p>
        </div>
      </div>
    </main>
  )
}
