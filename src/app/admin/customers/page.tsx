'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const API       = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

type Customer = {
  id: number
  phone: string | null
  name: string | null
  display_name: string | null
  notify_channel: string | null
  vip_discount_pct: number
  first_order_used: boolean
  has_line: boolean
  created_at: string
}

export default function CustomersPage() {
  const ready = useAdminAuth()
  const [q, setQ]           = useState('')
  const [rows, setRows]     = useState<Customer[]>([])
  const [loading, setLoad]  = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [draft, setDraft]   = useState<Record<number, number>>({})
  const [msg, setMsg]       = useState('')

  const load = useCallback(async (query = '') => {
    setLoad(true)
    try {
      const res  = await fetch(`${API}/admin/customers?q=${encodeURIComponent(query)}`, {
        headers: { 'x-api-key': ADMIN_KEY },
      })
      const data = await res.json()
      const list: Customer[] = data.customers || []
      setRows(list)
      setDraft(Object.fromEntries(list.map(c => [c.id, c.vip_discount_pct || 0])))
    } catch { setRows([]) }
    finally { setLoad(false) }
  }, [])

  useEffect(() => { if (ready) load('') }, [ready, load])

  const saveVip = async (c: Customer) => {
    const pct = Math.max(0, Math.min(100, Math.round(draft[c.id] ?? 0)))
    setSaving(c.id); setMsg('')
    try {
      const res = await fetch(`${API}/admin/customers/vip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ id: c.id, vip_discount_pct: pct }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'error')
      setRows(rs => rs.map(r => r.id === c.id ? { ...r, vip_discount_pct: pct } : r))
      setMsg(`✓ บันทึก VIP ${pct}% ให้ ${c.name || c.display_name || c.phone} แล้ว`)
    } catch (e: unknown) {
      setMsg(`✗ ${e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ'}`)
    } finally { setSaving(null) }
  }

  if (!ready) return null

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <AdminNav />

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#3B2B23' }}>จัดการลูกค้า</h2>
        <p style={{ fontSize: 13, color: '#8C7B6E' }}>
          ตั้ง % ส่วนลด VIP ต่อคน (ไม่มีเพดาน) — ระบบเลือกส่วนลดที่มากกว่าเทียบกับโปรลูกค้าใหม่ 50%
        </p>
      </div>

      <form onSubmit={e => { e.preventDefault(); load(q) }}
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="ค้นหาเบอร์ / ชื่อลูกค้า"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '2px solid #D8D0C5', fontSize: 14 }} />
        <button type="submit"
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#D64B2A', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          ค้นหา
        </button>
      </form>

      {msg && (
        <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13,
          background: msg.startsWith('✓') ? '#E6F4EA' : '#FDE8E4',
          color: msg.startsWith('✓') ? '#1C7A46' : '#B23A2A' }}>{msg}</div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#8C7B6E', padding: 40 }}>กำลังโหลด...</p>
      ) : rows.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#8C7B6E', padding: 40 }}>ไม่พบลูกค้า</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(c => {
            const changed = (draft[c.id] ?? 0) !== (c.vip_discount_pct || 0)
            return (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                background: '#fff', border: '1px solid #EAE3D9', borderRadius: 12, padding: '12px 14px',
              }}>
                <div style={{ flex: '1 1 220px', minWidth: 200 }}>
                  <div style={{ fontWeight: 700, color: '#3B2B23' }}>
                    {c.name || c.display_name || '(ไม่มีชื่อ)'}
                    {c.vip_discount_pct > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, color: '#B8860B',
                        background: '#FFF6DA', border: '1px solid #E6C24A', borderRadius: 6, padding: '1px 7px' }}>
                        VIP {c.vip_discount_pct}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#8C7B6E', fontFamily: 'monospace' }}>
                    {c.phone || '-'}
                    {c.has_line && <span style={{ marginLeft: 8, color: '#06C755' }}>● LINE</span>}
                    {!c.has_line && <span style={{ marginLeft: 8, color: '#B0A79B' }}>● SMS</span>}
                    {c.first_order_used && <span style={{ marginLeft: 8, color: '#B0A79B' }}>ใช้โปรใหม่แล้ว</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="number" min={0} max={100} value={draft[c.id] ?? 0}
                    onChange={e => setDraft(d => ({ ...d, [c.id]: parseInt(e.target.value || '0', 10) }))}
                    style={{ width: 72, padding: '8px 10px', borderRadius: 8, border: '2px solid #D8D0C5',
                      fontSize: 15, textAlign: 'center', fontWeight: 700 }} />
                  <span style={{ color: '#8C7B6E', fontWeight: 700 }}>%</span>
                  <button onClick={() => saveVip(c)} disabled={!changed || saving === c.id}
                    style={{ padding: '8px 14px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13,
                      cursor: changed ? 'pointer' : 'default',
                      background: changed ? '#1C7A46' : '#E0DAD0', color: changed ? '#fff' : '#9C9388' }}>
                    {saving === c.id ? '...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
