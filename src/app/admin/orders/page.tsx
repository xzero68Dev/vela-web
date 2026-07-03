'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const SB_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API       = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

type Order = {
  order_id: string; order_date: string; ship_date?: string
  customer: string; phone: string; province: string
  full_address: string; sku: string; qty: number
  channel: string; status: string
  slip_url?: string; paid_at?: string; note?: string; total?: number
  tracking?: string; carrier?: string
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  'รอชำระเงิน':   { bg: '#F5E6C0', text: '#854F0B' },
  'ชำระแล้ว':     { bg: '#C5E8D5', text: '#1A6B3C' },
  'จัดส่งแล้ว':   { bg: '#D0E8F5', text: '#1A5C8F' },
  'จัดส่งสำเร็จ': { bg: '#C5E8D5', text: '#1A6B3C' },
  'ตีกลับ':       { bg: '#F5D5CC', text: '#D64B2A' },
}

function Badge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] || { bg: '#E0D9CE', text: '#8C7B6E' }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-mono"
      style={{ background: c.bg, color: c.text }}>{status}</span>
  )
}

export default function AdminOrdersPage() {
  const ready = useAdminAuth()
  const [orders,      setOrders]      = useState<Order[]>([])
  const [shipping,    setShipping]    = useState<Record<string, { tracking?: string; carrier?: string }>>({})
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<'web' | 'shopee'>('web')
  const [shopeeTab,   setShopeeTab]   = useState<'post' | 'other' | 'manual'>('post')
  const [selected,    setSelected]    = useState<Order | null>(null)
  const [search,      setSearch]      = useState('')
  const [shipForm,    setShipForm]    = useState({ tracking: '', carrier: 'POST SABUY' })
  const [acting,      setActing]      = useState(false)
  const [updated,     setUpdated]     = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/orders?order=created_at.desc&limit=300&select=order_id,order_date,ship_date,customer,phone,province,full_address,sku,qty,channel,status,slip_url,paid_at,note,total`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
      )
      const data = await res.json()
      const orders = Array.isArray(data) ? data : []
      setOrders(orders)

      // ดึง shipping data ของทุก order
      const ids = orders.map((o: Order) => o.order_id)
      if (ids.length) {
        const sRes = await fetch(
          `${SB_URL}/rest/v1/shipping?order_id=in.(${ids.join(',')})&select=order_id,tracking,carrier`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
        )
        const sData = await sRes.json()
        const map: Record<string, { tracking?: string; carrier?: string }> = {}
        if (Array.isArray(sData)) sData.forEach((s: any) => { map[s.order_id] = { tracking: s.tracking, carrier: s.carrier } })
        setShipping(map)
      }
      setUpdated(new Date().toLocaleTimeString('th-TH'))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (ready) fetchOrders() }, [ready, fetchOrders])

  // Actions
  const confirmPayment = async (o: Order) => {
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/confirm-payment?order_id=${encodeURIComponent(o.order_id)}`, {
        method: 'POST', headers: { 'x-api-key': ADMIN_KEY },
      })
      if (!res.ok) { alert(`ยืนยันไม่สำเร็จ: ${await res.text()}`); return }
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'ชำระแล้ว' } : null)
    } finally { setActing(false) }
  }

  const addShipping = async (o: Order) => {
    if (!shipForm.tracking.trim()) { alert('กรุณาใส่เลข tracking'); return }
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/add-shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ order_id: o.order_id, tracking: shipForm.tracking.trim().toUpperCase(), carrier: shipForm.carrier }),
      })
      if (!res.ok) { alert(`เพิ่มการจัดส่งไม่สำเร็จ: ${await res.text()}`); return }
      setShipForm({ tracking: '', carrier: 'POST SABUY' })
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'จัดส่งแล้ว' } : null)
    } finally { setActing(false) }
  }

  const confirmDelivered = async (o: Order) => {
    if (!confirm(`ยืนยันว่าพัสดุ ${o.customer} ส่งถึงแล้ว?\nระบบจะแจ้ง SMS/LINE ลูกค้าทันที`)) return
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/confirm-delivered?order_id=${encodeURIComponent(o.order_id)}`, {
        method: 'POST', headers: { 'x-api-key': ADMIN_KEY },
      })
      if (!res.ok) { alert(`ยืนยันไม่สำเร็จ: ${await res.text()}`); return }
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'จัดส่งสำเร็จ' } : null)
    } finally { setActing(false) }
  }

  // Filter orders
  const webOrders     = orders.filter(o => o.channel === 'web')
  const shopeeOrders  = orders.filter(o => o.channel !== 'web')
  const postOrders    = shopeeOrders.filter(o => (shipping[o.order_id]?.carrier || '').includes('POST') || (shipping[o.order_id]?.carrier || '').includes('SABUY'))
  const otherOrders   = shopeeOrders.filter(o => {
    const c = shipping[o.order_id]?.carrier || ''
    return c && !c.includes('POST') && !c.includes('SABUY')
  })
  const manualOrders  = shopeeOrders.filter(o => !shipping[o.order_id]?.tracking)

  const applySearch = (list: Order[]) =>
    search ? list.filter(o => o.customer?.includes(search) || o.order_id?.includes(search) || o.phone?.includes(search)) : list

  const currentList = tab === 'web'
    ? applySearch(webOrders)
    : applySearch(shopeeTab === 'post' ? postOrders : shopeeTab === 'other' ? otherOrders : manualOrders)

  // Stats
  const webStats = {
    รอชำระ:    webOrders.filter(o => o.status === 'รอชำระเงิน').length,
    ชำระแล้ว:  webOrders.filter(o => o.status === 'ชำระแล้ว').length,
    จัดส่งแล้ว: webOrders.filter(o => o.status === 'จัดส่งแล้ว').length,
  }

  if (!ready) return null

  return (
    <main className="min-h-screen pb-20" style={{ background: '#EDE8DF' }}>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-black text-xl uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
            Orders
          </h1>
          <div className="flex items-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D64B2A', borderTopColor: 'transparent' }} />}
            <button onClick={fetchOrders} className="text-xs px-3 py-1.5 rounded-xl border-2 font-mono"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              รีเฟรช {updated && `· ${updated}`}
            </button>
          </div>
        </div>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหา ชื่อ / Order ID / เบอร์..."
          className="w-full px-4 py-2.5 rounded-xl border-2 text-sm mb-4 focus:outline-none"
          style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }} />

        {/* Main tabs */}
        <div className="flex gap-2 mb-4">
          {([['web', `🌐 เว็บ (${webOrders.length})`], ['shopee', `🟠 Shopee (${shopeeOrders.length})`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl border-2 text-sm font-mono transition-all"
              style={tab === t ? { background: '#D64B2A', borderColor: '#D64B2A', color: '#EDE8DF' } : { background: 'transparent', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Web stats */}
        {tab === 'web' && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(webStats).map(([k, v]) => (
              <div key={k} className="rounded-2xl p-3 text-center border-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>{v}</p>
                <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{k}</p>
              </div>
            ))}
          </div>
        )}

        {/* Shopee sub-tabs */}
        {tab === 'shopee' && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {([
              ['post',   `📮 POST SABUY (${postOrders.length})`],
              ['other',  `📦 ขนส่งอื่น (${otherOrders.length})`],
              ['manual', `🚚 ส่งเอง/รอเลข (${manualOrders.length})`],
            ] as const).map(([t, label]) => (
              <button key={t} onClick={() => setShopeeTab(t)}
                className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono transition-all"
                style={shopeeTab === t ? { background: '#3D1F0F', borderColor: '#3D1F0F', color: '#EDE8DF' } : { background: 'transparent', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Order list */}
        <div className="space-y-2">
          {currentList.length === 0 && !loading && (
            <p className="text-center py-8 text-sm font-mono" style={{ color: '#C5BAB0' }}>ไม่มีรายการ</p>
          )}
          {currentList.map(o => {
            const ship = shipping[o.order_id]
            return (
              <button key={o.order_id} onClick={() => { setSelected(o); setShipForm({ tracking: '', carrier: 'POST SABUY' }) }}
                className="w-full text-left rounded-2xl border-2 px-4 py-3 transition-all hover:shadow-sm"
                style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-black text-sm" style={{ color: '#3D1F0F' }}>{o.customer}</p>
                      <Badge status={o.status} />
                    </div>
                    <p className="text-xs font-mono truncate" style={{ color: '#8C7B6E' }}>{o.sku}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#C5BAB0' }}>
                      {o.order_id} · {o.order_date}
                      {ship?.tracking && ` · ${ship.tracking}`}
                    </p>
                  </div>
                  {o.total ? (
                    <p className="font-black text-sm flex-shrink-0" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                      ฿{Number(o.total).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto" style={{ background: '#EDE8DF', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b-2 flex items-center justify-between" style={{ borderColor: '#E0D9CE' }}>
              <p className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
                {selected.order_id}
              </p>
              <button onClick={() => setSelected(null)} style={{ color: '#8C7B6E', fontSize: 20 }}>✕</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Info */}
              <div className="rounded-2xl border-2 p-4 space-y-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                <div className="flex justify-between">
                  <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ลูกค้า</p>
                  <p className="text-sm font-black" style={{ color: '#3D1F0F' }}>{selected.customer}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>เบอร์</p>
                  <p className="text-sm font-mono" style={{ color: '#3D1F0F' }}>{selected.phone}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ที่อยู่</p>
                  <p className="text-sm text-right" style={{ color: '#3D1F0F', maxWidth: '60%' }}>
                    {[selected.full_address, selected.province].filter(Boolean).join(' ')}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>สินค้า</p>
                  <p className="text-sm text-right" style={{ color: '#3D1F0F', maxWidth: '60%' }}>{selected.sku}</p>
                </div>
                {selected.total ? (
                  <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#E0D9CE' }}>
                    <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ยอด</p>
                    <p className="font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                      ฿{Number(selected.total).toLocaleString()}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Status badge */}
              <div className="text-center">
                <Badge status={selected.status} />
              </div>

              {/* Slip */}
              {selected.slip_url && (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: '#C5BAB0' }}>สลิปการโอน</p>
                  <a href={selected.slip_url} target="_blank" rel="noopener noreferrer">
                    <img src={selected.slip_url} alt="slip" className="w-full rounded-2xl border-2 object-contain"
                      style={{ borderColor: '#E0D9CE', maxHeight: 280 }} />
                  </a>
                </div>
              )}
              {!selected.slip_url && selected.status === 'รอชำระเงิน' && (
                <p className="text-xs font-mono text-center" style={{ color: '#C5BAB0' }}>⏳ รอสลิปจากลูกค้า</p>
              )}

              {/* Actions — Web: ยืนยันชำระ */}
              {selected.channel === 'web' && selected.status === 'รอชำระเงิน' && (
                <button onClick={() => confirmPayment(selected)} disabled={acting}
                  className="w-full py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                  style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                  {acting ? 'กำลังยืนยัน...' : '✓ ยืนยันการชำระเงิน'}
                </button>
              )}

              {/* Actions — เพิ่มการจัดส่ง (web ชำระแล้ว หรือ Shopee ยังไม่มี tracking) */}
              {(
                (selected.channel === 'web' && selected.status === 'ชำระแล้ว') ||
                (selected.channel !== 'web' && !shipping[selected.order_id]?.tracking)
              ) && (
                <div className="rounded-2xl border-2 p-4 space-y-3" style={{ background: '#EDE8DF', borderColor: '#E0D9CE' }}>
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>เพิ่มการจัดส่ง</p>
                  <select value={shipForm.carrier} onChange={e => setShipForm(s => ({ ...s, carrier: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono"
                    style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }}>
                    <option value="POST SABUY">POST SABUY</option>
                    <option value="KERRY">Kerry Express</option>
                    <option value="FLASH">Flash Express</option>
                    <option value="J&T">J&T Express</option>
                    <option value="SCG">SCG Express</option>
                    <option value="DHL">DHL</option>
                  </select>
                  <input value={shipForm.tracking}
                    onChange={e => setShipForm(s => ({ ...s, tracking: e.target.value }))}
                    placeholder="เลข tracking (ถ้ามี)"
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono uppercase"
                    style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
                  <button onClick={() => addShipping(selected)} disabled={acting || !shipForm.tracking.trim()}
                    className="w-full py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#1A5C8F', color: '#EDE8DF' }}>
                    {acting ? 'กำลังบันทึก...' : '🚚 บันทึกการจัดส่ง'}
                  </button>
                </div>
              )}

              {/* Actions — ยืนยันส่งสำเร็จ (ทุก order ที่ไม่ใช่ POST SABUY หรือส่งเอง) */}
              {selected.status === 'จัดส่งแล้ว' && (
                <div className="space-y-2">
                  {/* tracking links */}
                  {shipping[selected.order_id]?.tracking && (
                    <div className="flex gap-2">
                      {(shipping[selected.order_id]?.carrier || '').includes('POST') || (shipping[selected.order_id]?.carrier || '').includes('SABUY') ? (
                        <a href={`https://velacoldbrew.com/track/${shipping[selected.order_id]?.tracking}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-xl text-xs font-mono text-center border-2"
                          style={{ borderColor: '#1A5C8F', color: '#1A5C8F', background: '#F5F1EB' }}>
                          🚚 ดูสถานะ (ไปรษณีย์)
                        </a>
                      ) : (
                        <a href="https://th.kerryexpress.com/th/track/"
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-xl text-xs font-mono text-center border-2"
                          style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#F5F1EB' }}>
                          📦 Kerry/Flash tracking
                        </a>
                      )}
                    </div>
                  )}
                  <button onClick={() => confirmDelivered(selected)} disabled={acting}
                    className="w-full py-2.5 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                    {acting ? 'กำลังยืนยัน...' : '✓ ยืนยันส่งถึงแล้ว (แจ้งลูกค้า)'}
                  </button>
                </div>
              )}

              {selected.paid_at && (
                <p className="text-xs font-mono text-center" style={{ color: '#1A6B3C' }}>
                  ✓ ยืนยันชำระเมื่อ {new Date(selected.paid_at).toLocaleString('th-TH')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
