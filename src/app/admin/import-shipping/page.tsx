'use client'
import { useState } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import { adminHeaders } from '@/components/auth'
import AdminNav from '@/components/AdminNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type Order = { order_id: string; customer?: string; zip?: string }
type Item = {
  tracking: string; carrier: string; name: string; zip: string; weight_g?: number
  order_id: string | null; confidence: string; candidates: Order[]
}

const CONF: Record<string, { label: string; bg: string; color: string }> = {
  high:   { label: 'จับคู่แม่น',   bg: '#C5E8D5', color: '#1A6B3C' },
  name:   { label: 'ตรงชื่อ',      bg: '#F5E6C0', color: '#854F0B' },
  zip:    { label: 'ตรงซิป',       bg: '#F5E6C0', color: '#854F0B' },
  manual: { label: 'ต้องเลือกเอง', bg: '#F5D5CC', color: '#D64B2A' },
}

export default function ImportShippingPage() {
  const ready = useAdminAuth()
  const [items,   setItems]   = useState<Item[]>([])
  const [orders,  setOrders]  = useState<Order[]>([])
  const [sel,     setSel]     = useState<Record<number, string>>({})   // row index → order_id ('' = ข้าม)
  const [parsing, setParsing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [fileName, setFileName] = useState('')

  const onFile = async (f: File) => {
    if (!f) return
    setParsing(true); setMsg(''); setItems([]); setSel({}); setFileName(f.name)
    try {
      const fd = new FormData()
      fd.append('file', f)
      const res = await fetch(`${API}/admin/parse-shipping-bill`, {
        method: 'POST', headers: adminHeaders(), body: fd,   // อย่าตั้ง Content-Type เอง (ให้ browser ใส่ boundary)
      })
      if (!res.ok) {
        let d = await res.text(); try { d = JSON.parse(d).detail || d } catch {}
        throw new Error(d)
      }
      const data = await res.json()
      const its: Item[] = data.items || []
      setItems(its)
      setOrders(data.orders || [])
      const s: Record<number, string> = {}
      its.forEach((it, i) => { s[i] = it.order_id || '' })
      setSel(s)
      setMsg(`อ่านได้ ${data.count} รายการ · จับคู่อัตโนมัติ ${data.matched} รายการ`)
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally { setParsing(false) }
  }

  const submit = async () => {
    const payload = items
      .map((it, i) => ({ order_id: sel[i] || '', tracking: it.tracking, carrier: it.carrier }))
      .filter(x => x.order_id && x.tracking)
    if (payload.length === 0) { setMsg('❌ ยังไม่มีรายการที่จับคู่ออเดอร์'); return }
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API}/admin/apply-shipping-bill`, {
        method: 'POST', headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ items: payload }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setMsg(`✅ อัปเดตแล้ว ${data.applied.length} ออเดอร์ (พร้อมส่ง)` +
             (data.errors?.length ? ` · พลาด ${data.errors.length}` : ''))
      setItems([]); setSel({})
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally { setSaving(false) }
  }

  if (!ready) return null

  const matchedCount = items.filter((_, i) => sel[i]).length
  const inp = { borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }

  return (
    <main className="min-h-screen pb-20" style={{ background: '#EDE8DF' }}>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 pt-2">
        <h1 className="font-black text-xl uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
          นำเข้าเลขแทรกจากใบเสร็จขนส่ง
        </h1>
        <p className="text-xs font-mono mb-5" style={{ color: '#8C7B6E' }}>
          อัปโหลดไฟล์ใบเสร็จ ShipSmile (VeLA_WEB_BILL) → ระบบจับคู่เลขแทรกเข้าออเดอร์ที่ชำระแล้ว → กดยืนยัน = พร้อมส่ง (ค่าส่งไปใส่ในหน้าบัญชี)
        </p>

        {/* Upload */}
        <label className="block mb-4">
          <span className="inline-block px-5 py-3 rounded-2xl font-black uppercase text-sm cursor-pointer transition-all active:scale-95"
            style={{ fontFamily: 'var(--font-display)', background: '#3D1F0F', color: '#EDE8DF' }}>
            {parsing ? 'กำลังอ่านไฟล์...' : '📄 เลือกไฟล์ใบเสร็จ (PDF)'}
          </span>
          <input type="file" accept="application/pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
          {fileName && <span className="ml-3 text-xs font-mono" style={{ color: '#8C7B6E' }}>{fileName}</span>}
        </label>

        {msg && <p className="text-sm font-mono mb-4" style={{ color: msg.startsWith('❌') ? '#D64B2A' : '#1A6B3C' }}>{msg}</p>}

        {items.length > 0 && (
          <>
            <div className="rounded-2xl border-2 overflow-hidden mb-4" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: '#E8E4DE' }}>
                      {['เลขแทรก', 'ขนส่ง', 'ชื่อในบิล', 'ซิป', 'จับคู่ออเดอร์', 'สถานะ'].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-mono text-xs" style={{ color: '#8C7B6E' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => {
                      const c = CONF[it.confidence] || CONF.manual
                      return (
                        <tr key={i} style={{ borderTop: '1px solid #E0D9CE' }}>
                          <td className="px-3 py-2 font-mono text-xs" style={{ color: '#3D1F0F' }}>{it.tracking}</td>
                          <td className="px-3 py-2 font-mono text-xs" style={{ color: '#8C7B6E' }}>{it.carrier}</td>
                          <td className="px-3 py-2 text-xs" style={{ color: '#3D1F0F' }}>{it.name || '-'}</td>
                          <td className="px-3 py-2 font-mono text-xs" style={{ color: '#8C7B6E' }}>{it.zip}</td>
                          <td className="px-3 py-2">
                            <select value={sel[i] ?? ''} onChange={e => setSel(p => ({ ...p, [i]: e.target.value }))}
                              className="px-2 py-1.5 rounded-lg border-2 text-xs font-mono w-full" style={inp}>
                              <option value="">— ข้าม (ไม่ใส่) —</option>
                              {orders.map(o => (
                                <option key={o.order_id} value={o.order_id}>
                                  {(o.customer || '?')} · {o.zip || '-'} · {o.order_id}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-xs px-2 py-1 rounded-lg font-mono whitespace-nowrap"
                              style={{ background: sel[i] ? c.bg : '#E0D9CE', color: sel[i] ? c.color : '#8C7B6E' }}>
                              {sel[i] ? c.label : 'ข้าม'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={submit} disabled={saving || matchedCount === 0}
                className="px-6 py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                {saving ? 'กำลังบันทึก...' : `✓ ยืนยัน ${matchedCount} ออเดอร์ → พร้อมส่ง`}
              </button>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
                แถวสีแดง/ข้าม = จับคู่ไม่ได้ เลือกออเดอร์เองจาก dropdown หรือปล่อยข้ามไว้
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
