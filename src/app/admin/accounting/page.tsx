'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API       = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

type Acc = {
  order_id: string; order_date: string; customer: string; status?: string
  revenue?: number; shopee_fee?: number; shipping?: number
  coffee_cost?: number; packaging?: number; other?: number; net_profit?: number
}

const PAID = new Set(['ชำระแล้ว', 'จัดส่งแล้ว', 'จัดส่งสำเร็จ'])
const n = (v: any) => Number(v || 0)
const baht = (v: any) => `฿${n(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

export default function AdminAccountingPage() {
  const ready = useAdminAuth()
  const [rows,    setRows]    = useState<Acc[]>([])
  const [loading, setLoading] = useState(true)
  const [month,   setMonth]   = useState('')          // '' = ทั้งหมด, หรือ 'YYYY-MM'
  const [paidOnly, setPaidOnly] = useState(true)
  const [tick,    setTick]    = useState(0)
  const [busy,    setBusy]    = useState(false)

  const backfill = async () => {
    if (!confirm('คำนวณต้นทุน/กำไรย้อนหลังให้ออเดอร์เว็บที่ยังไม่มี?\n(ออเดอร์ที่คำนวณไว้แล้วจะไม่ถูกแตะ)')) return
    setBusy(true)
    try {
      const res = await fetch(`${API}/admin/backfill-web-accounting`, { method: 'POST', headers: { 'x-api-key': ADMIN_KEY } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { alert('ทำย้อนหลังไม่สำเร็จ'); return }
      alert(`เสร็จ — คำนวณย้อนหลัง ${data.count ?? 0} ออเดอร์`)
      setTick(t => t + 1)
    } finally { setBusy(false) }
  }

  useEffect(() => {
    if (!ready) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/web-accounting`, { headers: { 'x-api-key': ADMIN_KEY } })
        const data = await res.json().catch(() => ({}))
        setRows(Array.isArray(data.rows) ? data.rows : [])
      } catch {}
      finally { setLoading(false) }
    })()
  }, [ready, tick])

  const months = useMemo(() => {
    const s = new Set<string>()
    rows.forEach(r => { if (r.order_date) s.add(String(r.order_date).slice(0, 7)) })
    return Array.from(s).sort().reverse()
  }, [rows])

  const filtered = useMemo(() => rows.filter(r => {
    if (month && String(r.order_date).slice(0, 7) !== month) return false
    if (paidOnly && !PAID.has(r.status || '')) return false
    return true
  }), [rows, month, paidOnly])

  const sum = useMemo(() => {
    const t = { orders: filtered.length, revenue: 0, coffee: 0, packaging: 0, shipping: 0, net: 0 }
    filtered.forEach(r => {
      t.revenue   += n(r.revenue)
      t.coffee    += n(r.coffee_cost)
      t.packaging += n(r.packaging)
      t.shipping  += n(r.shipping)
      t.net       += n(r.net_profit)
    })
    return t
  }, [filtered])

  const margin = sum.revenue > 0 ? (sum.net / sum.revenue) * 100 : 0

  if (!ready) return null

  return (
    <main className="min-h-screen px-5 py-8" style={{ background: '#EDE8DF' }}>
      <div className="max-w-6xl mx-auto">
        <AdminNav />

        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
            บัญชีออเดอร์เว็บ
          </h2>
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 text-sm font-mono"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }}>
            <option value="">ทุกเดือน</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={() => setPaidOnly(v => !v)}
            className="px-3 py-1.5 rounded-xl border-2 text-sm font-mono transition-all"
            style={paidOnly ? { background: '#D64B2A', borderColor: '#D64B2A', color: '#EDE8DF' }
                            : { background: 'transparent', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
            {paidOnly ? '✓ เฉพาะชำระแล้ว' : 'รวมค้างชำระ'}
          </button>
          <button onClick={backfill} disabled={busy}
            className="px-3 py-1.5 rounded-xl border-2 text-sm font-mono transition-all disabled:opacity-50"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
            {busy ? 'กำลังคำนวณ...' : '🧮 คำนวณต้นทุน/กำไรย้อนหลัง'}
          </button>
        </div>

        {loading ? (
          <p className="text-sm font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</p>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
              {[
                { label: 'ออเดอร์', value: sum.orders.toString(), color: '#3D1F0F' },
                { label: 'รายรับ', value: baht(sum.revenue), color: '#1A6B3C' },
                { label: 'ต้นทุนกาแฟ', value: baht(sum.coffee), color: '#8C7B6E' },
                { label: 'แพ็กเกจ', value: baht(sum.packaging), color: '#8C7B6E' },
                { label: 'ค่าส่ง', value: baht(sum.shipping), color: '#8C7B6E' },
                { label: 'กำไรสุทธิ', value: baht(sum.net), color: '#D64B2A' },
                { label: 'Margin', value: `${margin.toFixed(1)}%`, color: '#D64B2A' },
              ].map(c => (
                <div key={c.label} className="rounded-2xl p-3 text-center border-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                  <p className="text-base font-black leading-tight" style={{ fontFamily: 'var(--font-display)', color: c.color }}>{c.value}</p>
                  <p className="text-xs font-mono leading-tight" style={{ color: '#8C7B6E' }}>{c.label}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border-2 overflow-x-auto" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <table className="w-full text-xs" style={{ color: '#3D1F0F' }}>
                <thead>
                  <tr style={{ background: '#2E75B6', color: '#fff' }}>
                    {['วันที่', 'Order ID', 'ลูกค้า', 'สถานะ', 'รายรับ', 'กาแฟ', 'แพ็กเกจ', 'ค่าส่ง', 'กำไรสุทธิ'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-mono whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.order_id} style={{ background: i % 2 ? '#DBE5F1' : 'transparent' }}>
                      <td className="px-3 py-2 font-mono whitespace-nowrap">{r.order_date}</td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap">{r.order_id}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.customer}</td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: PAID.has(r.status || '') ? '#1A6B3C' : '#C5BAB0' }}>
                        {r.status || '-'}
                      </td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap">{baht(r.revenue)}</td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: '#8C7B6E' }}>{baht(r.coffee_cost)}</td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: '#8C7B6E' }}>{baht(r.packaging)}</td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: '#8C7B6E' }}>{baht(r.shipping)}</td>
                      <td className="px-3 py-2 font-mono font-bold whitespace-nowrap" style={{ color: n(r.net_profit) >= 0 ? '#1A6B3C' : '#D64B2A' }}>{baht(r.net_profit)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-8 text-center font-mono" style={{ color: '#C5BAB0' }}>ยังไม่มีข้อมูล</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs font-mono mt-3" style={{ color: '#C5BAB0' }}>
              * รายรับ = ยอดที่ลูกค้าจ่ายจริง · ต้นทุนกาแฟ/แพ็กเกจคำนวณจากสูตรร้าน · ค่าส่งอัปเดตเมื่อใส่เลขพัสดุ · กำไรสุทธิ = รายรับ − กาแฟ − แพ็กเกจ − ค่าส่ง
            </p>
          </>
        )}
      </div>
    </main>
  )
}
