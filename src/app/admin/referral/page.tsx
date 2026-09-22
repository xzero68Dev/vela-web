'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import { adminHeaders, onAdminUnauthorized } from '@/components/auth'
import AdminNav from '@/components/AdminNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type Payout = {
  referrer_phone: string
  total: number
  count: number
  promptpay?: string
  name?: string
  ref_code?: string
  payable?: boolean
}

const baht = (v: any) => `฿${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export default function ReferralPayoutsPage() {
  const ready = useAdminAuth()
  const [rows, setRows]     = useState<Payout[]>([])
  const [grand, setGrand]   = useState(0)
  const [minPayout, setMin] = useState(300)
  const [loading, setLoad]  = useState(true)
  const [paying, setPaying] = useState('')
  const [msg, setMsg]       = useState('')

  const load = useCallback(async () => {
    setLoad(true); setMsg('')
    try {
      const res = await fetch(`${API}/admin/referral/payouts`, { headers: adminHeaders() })
      if (onAdminUnauthorized(res)) return
      const d = await res.json().catch(() => ({}))
      setRows(Array.isArray(d.rows) ? d.rows : [])
      setGrand(Number(d.grand_total || 0))
      setMin(Number(d.min_payout || 300))
    } catch { setRows([]) }
    finally { setLoad(false) }
  }, [])
  useEffect(() => { if (ready) load() }, [ready, load])

  const markPaid = async (p: Payout) => {
    if (!confirm(`ยืนยันว่าโอนคอม ${baht(p.total)} ให้ ${p.name || p.referrer_phone} แล้ว?\n(พร้อมเพย์: ${p.promptpay || p.referrer_phone})\nจะเปลี่ยนสถานะเป็น "จ่ายแล้ว" ทั้งหมด`)) return
    setPaying(p.referrer_phone); setMsg('')
    try {
      const res = await fetch(`${API}/admin/referral/mark-paid`, {
        method: 'POST', headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ referrer_phone: p.referrer_phone }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.detail || 'error')
      setMsg(`✓ mark paid ${p.name || p.referrer_phone} แล้ว (${d.marked} รายการ)`)
      setRows(rs => rs.filter(r => r.referrer_phone !== p.referrer_phone))
    } catch (e: unknown) {
      setMsg(`✗ ${e instanceof Error ? e.message : 'ไม่สำเร็จ'}`)
    } finally { setPaying('') }
  }

  const exportCsv = () => {
    const header = ['ชื่อ', 'เบอร์ผู้แนะนำ', 'PromptPay', 'ref_code', 'จำนวนรายการ', 'ยอดโอน (฿)', 'ถึงขั้นต่ำ']
    const lines = rows.map(r => [
      r.name || '', r.referrer_phone, r.promptpay || r.referrer_phone, r.ref_code || '',
      r.count, Number(r.total || 0).toFixed(2), r.payable ? 'ใช่' : 'ยังไม่ถึง',
    ])
    const csv = [header, ...lines].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    // BOM ให้ Excel อ่านภาษาไทยถูก
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ym = new Date().toISOString().slice(0, 7)
    a.href = url; a.download = `VeLA_referral_payouts_${ym}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (!ready) return null

  const payableTotal = rows.filter(r => r.payable).reduce((s, r) => s + Number(r.total || 0), 0)

  return (
    <main className="min-h-screen px-5 py-8" style={{ background: '#EDE8DF' }}>
      <div className="max-w-4xl mx-auto">
        <AdminNav />

        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
            คอมผู้แนะนำ — รอโอน
          </h2>
          <button onClick={load} disabled={loading}
            className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono transition-all disabled:opacity-50"
            style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>{loading ? '...' : 'รีเฟรช'}</button>
          <button onClick={exportCsv} disabled={rows.length === 0}
            className="px-3 py-1.5 rounded-xl border-2 text-xs font-mono transition-all disabled:opacity-40"
            style={{ borderColor: '#2E75B6', color: '#2E75B6', background: '#F0F6FC' }}>⬇️ Export CSV</button>
        </div>
        <p className="text-xs font-mono mb-5" style={{ color: '#8C7B6E' }}>
          ยอดที่ยืนยันแล้ว (confirmed) รอโอนสิ้นเดือน · ขั้นต่ำ {baht(minPayout)} (ต่ำกว่านี้ยกไปเดือนถัดไป) · โอนแล้วกดปุ่ม "โอนแล้ว" เพื่อ mark paid
        </p>

        {msg && <p className="text-sm font-mono mb-4" style={{ color: msg.startsWith('✓') ? '#1A6B3C' : '#D64B2A' }}>{msg}</p>}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'ผู้แนะนำมียอด', value: String(rows.length), color: '#3D1F0F' },
            { label: 'ยอดรวมทั้งหมด', value: baht(grand), color: '#8C7B6E' },
            { label: 'ถึงขั้นต่ำ (พร้อมโอน)', value: baht(payableTotal), color: '#1A6B3C' },
          ].map(c => (
            <div key={c.label} className="rounded-2xl border-2 p-3 text-center" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: c.color }}>{c.value}</p>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{c.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="text-sm font-mono text-center py-10" style={{ color: '#C5BAB0' }}>กำลังโหลด...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border-2 p-12 text-center" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <p className="text-sm font-mono" style={{ color: '#C5BAB0' }}>ยังไม่มีคอมที่รอโอน</p>
          </div>
        ) : (
          <div className="rounded-2xl border-2 overflow-x-auto" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <table className="w-full text-sm" style={{ color: '#3D1F0F', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#2E75B6', color: '#fff' }}>
                  {['ผู้แนะนำ', 'PromptPay', 'รายการ', 'ยอดโอน', 'สถานะ', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-mono whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.referrer_phone} style={{ background: i % 2 ? '#DBE5F1' : 'transparent' }}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-bold">{r.name || '(ไม่มีชื่อ)'}</div>
                      <div className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{r.referrer_phone} · {r.ref_code}</div>
                    </td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: '#8C7B6E' }}>{r.promptpay || r.referrer_phone}</td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap">{r.count}</td>
                    <td className="px-3 py-2 font-mono font-bold whitespace-nowrap" style={{ color: '#1A6B3C' }}>{baht(r.total)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.payable
                        ? <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: '#C5E8D5', color: '#1A6B3C' }}>พร้อมโอน</span>
                        : <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: '#E0D9CE', color: '#8C7B6E' }}>ยังไม่ถึงขั้นต่ำ</span>}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button onClick={() => markPaid(r)} disabled={paying === r.referrer_phone}
                        className="px-3 py-1.5 rounded-lg text-xs font-black uppercase active:scale-95 disabled:opacity-50"
                        style={{ fontFamily: 'var(--font-display)', background: '#1C7A46', color: '#fff' }}>
                        {paying === r.referrer_phone ? '...' : 'โอนแล้ว'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs font-mono mt-3" style={{ color: '#C5BAB0' }}>
          * ยอดนี้คือคอมที่ผ่าน 7 วันแล้ว (confirmed) — คอมใหม่ที่ยัง "รอครบ 7 วัน" (pending) จะยังไม่ขึ้นที่นี่จนกว่าจะครบกำหนด
        </p>
      </div>
    </main>
  )
}
