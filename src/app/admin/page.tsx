'use client'
import { useState, useEffect, useCallback } from 'react'
import VelaBunny from '@/components/VelaBunny'
import Link from 'next/link'

const API  = process.env.NEXT_PUBLIC_API_URL  || 'https://vela-tracking.onrender.com'
const PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'vela2024'

type Shipment = {
  barcode: string
  status: string
  status_th: string
  latest_location: string | null
  latest_datetime: string | null
  is_done: boolean
  last_checked_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  accepted:         '#8C7B6E',
  in_transit:       '#8B5E00',
  out_for_delivery: '#1A5C8F',
  delivered:        '#1A6B3C',
  returned:         '#D64B2A',
  problem:          '#D64B2A',
  pending:          '#C5BAB0',
}

export default function AdminPage() {
  const [authed,    setAuthed]    = useState(false)
  const [pass,      setPass]      = useState('')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading,   setLoading]   = useState(false)
  const [checking,  setChecking]  = useState(false)
  const [filter,    setFilter]    = useState<'pending' | 'all'>('pending')
  const [updated,   setUpdated]   = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter === 'pending' ? `${API}/shipments?is_done=false` : `${API}/shipments`
      const res  = await fetch(url)
      const data = await res.json()
      setShipments(data.shipments || [])
      setUpdated(new Date().toLocaleTimeString('th-TH'))
    } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { if (authed) fetchData() }, [authed, fetchData])

  const checkNow = async () => {
    setChecking(true)
    try {
      await fetch(`${API}/shipments/check-now`, { method: 'POST' })
      await new Promise(r => setTimeout(r, 4000))
      await fetchData()
    } finally { setChecking(false) }
  }

  const login = () => {
    if (pass === PASS) setAuthed(true)
    else { alert('รหัสผ่านไม่ถูกต้อง') }
  }

  const pending  = shipments.filter(s => !s.is_done).length
  const problems = shipments.filter(s => s.status === 'returned' || s.status === 'problem').length

  if (!authed) return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: '#EDE8DF' }}>
      <div className="w-full max-w-xs text-center">
        <VelaBunny size={48} className="mx-auto mb-4" />
        <h1 className="text-4xl font-black uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          VeLA Admin
        </h1>
        <p className="text-xs font-mono mb-6" style={{ color: '#8C7B6E' }}>Cold Brew Coffee</p>
        <input type="password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="รหัสผ่าน"
          className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono mb-3 focus:outline-none transition-all"
          style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }}
          onFocus={e => e.target.style.borderColor = '#D64B2A'}
          onBlur={e => e.target.style.borderColor = '#D8D0C5'}
        />
        <button onClick={login}
          className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-display)', fontSize: '16px', background: '#D64B2A', color: '#EDE8DF' }}>
          เข้าสู่ระบบ
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-4xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelaBunny size={36} />
            <div>
              <h1 className="text-3xl font-black uppercase leading-none"
                style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>VeLA Admin</h1>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
                {updated ? `อัพเดท ${updated}` : 'กำลังโหลด...'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/upload"
              className="px-4 py-2 rounded-xl border-2 text-xs font-mono uppercase tracking-wider transition-all"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              + Import Excel
            </Link>
            <button onClick={fetchData} disabled={loading}
              className="px-4 py-2 rounded-xl border-2 text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              {loading ? '...' : 'รีเฟรช'}
            </button>
            <button onClick={checkNow} disabled={checking}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95"
              style={{ fontFamily: 'var(--font-display)', fontSize: '13px', background: checking ? '#C5BAB0' : '#D64B2A', color: '#EDE8DF' }}>
              {checking ? 'กำลังเช็ค...' : 'เช็คเดี๋ยวนี้'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'ยังไม่สำเร็จ',   value: pending,              color: '#8B5E00', bg: '#F5E6C0' },
            { label: 'มีปัญหา/ตีกลับ', value: problems,             color: '#D64B2A', bg: '#F5D5CC' },
            { label: 'ทั้งหมด',         value: shipments.length,    color: '#8C7B6E', bg: '#E0D9CE' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border-2 px-4 py-3"
              style={{ background: s.bg, borderColor: s.color + '30' }}>
              <p className="text-xs font-mono mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Problem alert */}
        {problems > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl border-2 animate-bounce-in"
            style={{ background: '#F5D5CC', borderColor: '#D64B2A50' }}>
            <p className="text-sm font-medium" style={{ color: '#D64B2A' }}>
              ⚠ มี {problems} รายการที่ตีกลับหรือมีปัญหา — ต้องดำเนินการด่วน
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['pending', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border-2 transition-all"
              style={filter === f
                ? { background: '#D64B2A', color: '#EDE8DF', borderColor: '#D64B2A' }
                : { background: 'transparent', color: '#8C7B6E', borderColor: '#D8D0C5' }}>
              {f === 'pending' ? 'ยังไม่สำเร็จ' : 'ทั้งหมด'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          {loading ? (
            <div className="p-8 text-center text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</div>
          ) : shipments.length === 0 ? (
            <div className="p-12 text-center">
              <VelaBunny size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ไม่มีรายการ</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #E0D9CE' }}>
                  {['Tracking', 'สถานะ', 'ตำแหน่งล่าสุด', 'เช็คล่าสุด'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider"
                      style={{ color: '#C5BAB0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => (
                  <tr key={s.barcode}
                    style={{ borderBottom: i < shipments.length - 1 ? '1px solid #E0D9CE' : 'none' }}
                    className="transition-colors hover:bg-vela-cream">
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#3D1F0F' }}>{s.barcode}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium" style={{ color: STATUS_COLOR[s.status] || '#8C7B6E' }}>
                        {s.status_th || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#8C7B6E' }}>{s.latest_location || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: '#C5BAB0' }}>
                      {s.last_checked_at
                        ? new Date(s.last_checked_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
