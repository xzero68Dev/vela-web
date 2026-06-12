'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

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
  const ready    = useAdminAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading,   setLoading]   = useState(false)
  const [checking,  setChecking]  = useState(false)
  const [custDetail, setCustDetail] = useState<any>(null)
  const [loadingCust, setLoadingCust] = useState(false)
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

  useEffect(() => { if (ready) fetchData() }, [ready, fetchData])

  const fetchCustomerByBarcode = async (barcode: string) => {
    setLoadingCust(true)
    try {
      const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      // หา order_id จาก shipping
      const shipRes = await fetch(`${SB_URL}/rest/v1/shipping?tracking=eq.${barcode}&select=order_id`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      const shipData = await shipRes.json()
      if (!shipData?.[0]?.order_id) { setCustDetail({ error: 'ไม่พบข้อมูลลูกค้า' }); return }
      const orderId = shipData[0].order_id
      const orderRes = await fetch(`${SB_URL}/rest/v1/orders?order_id=eq.${orderId}`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      const orderData = await orderRes.json()
      if (orderData?.[0]) setCustDetail({ ...orderData[0], barcode })
      else setCustDetail({ error: 'ไม่พบข้อมูล order' })
    } catch { setCustDetail({ error: 'เชื่อมต่อไม่ได้' }) }
    finally { setLoadingCust(false) }
  }

  const checkNow = async () => {
    setChecking(true)
    try {
      await fetch(`${API}/shipments/check-now`, { method: 'POST' })
      await new Promise(r => setTimeout(r, 4000))
      await fetchData()
    } finally { setChecking(false) }
  }

  if (!ready) return null

  const pending  = shipments.filter(s => !s.is_done).length
  const problems = shipments.filter(s => s.status === 'returned' || s.status === 'problem').length

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-4xl mx-auto px-5 py-10">
        <AdminNav />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'ยังไม่สำเร็จ',   value: pending,           color: '#8B5E00', bg: '#F5E6C0' },
            { label: 'มีปัญหา/ตีกลับ', value: problems,          color: '#D64B2A', bg: '#F5D5CC' },
            { label: 'ทั้งหมด',         value: shipments.length,  color: '#8C7B6E', bg: '#E0D9CE' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border-2 px-4 py-3"
              style={{ background: s.bg, borderColor: s.color + '30' }}>
              <p className="text-xs font-mono mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
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
          <div className="flex items-center gap-2">
            {updated && <span className="text-xs font-mono" style={{ color: '#C5BAB0' }}>อัพเดท {updated}</span>}
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

        {/* Problem alert */}
        {problems > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl border-2"
            style={{ background: '#F5D5CC', borderColor: '#D64B2A50' }}>
            <p className="text-sm font-medium" style={{ color: '#D64B2A' }}>
              ⚠ มี {problems} รายการที่ตีกลับหรือมีปัญหา — ต้องดำเนินการด่วน
            </p>
          </div>
        )}

        {/* Table */}
        <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          {loading ? (
            <div className="p-8 text-center text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</div>
          ) : shipments.length === 0 ? (
            <div className="p-12 text-center">
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
                    className="hover:bg-vela-cream transition-colors">
                    <td className="px-4 py-3">
                        <button onClick={() => { setCustDetail(null); fetchCustomerByBarcode(s.barcode) }}
                          className="font-mono text-xs hover:underline transition-opacity hover:opacity-70 text-left"
                          style={{ color: '#D64B2A' }}>
                          {s.barcode}
                        </button>
                      </td>
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
    {/* Customer detail modal */}
      {(custDetail || loadingCust) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCustDetail(null)} />
          <div className="relative w-full max-w-md rounded-3xl border-2 overflow-hidden"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <div className="px-5 py-4 border-b-2 flex items-center justify-between" style={{ borderColor: '#E0D9CE' }}>
              <h3 className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                ข้อมูลลูกค้า
              </h3>
              <button onClick={() => setCustDetail(null)} style={{ color: '#8C7B6E' }}>✕</button>
            </div>
            <div className="px-5 py-4">
              {loadingCust ? (
                <p className="text-center text-xs font-mono py-4" style={{ color: '#C5BAB0' }}>กำลังโหลด...</p>
              ) : custDetail?.error ? (
                <p className="text-center text-xs font-mono py-4" style={{ color: '#D64B2A' }}>{custDetail.error}</p>
              ) : custDetail && (
                <div className="space-y-3">
                  <div className="rounded-2xl p-4" style={{ background: '#EDE8DF' }}>
                    <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#C5BAB0' }}>ลูกค้า</p>
                    <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>{custDetail.customer}</p>
                    <p className="font-mono text-sm mt-1" style={{ color: '#3D1F0F' }}>{custDetail.phone}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: '#EDE8DF' }}>
                    <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#C5BAB0' }}>ที่อยู่</p>
                    <p className="text-sm" style={{ color: '#3D1F0F' }}>{custDetail.full_address}</p>
                    <p className="text-sm" style={{ color: '#3D1F0F' }}>{custDetail.province} {custDetail.zip}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: '#EDE8DF' }}>
                    <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#C5BAB0' }}>ออเดอร์</p>
                    <p className="text-xs font-mono" style={{ color: '#3D1F0F' }}>{custDetail.order_id}</p>
                    <p className="text-sm mt-1" style={{ color: '#3D1F0F' }}>{custDetail.sku}</p>
                    <p className="text-xs font-mono mt-1" style={{ color: '#8C7B6E' }}>{custDetail.order_date} · {custDetail.channel}</p>
                    {custDetail.note && <p className="text-xs mt-1" style={{ color: '#8C7B6E' }}>หมายเหตุ: {custDetail.note}</p>}
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: '#EDE8DF' }}>
                    <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: '#C5BAB0' }}>Tracking</p>
                    <p className="font-mono text-sm" style={{ color: '#3D1F0F' }}>{custDetail.barcode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
