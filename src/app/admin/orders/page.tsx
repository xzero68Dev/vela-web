'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API    = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

type Order = {
  order_id: string; order_date: string; ship_date: string
  customer: string; phone: string; province: string
  full_address: string; sku: string; qty: number
  channel: string; status: string
  slip_url?: string; paid_at?: string; note?: string; total?: number
}

const STATUS_OPTIONS = ['ทั้งหมด', 'รอชำระเงิน', 'ชำระแล้ว', 'จัดส่งแล้ว', 'ตีกลับ']
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  'รอชำระเงิน': { bg: '#F5E6C0', text: '#854F0B' },
  'ชำระแล้ว':   { bg: '#C5E8D5', text: '#1A6B3C' },
  'จัดส่งแล้ว': { bg: '#D0E8F5', text: '#1A5C8F' },
  'ตีกลับ':     { bg: '#F5D5CC', text: '#D64B2A' },
}

export default function AdminOrdersPage() {
  const ready = useAdminAuth()
  const [orders,     setOrders]     = useState<Order[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('ทั้งหมด')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState<Order | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [shipping,   setShipping]   = useState({ tracking: '', carrier: 'POST SABUY' })
  const [addingShip, setAddingShip] = useState(false)
  const [updated,    setUpdated]    = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${SB_URL}/rest/v1/orders?order=created_at.desc&limit=200&select=order_id,order_date,customer,phone,province,full_address,sku,qty,channel,status,slip_url,paid_at,note,total`
      if (filter !== 'ทั้งหมด') url += `&status=eq.${encodeURIComponent(filter)}`
      const res  = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      setUpdated(new Date().toLocaleTimeString('th-TH'))
    } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { if (ready) fetchOrders() }, [ready, fetchOrders])

  const confirmPayment = async (order: Order) => {
    setConfirming(true)
    try {
      const res = await fetch(`${API}/admin/confirm-payment?order_id=${encodeURIComponent(order.order_id)}`, {
        method: 'POST',
        headers: { 'x-api-key': ADMIN_KEY },
      })
      if (!res.ok) {
        const errText = await res.text()
        alert(`ยืนยันการชำระเงินไม่สำเร็จ: ${errText}`)
        return
      }
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'ชำระแล้ว' } : null)
    } finally { setConfirming(false) }
  }

  const addShipping = async (order: Order) => {
    if (!shipping.tracking.trim()) { alert('กรุณาใส่เลข tracking'); return }
    setAddingShip(true)
    try {
      const res = await fetch(`${API}/admin/add-shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({
          order_id: order.order_id,
          tracking: shipping.tracking.trim().toUpperCase(),
          carrier:  shipping.carrier,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        alert(`เพิ่มการจัดส่งไม่สำเร็จ: ${errText}`)
        return
      }
      setShipping({ tracking: '', carrier: 'POST SABUY' })
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'จัดส่งแล้ว' } : null)
    } finally { setAddingShip(false) }
  }

  const filtered = orders.filter(o =>
    !search || o.customer?.includes(search) || o.order_id?.includes(search) || o.phone?.includes(search)
  )

  const stats = {
    pending: orders.filter(o => o.status === 'รอชำระเงิน').length,
    paid:    orders.filter(o => o.status === 'ชำระแล้ว').length,
    slips:   orders.filter(o => o.slip_url && o.status === 'รอชำระเงิน').length,
    total:   orders.length,
  }

  if (!ready) return null

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-6xl mx-auto px-5 py-10">
        <AdminNav />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'รอชำระเงิน', value: stats.pending, bg: '#F5E6C0', color: '#854F0B' },
            { label: 'มีสลิปรอยืนยัน', value: stats.slips, bg: '#F5D5CC', color: '#D64B2A' },
            { label: 'ชำระแล้ว', value: stats.paid, bg: '#C5E8D5', color: '#1A6B3C' },
            { label: 'ทั้งหมด', value: stats.total, bg: '#E0D9CE', color: '#8C7B6E' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border-2 px-4 py-3" style={{ background: s.bg, borderColor: s.color + '30' }}>
              <p className="text-xs font-mono mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono transition-all"
                style={filter === s
                  ? { background: '#D64B2A', color: '#EDE8DF', borderColor: '#D64B2A' }
                  : { background: 'transparent', color: '#8C7B6E', borderColor: '#D8D0C5' }}>
                {s}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ เบอร์ หรือ Order ID..."
            className="flex-1 min-w-48 px-4 py-1.5 rounded-xl border-2 text-sm focus:outline-none"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }} />
          <div className="flex gap-2 items-center">
            {updated && <span className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{updated}</span>}
            <button onClick={fetchOrders} disabled={loading}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              {loading ? '...' : 'รีเฟรช'}
            </button>
          </div>
        </div>

        {/* Orders table */}
        <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          {loading ? (
            <div className="p-8 text-center text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono" style={{ color: '#C5BAB0' }}>ไม่พบรายการ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid #E0D9CE' }}>
                    {['Order ID', 'วันที่', 'ลูกค้า', 'สินค้า', 'ช่องทาง', 'สลิป', 'สถานะ', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const sc = STATUS_COLOR[o.status] || { bg: '#F5F1EB', text: '#8C7B6E' }
                    return (
                      <tr key={o.order_id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E0D9CE' : 'none' }}
                        className="hover:bg-opacity-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#3D1F0F' }}>{o.order_id}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#8C7B6E' }}>{o.order_date}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium" style={{ color: '#3D1F0F' }}>{o.customer}</p>
                          <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{o.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#8C7B6E', maxWidth: '150px' }}>
                          <p className="truncate">{o.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#8C7B6E' }}>{o.channel}</td>
                        <td className="px-4 py-3">
                          {o.slip_url
                            ? <button onClick={() => setSelected(o)}
                                className="text-xs px-2 py-1 rounded-lg font-mono"
                                style={{ background: '#F5D5CC', color: '#D64B2A' }}>
                                ดูสลิป
                              </button>
                            : <span className="text-xs font-mono" style={{ color: '#D8D0C5' }}>—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono px-2 py-1 rounded-full"
                            style={{ background: sc.bg, color: sc.text }}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelected(o)}
                            className="text-xs px-3 py-1.5 rounded-xl border-2 font-mono transition-all hover:opacity-70"
                            style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                            รายละเอียด
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border-2 overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>

            {/* Header */}
            <div className="px-5 py-4 border-b-2 flex items-center justify-between sticky top-0"
              style={{ borderColor: '#E0D9CE', background: '#F5F1EB' }}>
              <div>
                <h3 className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                  {selected.order_id}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: (STATUS_COLOR[selected.status] || { bg: '#E0D9CE' }).bg, color: (STATUS_COLOR[selected.status] || { text: '#8C7B6E' }).text }}>
                  {selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: '#8C7B6E' }}>✕</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Customer info */}
              <div className="rounded-2xl p-4" style={{ background: '#EDE8DF' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#C5BAB0' }}>ข้อมูลลูกค้า</p>
                <p className="font-medium" style={{ color: '#3D1F0F' }}>{selected.customer}</p>
                <p className="text-sm font-mono" style={{ color: '#8C7B6E' }}>{selected.phone}</p>
                <p className="text-sm mt-1" style={{ color: '#8C7B6E' }}>{selected.full_address}</p>
                <p className="text-sm" style={{ color: '#8C7B6E' }}>{selected.province}</p>
              </div>

              {/* Order info */}
              <div className="rounded-2xl p-4" style={{ background: '#EDE8DF' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#C5BAB0' }}>รายการสินค้า</p>
                <p className="font-medium" style={{ color: '#3D1F0F' }}>{selected.sku}</p>
                {selected.total ? (
                  <p className="font-black text-lg mt-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                    ฿{selected.total.toLocaleString()}
                  </p>
                ) : null}
                <p className="text-xs font-mono mt-1" style={{ color: '#8C7B6E' }}>
                  วันที่สั่ง: {selected.order_date} · ช่องทาง: {selected.channel}
                </p>
                {selected.note && <p className="text-xs mt-1" style={{ color: '#8C7B6E' }}>หมายเหตุ: {selected.note}</p>}
              </div>

              {/* Slip */}
              {selected.slip_url && (
                <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: '#D8D0C5' }}>
                  <p className="text-xs font-mono uppercase tracking-wider px-4 py-2" style={{ color: '#C5BAB0', background: '#EDE8DF' }}>สลิปโอนเงิน</p>
                  <img src={selected.slip_url} alt="slip" className="w-full" />
                </div>
              )}

              {!selected.slip_url && (
                <div className="rounded-2xl border-2 px-4 py-6 text-center" style={{ borderColor: '#D8D0C5', borderStyle: 'dashed' }}>
                  <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ยังไม่มีสลิป</p>
                </div>
              )}

              {/* Actions */}
              {selected.status === 'รอชำระเงิน' && (
                <button onClick={() => confirmPayment(selected)} disabled={confirming}
                  className="w-full py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                  {confirming ? 'กำลังยืนยัน...' : '✓ ยืนยันการชำระเงิน'}
                </button>
              )}

              {selected.status === 'ชำระแล้ว' && selected.paid_at && (
                <p className="text-xs font-mono text-center" style={{ color: '#1A6B3C' }}>
                  ✓ ยืนยันชำระเมื่อ {new Date(selected.paid_at).toLocaleString('th-TH')}
                </p>
              )}

              {/* ฟอร์มเพิ่มการจัดส่ง — แสดงเฉพาะตอนยังไม่มี tracking */}
              {selected.status === 'ชำระแล้ว' && (
                <div className="rounded-2xl border-2 p-4 space-y-3" style={{ background: '#EDE8DF', borderColor: '#E0D9CE' }}>
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>เพิ่มการจัดส่ง</p>
                  <div className="space-y-2">
                    <select value={shipping.carrier} onChange={e => setShipping(s => ({ ...s, carrier: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono"
                      style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }}>
                      <option value="POST SABUY">POST SABUY</option>
                      <option value="KERRY">Kerry Express</option>
                      <option value="FLASH">Flash Express</option>
                      <option value="J&T">J&T Express</option>
                      <option value="SCG">SCG Express</option>
                      <option value="DHL">DHL</option>
                    </select>
                    <input value={shipping.tracking}
                      onChange={e => setShipping(s => ({ ...s, tracking: e.target.value }))}
                      placeholder="เลข tracking เช่น JM123456789TH"
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono uppercase"
                      style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
                    <button onClick={() => addShipping(selected)} disabled={addingShip || !shipping.tracking.trim()}
                      className="w-full py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                      style={{ fontFamily: 'var(--font-display)', background: '#1A5C8F', color: '#EDE8DF' }}>
                      {addingShip ? 'กำลังบันทึก...' : '🚚 บันทึกการจัดส่ง'}
                    </button>
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
