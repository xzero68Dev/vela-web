'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const SB_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API       = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
const PAGE_SIZE = 20

type Order = {
  order_id: string; order_date: string; ship_date?: string
  customer: string; phone: string; province: string; zip?: string
  full_address: string; sku: string; qty: number
  channel: string; status: string
  slip_url?: string; paid_at?: string; note?: string; total?: number
  preferred_carrier?: string
}
type ShipInfo = { tracking?: string; carrier?: string }

const CARRIER_CHIP: Record<string, { label: string; bg: string; fg: string }> = {
  flash: { label: '⚡ Flash',    bg: '#FEF3C7', fg: '#B45309' },
  post:  { label: '📮 ไปรษณีย์', bg: '#FEE2E2', fg: '#B91C1C' },
  kex:   { label: '📦 KEX',      bg: '#FFEDD5', fg: '#C2410C' },
  self:  { label: '🚚 ส่งเอง',   bg: '#E2E8F0', fg: '#475569' },
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
  return <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: c.bg, color: c.text }}>{status}</span>
}

export default function AdminOrdersPage() {
  const ready = useAdminAuth()
  const [orders,    setOrders]    = useState<Order[]>([])
  const [shipping,  setShipping]  = useState<Record<string, ShipInfo>>({})
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState<'web' | 'shopee'>('web')
  const [carrierFilter, setCarrierFilter] = useState<'all' | 'flash' | 'post' | 'kex' | 'self'>('all')
  const [selected,  setSelected]  = useState<Order | null>(null)
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [sortBy,    setSortBy]    = useState<'created_at' | 'order_date'>('created_at')
  const [page,      setPage]      = useState(1)
  const [shipForm,  setShipForm]  = useState({ tracking: '', carrier: 'POST SABUY', cost: '', weight: '' })
  const [acting,    setActing]    = useState(false)
  const [printSel,  setPrintSel]  = useState<Set<string>>(new Set())
  const [updated,   setUpdated]   = useState('')
  const [sendSms,   setSendSms]   = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/orders?order=${sortBy}.desc&limit=1000&select=order_id,order_date,ship_date,customer,phone,province,zip,full_address,sku,qty,channel,status,slip_url,paid_at,note,total,preferred_carrier`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
      )
      const list = await res.json()
      if (!Array.isArray(list)) { setLoading(false); return }
      setOrders(list)
      if (list.length) {
        const ids = list.map((o: Order) => o.order_id)
        const sRes = await fetch(
          `${SB_URL}/rest/v1/shipping?order_id=in.(${ids.join(',')})&select=order_id,tracking,carrier`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
        )
        const sData = await sRes.json()
        const map: Record<string, ShipInfo> = {}
        if (Array.isArray(sData)) sData.forEach((s: any) => { map[s.order_id] = { tracking: s.tracking, carrier: s.carrier } })
        setShipping(map)
      }
      setUpdated(new Date().toLocaleTimeString('th-TH'))
    } finally { setLoading(false) }
  }, [sortBy])

  useEffect(() => { if (ready) fetchOrders() }, [ready, fetchOrders])
  useEffect(() => { setPage(1) }, [tab, carrierFilter, search, statusFilter])

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

  const sendPaymentSms = async (o: Order) => {
    const ph = (o.phone || '').trim()
    if (!ph || ph === '-' || ph.length < 9) { alert('ออเดอร์นี้ไม่มีเบอร์โทรที่ส่ง SMS ได้'); return }
    if (!confirm(`ส่ง SMS แจ้งชำระเงินไปที่ ${ph}?\n(มีค่าส่ง SMS ต่อครั้ง)`)) return
    setActing(true)
    try {
      const res  = await fetch(`${API}/admin/send-payment-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ order_id: o.order_id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { alert(`ส่ง SMS ไม่สำเร็จ: ${data.detail || 'error'}`); return }
      alert(`✅ ส่ง SMS แจ้งชำระเงินไปที่ ${data.phone || ph} แล้ว`)
    } finally { setActing(false) }
  }

  const togglePrint = (id: string) => setPrintSel(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })
  const printSelected = () => {
    if (!printSel.size) return
    window.open(`/admin/labels/print?ids=${Array.from(printSel).join(',')}`, '_blank')
  }

  const addShipping = async (o: Order) => {
    if (!shipForm.tracking.trim() && shipForm.carrier !== 'ส่งเอง') { alert('กรุณาใส่เลข tracking'); return }
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/add-shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({
          order_id: o.order_id,
          tracking: shipForm.tracking.trim().toUpperCase(),
          carrier:  shipForm.carrier,
          shipping_cost: shipForm.cost.trim() ? Number(shipForm.cost) : undefined,
          weight_g:      shipForm.weight.trim() ? Number(shipForm.weight) : undefined,
        }),
      })
      if (!res.ok) { alert(`เพิ่มการจัดส่งไม่สำเร็จ: ${await res.text()}`); return }
      setShipForm({ tracking: '', carrier: 'POST SABUY', cost: '', weight: '' })
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'จัดส่งแล้ว' } : null)
    } finally { setActing(false) }
  }

  const fixTracking = async (orderId: string, current?: string) => {
    const nt = window.prompt(`แก้เลขพัสดุ ${orderId}\nเลขปัจจุบัน: ${current || '-'}\n\nใส่เลขพัสดุที่ถูกต้อง:`, current || '')
    if (nt === null) return
    const tracking = nt.trim().toUpperCase()
    if (!tracking) { alert('ต้องใส่เลขพัสดุ'); return }
    if (tracking === (current || '').toUpperCase()) { alert('เลขเดิม ไม่ได้เปลี่ยน'); return }
    if (!confirm(`แก้เลขพัสดุเป็น ${tracking}?\nระบบจะยิงแจ้งเตือนเลขใหม่ให้ลูกค้าด้วย`)) return
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/fix-tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ order_id: orderId, tracking }),
      })
      const d = await res.json()
      if (!res.ok) { alert(`แก้ไม่สำเร็จ: ${d.detail || 'error'}`); return }
      const via = d.notified_via === 'line' ? 'LINE' : d.notified_via === 'sms' ? 'SMS' : 'ไม่ได้แจ้ง'
      alert(`✓ แก้เป็น ${d.new_tracking} (${d.carrier})\nแจ้งลูกค้าทาง: ${via}`)
      await fetchOrders()
    } finally { setActing(false) }
  }

  const confirmDelivered = async (o: Order, notify: boolean) => {
    if (!confirm(`ยืนยันว่าพัสดุ ${o.customer} ส่งถึงแล้ว?${notify ? '\nระบบจะแจ้ง SMS/LINE ลูกค้าทันที' : '\n(ไม่ส่ง SMS)'}`)) return
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/confirm-delivered?order_id=${encodeURIComponent(o.order_id)}&notify=${notify}`, {
        method: 'POST', headers: { 'x-api-key': ADMIN_KEY },
      })
      if (!res.ok) { alert(`ยืนยันไม่สำเร็จ: ${await res.text()}`); return }
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status: 'จัดส่งสำเร็จ' } : null)
    } finally { setActing(false) }
  }

  const syncStatus = async () => {
    if (!confirm('Sync สถานะออเดอร์ให้ตรงกับพัสดุที่ส่งถึงแล้ว?\n(ออเดอร์ที่พัสดุ delivered แล้วจะอัปเดตเป็น "จัดส่งสำเร็จ")')) return
    setActing(true)
    try {
      const res = await fetch(`${API}/admin/sync-order-status`, {
        method: 'POST', headers: { 'x-api-key': ADMIN_KEY },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { alert('Sync ไม่สำเร็จ'); return }
      await fetchOrders()
      alert(`Sync เสร็จ — อัปเดต ${data.count ?? 0} ออเดอร์`)
    } finally { setActing(false) }
  }

  // carrier detection — อิงชื่อ carrier + เลข tracking (Flash = TH, KEX = SXF, POST = JM)
  const getCarrier = (o: Order) => {
    const c = (shipping[o.order_id]?.carrier || '').toUpperCase()
    const t = (shipping[o.order_id]?.tracking || '').toUpperCase()
    if (c.includes('FLASH') || t.startsWith('TH')) return 'flash'
    if (c.includes('POST') || c.includes('SABUY') || t.startsWith('JM')) return 'post'
    if (c.includes('KEX') || c.includes('KERRY') || t.startsWith('SXF')) return 'kex'
    return 'self'
  }

  const webOrders    = orders.filter(o => o.channel === 'web')
  const shopeeOrders = orders.filter(o => o.channel !== 'web')
  const shopeeFiltered = carrierFilter === 'all' ? shopeeOrders
    : shopeeOrders.filter(o => getCarrier(o) === carrierFilter)

  const flashCount = shopeeOrders.filter(o => getCarrier(o) === 'flash').length
  const postCount  = shopeeOrders.filter(o => getCarrier(o) === 'post').length
  const kexCount   = shopeeOrders.filter(o => getCarrier(o) === 'kex').length
  const selfCount  = shopeeOrders.filter(o => getCarrier(o) === 'self').length

  const baseList = tab === 'web' ? webOrders : shopeeFiltered
  const statusOptions = ['ทั้งหมด', ...Array.from(new Set(baseList.map(o => o.status)))]
  const filtered = baseList
    .filter(o => statusFilter === 'ทั้งหมด' || o.status === statusFilter)
    .filter(o => !search || o.customer?.includes(search) || o.order_id?.includes(search) || o.phone?.includes(search) || o.sku?.includes(search))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const webStats = [
    { label: 'รอชำระ',    status: 'รอชำระเงิน',   value: webOrders.filter(o => o.status === 'รอชำระเงิน').length },
    { label: 'ชำระแล้ว',  status: 'ชำระแล้ว',     value: webOrders.filter(o => o.status === 'ชำระแล้ว').length },
    { label: 'จัดส่งแล้ว',status: 'จัดส่งแล้ว',   value: webOrders.filter(o => o.status === 'จัดส่งแล้ว').length },
    { label: 'สำเร็จ',    status: 'จัดส่งสำเร็จ', value: webOrders.filter(o => o.status === 'จัดส่งสำเร็จ').length },
  ]

  if (!ready) return null
  const ship = selected ? shipping[selected.order_id] : null

  return (
    <main className="min-h-screen pb-20" style={{ background: '#EDE8DF' }}>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-black text-xl uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>Orders</h1>
          <div className="flex items-center gap-2">
            {loading && <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#D64B2A', borderTopColor: 'transparent' }} />}
            <button onClick={fetchOrders} className="text-xs px-3 py-1.5 rounded-xl border-2 font-mono"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>↺ {updated}</button>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex gap-2 mb-4">
          {([['web', `🌐 เว็บ (${webOrders.length})`], ['shopee', `🟠 Shopee (${shopeeOrders.length})`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setStatusFilter('ทั้งหมด') }}
              className="px-4 py-2 rounded-xl border-2 text-sm font-mono transition-all"
              style={tab === t ? { background: '#D64B2A', borderColor: '#D64B2A', color: '#EDE8DF' }
                              : { background: 'transparent', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Web stats */}
        {tab === 'web' && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {webStats.map(({ label, status, value }) => (
              <div key={label} className="rounded-2xl p-3 text-center border-2 cursor-pointer transition-all"
                onClick={() => setStatusFilter(prev => prev === status ? 'ทั้งหมด' : status)}
                style={{ background: statusFilter === status ? '#D64B2A10' : '#F5F1EB', borderColor: statusFilter === status ? '#D64B2A' : '#E0D9CE' }}>
                <p className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>{value}</p>
                <p className="text-xs font-mono leading-tight" style={{ color: '#8C7B6E' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ปุ่ม sync สถานะ (web) */}
        {tab === 'web' && (
          <div className="mb-4">
            <button onClick={syncStatus} disabled={acting}
              className="text-xs font-mono px-3 py-2 rounded-xl border-2 transition-all active:scale-95 disabled:opacity-50"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E', background: '#F5F1EB' }}>
              🔄 Sync สถานะจากพัสดุ
            </button>
          </div>
        )}

        {/* Shopee carrier filter */}
        {tab === 'shopee' && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {([
              ['all',   `ทั้งหมด (${shopeeOrders.length})`],
              ['flash', `⚡ Flash (${flashCount})`],
              ['post',  `📮 ThaiPost (${postCount})`],
              ['kex',   `📦 KEX (${kexCount})`],
              ['self',  `🚚 ส่งเอง (${selfCount})`],
            ] as const).map(([t, label]) => (
              <button key={t} onClick={() => { setCarrierFilter(t); setPage(1) }}
                className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono transition-all"
                style={carrierFilter === t
                  ? { background: '#3D1F0F', borderColor: '#3D1F0F', color: '#EDE8DF' }
                  : { background: 'transparent', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหา ชื่อ / Order / เบอร์ / SKU"
            className="flex-1 px-3 py-2 rounded-xl border-2 text-xs focus:outline-none"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border-2 text-xs font-mono"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }}>
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border-2 text-xs font-mono"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }}>
            <option value="created_at">ล่าสุด</option>
            <option value="order_date">วันที่สั่ง</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-3 gap-2">
          <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>
            แสดง {paginated.length} จาก {filtered.length} รายการ · หน้า {page}/{totalPages}
          </p>
          {(() => {
            const webIds = filtered.filter(o => o.channel === 'web').map(o => o.order_id)
            if (!webIds.length) return null
            const allOn = webIds.every(id => printSel.has(id))
            return (
              <button onClick={() => setPrintSel(prev => {
                const n = new Set(prev)
                if (allOn) webIds.forEach(id => n.delete(id))
                else webIds.forEach(id => n.add(id))
                return n
              })}
                className="text-xs font-mono px-3 py-1.5 rounded-lg border-2 flex-shrink-0 transition-all"
                style={allOn
                  ? { background: '#3D1F0F', borderColor: '#3D1F0F', color: '#EDE8DF' }
                  : { background: 'transparent', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                {allOn ? '☑' : '☐'} เลือกทั้งหมด ({webIds.length})
              </button>
            )
          })()}
        </div>

        {/* แถบพิมพ์ใบแปะหน้าหลายออเดอร์ */}
        {printSel.size > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border-2 flex-wrap"
            style={{ background: '#F5E6C0', borderColor: '#D4890A55' }}>
            <span className="text-xs font-mono font-bold" style={{ color: '#854F0B' }}>เลือกพิมพ์ {printSel.size} ออเดอร์</span>
            <button onClick={printSelected}
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase" style={{ background: '#D64B2A', color: '#fff' }}>
              🖨️ พิมพ์ใบแปะหน้า
            </button>
            <button onClick={() => setPrintSel(new Set())}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border-2" style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              ล้าง
            </button>
          </div>
        )}

        {/* Order list */}
        <div className="space-y-2 mb-4">
          {paginated.length === 0 && !loading && (
            <p className="text-center py-8 text-sm font-mono" style={{ color: '#C5BAB0' }}>ไม่มีรายการ</p>
          )}
          {paginated.map(o => {
            const s = shipping[o.order_id]
            const picked = printSel.has(o.order_id)
            return (
              <div key={o.order_id} className="flex items-stretch gap-2">
               {o.channel === 'web' && (
                 <button onClick={() => togglePrint(o.order_id)} title="เลือกพิมพ์ใบแปะหน้า"
                   className="flex-shrink-0 w-9 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all"
                   style={{ borderColor: picked ? '#3D1F0F' : '#E0D9CE', background: picked ? '#3D1F0F' : '#F5F1EB', color: picked ? '#EDE8DF' : '#C5BAB0' }}>
                   {picked ? '✓' : '☐'}
                 </button>
               )}
               <button
                onClick={() => { setSelected(o); setShipForm({ tracking: '', carrier: 'POST SABUY', cost: '', weight: '' }) }}
                className="flex-1 min-w-0 text-left rounded-2xl border-2 px-4 py-3 transition-all hover:shadow-sm active:scale-[0.99]"
                style={{
                  background: o.slip_url && o.status === 'รอชำระเงิน' ? '#FFF5F3' : '#F5F1EB',
                  borderColor: o.slip_url && o.status === 'รอชำระเงิน' ? '#D64B2A' : '#E0D9CE',
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-black text-sm" style={{ color: '#3D1F0F' }}>{o.customer}</p>
                      <Badge status={o.status} />
                      {(s?.carrier || s?.tracking) && (() => {
                        const chip = CARRIER_CHIP[getCarrier(o)]
                        return (
                          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{ background: chip.bg, color: chip.fg }}>{chip.label}</span>
                        )
                      })()}
                      {o.slip_url && o.status === 'รอชำระเงิน' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                          style={{ background: '#D64B2A', color: '#EDE8DF' }}>💳 มีสลิป!</span>
                      )}
                    </div>
                    <p className="text-xs font-mono truncate" style={{ color: '#8C7B6E' }}>{o.sku}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#C5BAB0' }}>
                      {o.order_id} · {o.order_date}
                      {s?.tracking && ` · ${s.tracking}`}
                      {s?.carrier && ` (${s.carrier})`}
                    </p>
                  </div>
                  {o.total ? (
                    <p className="font-black text-sm flex-shrink-0" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                      ฿{Number(o.total).toLocaleString()}
                    </p>
                  ) : null}
                </div>
               </button>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono disabled:opacity-30"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono disabled:opacity-30"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              return p <= totalPages ? (
                <button key={p} onClick={() => setPage(p)}
                  className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono"
                  style={page === p ? { background: '#D64B2A', borderColor: '#D64B2A', color: '#EDE8DF' }
                                    : { borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                  {p}
                </button>
              ) : null
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono disabled:opacity-30"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono disabled:opacity-30"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>»</button>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto" style={{ background: '#EDE8DF', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}>

            <div className="px-5 py-4 border-b-2 flex items-center justify-between sticky top-0 z-10"
              style={{ background: '#EDE8DF', borderColor: '#E0D9CE' }}>
              <div>
                <p className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
                  {selected.order_id}
                </p>
                <Badge status={selected.status} />
              </div>
              <button onClick={() => setSelected(null)} style={{ color: '#8C7B6E', fontSize: 22 }}>✕</button>
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Order info */}
              <div className="rounded-2xl border-2 divide-y-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                {[
                  { label: 'ลูกค้า',  value: selected.customer },
                  { label: 'เบอร์',   value: (!selected.phone || selected.phone.trim() === '-') ? 'ซ่อนโดย Shopee (Flash)' : selected.phone },
                  { label: 'ที่อยู่', value: [selected.full_address, selected.province, selected.zip].filter(Boolean).join(' ') },
                  { label: 'สินค้า',  value: selected.sku },
                  { label: 'วันที่',  value: selected.order_date },
                  ...(selected.preferred_carrier ? [{ label: 'ขนส่งที่ลูกค้าเลือก', value: selected.preferred_carrier === 'kex' ? 'KEX Express' : 'ไปรษณีย์ไทย EMS' }] : []),
                  ...(selected.note ? [{ label: 'หมายเหตุ', value: selected.note }] : []),
                  ...(ship?.tracking ? [{ label: 'Tracking', value: `${ship.carrier || ''} · ${ship.tracking}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3 px-4 py-2.5">
                    <p className="text-xs font-mono flex-shrink-0" style={{ color: '#C5BAB0' }}>{label}</p>
                    <p className="text-xs text-right" style={{ color: '#3D1F0F' }}>{value}</p>
                  </div>
                ))}
                {selected.total ? (
                  <div className="flex justify-between px-4 py-2.5">
                    <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ยอด</p>
                    <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                      ฿{Number(selected.total).toLocaleString()}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* พิมพ์ใบแปะหน้า/ใบแพ็ค (เฉพาะออเดอร์เว็บ) */}
              {selected.channel === 'web' && (
                <button onClick={() => window.open(`/admin/labels/print?ids=${selected.order_id}`, '_blank')}
                  className="w-full py-2.5 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 border-2"
                  style={{ fontFamily: 'var(--font-display)', borderColor: '#3D1F0F', color: '#3D1F0F', background: '#F5F1EB' }}>
                  🖨️ พิมพ์ใบแปะหน้า (มีรายการแพ็ค)
                </button>
              )}

              {/* Slip */}
              {selected.slip_url ? (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: '#C5BAB0' }}>สลิปการโอน</p>
                  <a href={selected.slip_url} target="_blank" rel="noopener noreferrer">
                    <img src={selected.slip_url} alt="slip" className="w-full rounded-2xl border-2 object-contain"
                      style={{ borderColor: '#E0D9CE', maxHeight: 280 }} />
                  </a>
                </div>
              ) : selected.status === 'รอชำระเงิน' ? (
                <p className="text-xs font-mono text-center" style={{ color: '#C5BAB0' }}>⏳ ยังไม่มีสลิปจากลูกค้า</p>
              ) : null}

              {/* Action: ยืนยันชำระ + ส่ง SMS แจ้งชำระเงิน */}
              {selected.channel === 'web' && selected.status === 'รอชำระเงิน' && (
                <div className="space-y-2">
                  <button onClick={() => confirmPayment(selected)} disabled={acting}
                    className="w-full py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                    {acting ? 'กำลังยืนยัน...' : '✓ ยืนยันการชำระเงิน'}
                  </button>
                  <button onClick={() => sendPaymentSms(selected)} disabled={acting}
                    className="w-full py-2.5 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40 border-2"
                    style={{ fontFamily: 'var(--font-display)', borderColor: '#1A5C8F', color: '#1A5C8F', background: '#F5F1EB' }}>
                    📩 ส่ง SMS แจ้งชำระเงิน
                  </button>
                </div>
              )}

              {/* มีเลขพัสดุแล้ว → ปุ่มแก้เลขพัสดุ (กรณีกรอกผิด) */}
              {ship?.tracking && ship.tracking !== '-' && (
                <div className="rounded-2xl border-2 p-4 flex items-center justify-between gap-3" style={{ background: '#EDE8DF', borderColor: '#E0D9CE' }}>
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>เลขพัสดุ</p>
                    <p className="text-sm font-mono truncate" style={{ color: '#3D1F0F' }}>{ship.tracking}{ship.carrier ? ` (${ship.carrier})` : ''}</p>
                  </div>
                  <button onClick={() => fixTracking(selected.order_id, ship?.tracking)} disabled={acting}
                    className="flex-shrink-0 px-4 py-2 rounded-xl font-black text-xs uppercase transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#B8860B', color: '#fff' }}>
                    ✏️ แก้เลขพัสดุ
                  </button>
                </div>
              )}

              {/* Action: เพิ่ม tracking */}
              {(
                (selected.channel === 'web' && selected.status === 'ชำระแล้ว') ||
                (selected.channel !== 'web' && !ship?.tracking)
              ) && (
                <div className="rounded-2xl border-2 p-4 space-y-3" style={{ background: '#EDE8DF', borderColor: '#E0D9CE' }}>
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>เพิ่มการจัดส่ง</p>
                  <select value={shipForm.carrier} onChange={e => setShipForm(s => ({ ...s, carrier: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 text-sm font-mono"
                    style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }}>
                    <option value="POST SABUY">POST SABUY</option>
                    <option value="KEX">KEX Express</option>
                    <option value="FLASH">Flash Express</option>
                    <option value="J&T">J&T Express</option>
                    <option value="SCG">SCG Express</option>
                    <option value="DHL">DHL</option>
                    <option value="ส่งเอง">🚚 ส่งเอง</option>
                  </select>
                  <input value={shipForm.tracking}
                    onChange={e => setShipForm(s => ({ ...s, tracking: e.target.value }))}
                    placeholder={shipForm.carrier === 'ส่งเอง' ? 'เลข Tracking (ถ้ามี)' : 'เลข Tracking'}
                    className="w-full px-3 py-2.5 rounded-xl border-2 text-sm font-mono uppercase"
                    style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
                  <div className="flex gap-2">
                    <input value={shipForm.cost} inputMode="decimal"
                      onChange={e => setShipForm(s => ({ ...s, cost: e.target.value.replace(/[^\d.]/g, '') }))}
                      placeholder="ค่าส่งจริง ฿ (ต้นทุน)"
                      className="flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-mono"
                      style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
                    <input value={shipForm.weight} inputMode="numeric"
                      onChange={e => setShipForm(s => ({ ...s, weight: e.target.value.replace(/\D/g, '') }))}
                      placeholder="น้ำหนัก (g)"
                      className="w-28 px-3 py-2.5 rounded-xl border-2 text-sm font-mono"
                      style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addShipping(selected)} disabled={acting || (!shipForm.tracking.trim() && shipForm.carrier !== 'ส่งเอง')}
                      className="flex-1 py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                      style={{ fontFamily: 'var(--font-display)', background: '#1A5C8F', color: '#EDE8DF' }}>
                      {acting ? 'กำลังบันทึก...' : '🚚 บันทึกการจัดส่ง'}
                    </button>
                    {selected.channel !== 'web' && !ship?.tracking && (
                      <button onClick={() => confirmDelivered(selected, sendSms)} disabled={acting}
                        className="flex-1 py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                        style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                        {acting ? '...' : '✓ ส่งถึงแล้ว'}
                      </button>
                    )}
                  </div>
                  {selected.channel !== 'web' && !ship?.tracking && (
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
                      style={{ background: '#F5F1EB' }}>
                      <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)}
                        className="w-4 h-4" />
                      <span className="text-xs font-mono" style={{ color: '#3D1F0F' }}>ส่ง SMS/LINE แจ้งลูกค้าด้วย</span>
                    </label>
                  )}
                </div>
              )}

              {/* Action: ยืนยันส่งสำเร็จ — แสดงสำหรับทุก order ที่ยังไม่ complete */}
              {selected.status === 'จัดส่งแล้ว' && (
                <div className="space-y-2">
                  {ship?.tracking && (
                    <a href={
                      (ship.tracking || '').toUpperCase().startsWith('TH')
                        ? `https://www.flashexpress.com/tracking/?se=${ship.tracking}`
                        : (ship.tracking || '').toUpperCase().startsWith('SXF')
                        ? 'https://th.kex-express.com/th/track/'
                        : `https://velacoldbrew.com/track/${ship.tracking}`
                    } target="_blank" rel="noopener noreferrer"
                      className="block w-full py-2.5 rounded-xl text-sm font-mono text-center border-2"
                      style={{ borderColor: '#1A5C8F', color: '#1A5C8F', background: '#F5F1EB' }}>
                      🔍 ดูสถานะ {ship.tracking}
                    </a>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
                    style={{ background: '#F5F1EB' }}>
                    <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)}
                      className="w-4 h-4" />
                    <span className="text-xs font-mono" style={{ color: '#3D1F0F' }}>ส่ง SMS/LINE แจ้งลูกค้าด้วย</span>
                  </label>
                  <button onClick={() => confirmDelivered(selected, sendSms)} disabled={acting}
                    className="w-full py-2.5 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                    {acting ? 'กำลังยืนยัน...' : `✓ ยืนยันส่งถึงแล้ว${sendSms ? ' (แจ้งลูกค้า)' : ''}`}
                  </button>
                </div>
              )}

              {/* Action: ยืนยันส่งสำเร็จสำหรับ Shopee ที่ status ยังไม่ใช่ จัดส่งแล้ว แต่มี tracking แล้ว */}
              {selected.channel !== 'web' && selected.status !== 'จัดส่งแล้ว' && selected.status !== 'จัดส่งสำเร็จ' && ship?.tracking && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
                    style={{ background: '#F5F1EB' }}>
                    <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)}
                      className="w-4 h-4" />
                    <span className="text-xs font-mono" style={{ color: '#3D1F0F' }}>ส่ง SMS/LINE แจ้งลูกค้าด้วย</span>
                  </label>
                  <button onClick={() => confirmDelivered(selected, sendSms)} disabled={acting}
                    className="w-full py-2.5 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#1A6B3C', color: '#EDE8DF' }}>
                    {acting ? 'กำลังยืนยัน...' : `✓ ยืนยันส่งถึงแล้ว${sendSms ? ' (แจ้งลูกค้า)' : ''}`}
                  </button>
                </div>
              )}

              {selected.paid_at && (
                <p className="text-xs font-mono text-center" style={{ color: '#1A6B3C' }}>
                  ✓ ยืนยันชำระเมื่อ {new Date(selected.paid_at).toLocaleString('th-TH')}
                </p>
              )}

              <div className="h-4" />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
