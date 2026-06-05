'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL   || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default function LineLoginButton({ onDone }: { onDone?: () => void }) {
  const { user, loading, login, logout, savePhone } = useAuth()
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phone,      setPhone]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [orders,     setOrders]     = useState<any[]>([])
  const [showOrders, setShowOrders] = useState(false)

  const handleLogin = async () => {
    await login()
    const saved = localStorage.getItem('vela_user')
    if (saved) {
      const u = JSON.parse(saved)
      if (!u.phone) setShowPhoneModal(true)
      else onDone?.()
    }
  }

  const handleSavePhone = async () => {
    if (!phone || phone.length < 9) return
    setSaving(true)
    const p = phone.length === 9 ? '0' + phone : phone
    savePhone(p)
    try {
      const res  = await fetch(`${SB_URL}/rest/v1/orders?phone=eq.${p}&order=order_date.desc&limit=10`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) { setOrders(data); setShowOrders(true) }
    } catch {}
    setSaving(false)
    setShowPhoneModal(false)
    if (!showOrders) onDone?.()
  }

  if (user) return (
    <div className="flex items-center gap-2">
      {user.pictureUrl && (
        <img src={user.pictureUrl} alt={user.displayName} className="w-8 h-8 rounded-full object-cover border-2" style={{ borderColor: '#D64B2A' }} />
      )}
      <div className="text-left">
        <p className="text-xs font-medium" style={{ color: '#3D1F0F' }}>{user.displayName}</p>
        {user.phone && <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{user.phone}</p>}
      </div>
      <button onClick={logout} className="text-xs font-mono px-2 py-1 rounded-lg border ml-1" style={{ color: '#C5BAB0', borderColor: '#D8D0C5' }}>ออก</button>

      {showOrders && orders.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowOrders(false); onDone?.() }} />
          <div className="relative w-full max-w-md rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <div className="px-5 py-4 border-b-2" style={{ borderColor: '#E0D9CE' }}>
              <h3 className="font-black text-xl uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>ยินดีต้อนรับกลับ! 🐰</h3>
              <p className="text-xs font-mono mt-1" style={{ color: '#8C7B6E' }}>พบ {orders.length} ออเดอร์จากประวัติ</p>
            </div>
            <div className="px-5 py-3 max-h-60 overflow-y-auto">
              {orders.map(o => (
                <div key={o.order_id} className="py-2 border-b" style={{ borderColor: '#E0D9CE' }}>
                  <div className="flex justify-between">
                    <p className="text-xs font-mono" style={{ color: '#3D1F0F' }}>{o.order_id}</p>
                    <p className="text-xs" style={{ color: '#8C7B6E' }}>{o.status}</p>
                  </div>
                  <p className="text-xs" style={{ color: '#8C7B6E' }}>{o.sku} · {o.order_date}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4">
              <button onClick={() => { setShowOrders(false); onDone?.() }}
                className="w-full py-2.5 rounded-xl font-black uppercase text-sm"
                style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                เริ่มช้อปปิ้ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <button onClick={handleLogin} disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-xs transition-all active:scale-95 disabled:opacity-50"
        style={{ fontFamily: 'var(--font-display)', background: '#06C755', color: '#FFFFFF' }}>
        {loading ? '...' : <><svg width="14" height="14" viewBox="0 0 40 40"><path d="M20 4C11.163 4 4 10.268 4 18c0 5.946 3.917 11.11 9.8 13.687.43.186.36.501.27.699l-.87 3.247c-.1.383.35.695.711.505C18.447 33.993 28 27.9 28 27.9c.695 0 8-.895 8-9.9C36 10.268 28.837 4 20 4z" fill="white"/></svg>Login LINE</>}
      </button>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-sm rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <h3 className="font-black text-xl uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>ใส่เบอร์โทรของคุณ</h3>
            <p className="text-xs font-mono mb-4" style={{ color: '#8C7B6E' }}>เพื่อดูประวัติสั่งซื้อและสะดวกในการสั่งครั้งต่อไป</p>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSavePhone()}
              placeholder="0812345678" maxLength={10}
              className="w-full px-4 py-3 rounded-xl border-2 text-sm font-mono mb-3 focus:outline-none"
              style={{ background: '#EDE8DF', borderColor: '#D8D0C5', color: '#3D1F0F' }} />
            <button onClick={handleSavePhone} disabled={saving}
              className="w-full py-3 rounded-xl font-black uppercase text-sm mb-2 disabled:opacity-50"
              style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
              {saving ? 'กำลังค้นหา...' : 'ยืนยัน'}
            </button>
            <button onClick={() => { setShowPhoneModal(false); onDone?.() }} className="w-full py-2 text-xs font-mono" style={{ color: '#C5BAB0' }}>ข้ามไปก่อน</button>
          </div>
        </div>
      )}
    </>
  )
}
