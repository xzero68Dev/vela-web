'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import LineLoginButton from '@/components/LineLoginButton'
import { authHeaders, onCustomerUnauthorized } from '@/lib/customerAuth'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

// สี/ฟอนต์ ตาม design system เดิมของเว็บ
const C = {
  bg: '#EDE8DF', card: '#F5F1EB', line: '#E0D9CE', ink: '#3D1F0F',
  accent: '#D64B2A', muted: '#8C7B6E', faint: '#C5BAB0', green: '#1A6B3C',
}
const AOV = 430          // ยอดเฉลี่ยต่อออเดอร์ (บาท)
const PER = Math.round(AOV * 0.10)   // 43 บาท/คน/เดือน

function StatBox({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl border-2 px-4 py-4 text-center" style={{ background: C.card, borderColor: C.line }}>
      <p className="font-black text-2xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: C.accent }}>{big}</p>
      <p className="text-xs font-mono mt-1" style={{ color: C.muted }}>{small}</p>
    </div>
  )
}

export default function ReferralPage() {
  const { user } = useAuth()
  const [n, setN] = useState(10)
  const [pp, setPp] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ link: string; code: string } | null>(null)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  const perMonth = useMemo(() => n * PER, [n])
  const perYear = perMonth * 12

  const register = async () => {
    setErr(''); setBusy(true)
    try {
      const res = await fetch(`${API}/referral/register`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ phone: user?.phone, line_user_id: user?.line_user_id, promptpay: pp || user?.phone }),
      })
      if (onCustomerUnauthorized(res)) return
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(data.detail || 'สมัครไม่สำเร็จ ลองใหม่อีกครั้ง'); return }
      setResult({ link: data.link, code: data.ref_code })
    } catch { setErr('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง') }
    finally { setBusy(false) }
  }

  const copy = () => {
    if (!result) return
    try { navigator.clipboard.writeText(result.link); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  const lineShare = () => {
    if (!result) return
    const msg = `ลองกาแฟสกัดเย็น VeLA ดูสิ 🐰 สั่งผ่านลิงก์นี้ลด 50% ออเดอร์แรกเลย ${result.link}`
    window.open(`https://line.me/R/share?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const btn: React.CSSProperties = {
    fontFamily: 'var(--font-display)', background: C.accent, color: C.bg,
  }

  return (
    <main className="min-h-screen" style={{ background: C.bg }}>
      <div className="max-w-lg mx-auto px-5 py-10">
        {/* กลับหน้าแรก */}
        <Link href="/" className="text-xs font-mono" style={{ color: C.muted }}>← กลับหน้าแรก</Link>

        {/* 1) Hero */}
        <section className="mt-6 mb-8 text-center">
          <h1 className="font-black text-3xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: C.ink }}>
            แชร์กาแฟที่คุณดื่มจริง<br />รับรายได้ทุกครั้งที่เพื่อนสั่ง
          </h1>
          <p className="text-sm mt-3" style={{ color: C.accent, fontWeight: 700 }}>— ตลอด 12 เดือน</p>
          <p className="text-sm mt-3" style={{ color: C.muted }}>
            สมัครฟรี ไม่ต้องสต็อกของ ไม่ต้องขายเอง แค่แชร์ลิงก์ของคุณ
          </p>
        </section>

        {/* 2) กล่องตัวเลข 3 บรรทัด */}
        <section className="grid grid-cols-3 gap-2 mb-8">
          <StatBox big="10%" small="ทุกออเดอร์ 12 เดือน" />
          <StatBox big="+30.-" small="โบนัส 5 คนแรก" />
          <StatBox big="PromptPay" small="โอนสิ้นเดือน (ขั้นต่ำ 300.-)" />
        </section>

        {/* 3) เครื่องคำนวณสไลเดอร์ */}
        <section className="rounded-3xl border-2 p-5 mb-8" style={{ background: C.card, borderColor: C.line }}>
          <p className="text-sm font-bold mb-1" style={{ color: C.ink }}>ลองคำนวณรายได้ของคุณ</p>
          <p className="text-xs font-mono mb-4" style={{ color: C.muted }}>เพื่อนที่สั่งประจำผ่านคุณ: <b style={{ color: C.accent }}>{n} คน</b></p>
          <input type="range" min={1} max={50} value={n} onChange={e => setN(Number(e.target.value))}
            className="w-full mb-4" style={{ accentColor: C.accent }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 text-center" style={{ background: C.bg }}>
              <p className="font-black text-2xl" style={{ fontFamily: 'var(--font-display)', color: C.green }}>฿{perMonth.toLocaleString()}</p>
              <p className="text-xs font-mono" style={{ color: C.muted }}>/ เดือน</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: C.bg }}>
              <p className="font-black text-2xl" style={{ fontFamily: 'var(--font-display)', color: C.green }}>฿{perYear.toLocaleString()}</p>
              <p className="text-xs font-mono" style={{ color: C.muted }}>/ ปี</p>
            </div>
          </div>
          <p className="text-xs font-mono mt-3 text-center" style={{ color: C.faint }}>
            ตัวอย่างการคำนวณ — รายได้จริงขึ้นกับยอดสั่งจริง
          </p>
        </section>

        {/* 4) ทำงานยังไง 3 ขั้น */}
        <section className="mb-8">
          <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>ทำงานยังไง</p>
          <div className="space-y-2">
            {[
              ['1', 'สมัครฟรี', 'กดปุ่มเดียว ใช้ LINE ที่มีอยู่ ได้ลิงก์ทันที'],
              ['2', 'แชร์ลิงก์ของคุณ', 'เพื่อนกดลิงก์แล้วสั่ง — เพื่อนได้ลด 50% ออเดอร์แรกด้วย'],
              ['3', 'รับรายได้', 'ทุกออเดอร์ของเพื่อน คุณได้ 10% ตลอด 12 เดือน'],
            ].map(([no, t, d]) => (
              <div key={no} className="flex gap-3 rounded-2xl border-2 p-3" style={{ background: C.card, borderColor: C.line }}>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: C.accent, color: C.bg }}>{no}</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.ink }}>{t}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3 text-center italic" style={{ color: C.muted }}>
            “คุณไม่ได้ขายของ คุณให้ส่วนลดเพื่อน”
          </p>
        </section>

        {/* 5) FAQ */}
        <section className="mb-8">
          <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>คำถามที่พบบ่อย</p>
          <div className="space-y-2">
            {[
              ['ต้องซื้อก่อนไหม?', 'ไม่ต้อง สมัครได้เลยฟรี ไม่มีเงื่อนไขต้องซื้อก่อน'],
              ['เงินเข้าเมื่อไหร่?', 'โอนสิ้นเดือนผ่าน PromptPay ยอดขั้นต่ำ 300 บาท (ไม่ถึงยกไปเดือนถัดไป)'],
              ['นับยังไง?', 'เพื่อนกดลิงก์ของคุณแล้วสั่ง+จ่ายจริง ระบบผูกเพื่อนกับคุณ 12 เดือน — หลังจากนั้นเพื่อนสั่งตรงก็ยังนับให้'],
              ['แนะนำตัวเองได้ไหม?', 'ไม่ได้ ระบบไม่นับออเดอร์ที่เบอร์ผู้ซื้อ = เบอร์ผู้แนะนำ'],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border-2 p-3" style={{ background: C.card, borderColor: C.line }}>
                <p className="text-sm font-bold" style={{ color: C.ink }}>{q}</p>
                <p className="text-xs mt-1" style={{ color: C.muted }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6) CTA */}
        <section className="rounded-3xl border-2 p-5" style={{ background: C.card, borderColor: C.accent }}>
          {result ? (
            <div className="text-center">
              <p className="font-black text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: C.green }}>🎉 ลิงก์ของคุณพร้อมแล้ว!</p>
              <p className="text-xs font-mono mb-3" style={{ color: C.muted }}>แชร์ลิงก์นี้ เพื่อนสั่งเมื่อไหร่คุณได้ 10%</p>
              <div className="rounded-xl border-2 px-3 py-2 mb-3 break-all text-xs font-mono" style={{ background: C.bg, borderColor: C.line, color: C.ink }}>
                {result.link}
              </div>
              <div className="flex gap-2">
                <button onClick={copy} className="flex-1 py-3 rounded-2xl font-black uppercase text-sm active:scale-95" style={btn}>
                  {copied ? '✓ ก๊อปแล้ว' : '📋 ก๊อปลิงก์'}
                </button>
                <button onClick={lineShare} className="flex-1 py-3 rounded-2xl font-black uppercase text-sm active:scale-95"
                  style={{ fontFamily: 'var(--font-display)', background: '#06C755', color: '#fff' }}>
                  แชร์ LINE
                </button>
              </div>
              <Link href="/account?tab=referral" className="block mt-3 text-xs font-mono" style={{ color: C.accent }}>
                ดูรายได้ / แดชบอร์ดของฉัน →
              </Link>
            </div>
          ) : user?.phone ? (
            <div>
              <p className="text-sm font-bold mb-2 text-center" style={{ color: C.ink }}>รับลิงก์ของคุณเลย</p>
              <label className="block text-xs font-mono mb-1" style={{ color: C.muted }}>PromptPay รับเงิน (เว้นว่าง = ใช้เบอร์ {user.phone})</label>
              <input value={pp} onChange={e => setPp(e.target.value)} inputMode="numeric"
                placeholder={user.phone} className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono mb-3"
                style={{ background: C.bg, borderColor: C.line, color: C.ink }} />
              {err && <p className="text-xs font-mono mb-2" style={{ color: C.accent }}>{err}</p>}
              <button onClick={register} disabled={busy}
                className="w-full py-3 rounded-2xl font-black uppercase text-sm active:scale-95 disabled:opacity-50" style={btn}>
                {busy ? 'กำลังสร้างลิงก์...' : 'รับลิงก์ของฉันเลย — ฟรี'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>เข้าสู่ระบบเพื่อรับลิงก์ (ฟรี ไม่เกิน 30 วิ)</p>
              <LineLoginButton />
              <Link href="/account" className="block mt-3 text-xs font-mono" style={{ color: C.accent }}>
                หรือเข้าด้วยเบอร์โทร →
              </Link>
            </div>
          )}
        </section>

        <p className="text-xs font-mono text-center mt-6" style={{ color: C.faint }}>
          VeLA Cold Brew — โปรแกรมแนะนำเพื่อน
        </p>
      </div>
    </main>
  )
}
