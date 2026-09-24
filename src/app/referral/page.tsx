'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
const PER = Math.round(AOV * 0.10)   // 43 บาท/ออเดอร์

function StatBox({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl border-2 px-4 py-4 text-center" style={{ background: C.card, borderColor: C.line }}>
      <p className="font-black text-2xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: C.accent }}>{big}</p>
      <p className="text-xs font-mono mt-1" style={{ color: C.muted }}>{small}</p>
    </div>
  )
}

// ---- CTA ท้ายหน้า: invite-only + waitlist ----
function JoinBox() {
  const { user } = useAuth()
  const sp = useSearchParams()
  const [invite, setInvite] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [result, setResult] = useState<{ link: string } | null>(null)
  const [copied, setCopied] = useState(false)
  // waitlist
  const [wlOpen, setWlOpen] = useState(false)
  const [wlName, setWlName] = useState('')
  const [wlContact, setWlContact] = useState('')
  const [wlDone, setWlDone] = useState(false)
  const [wlBusy, setWlBusy] = useState(false)

  useEffect(() => {
    const q = (sp.get('invite') || '').trim()
    if (q) setInvite(q)
  }, [sp])

  const register = async () => {
    setErr(''); setBusy(true)
    try {
      const res = await fetch(`${API}/referral/register`, {
        method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ phone: user?.phone, line_user_id: user?.line_user_id, invite_code: invite || undefined }),
      })
      if (onCustomerUnauthorized(res)) return
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(d.detail || 'สมัครไม่สำเร็จ'); return }
      setResult({ link: d.link })
    } catch { setErr('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง') }
    finally { setBusy(false) }
  }

  const copy = () => { try { navigator.clipboard.writeText(result?.link || ''); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }

  const submitWaitlist = async () => {
    if (!wlName.trim() && !wlContact.trim()) { return }
    setWlBusy(true)
    try {
      await fetch(`${API}/referral/waitlist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: wlName, contact: wlContact, line_user_id: user?.line_user_id }),
      })
      setWlDone(true)
    } catch {}
    finally { setWlBusy(false) }
  }

  const btn: React.CSSProperties = { fontFamily: 'var(--font-display)', background: C.accent, color: C.bg }

  // สมัครสำเร็จ → โชว์ลิงก์
  if (result) return (
    <section className="rounded-3xl border-2 p-5 text-center" style={{ background: C.card, borderColor: C.accent }}>
      <p className="font-black text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: C.green }}>🎉 ลิงก์ของคุณพร้อมแล้ว!</p>
      <p className="text-xs font-mono mb-3" style={{ color: C.muted }}>แชร์ลิงก์นี้ เพื่อนสั่งเมื่อไหร่คุณได้ 10%</p>
      <div className="rounded-xl border-2 px-3 py-2 mb-3 break-all text-xs font-mono" style={{ background: C.bg, borderColor: C.line, color: C.ink }}>{result.link}</div>
      <button onClick={copy} className="w-full py-3 rounded-2xl font-black uppercase text-sm active:scale-95" style={btn}>{copied ? '✓ ก๊อปลิงก์แล้ว' : '📋 ก๊อปลิงก์'}</button>
      <Link href="/account?tab=referral" className="block mt-3 text-xs font-mono" style={{ color: C.accent }}>ดูรายได้ / แดชบอร์ดของฉัน →</Link>
    </section>
  )

  return (
    <section className="rounded-3xl border-2 p-5" style={{ background: C.card, borderColor: C.accent }}>
      <p className="font-black text-lg mb-1 text-center" style={{ fontFamily: 'var(--font-display)', color: C.ink }}>ขณะนี้รับเฉพาะผู้ได้รับคำเชิญ</p>
      <p className="text-sm mb-4 text-center" style={{ color: C.muted }}>ถ้าได้รับรหัสเชิญจากทางร้าน กรอกด้านล่างเพื่อรับลิงก์ของคุณ</p>

      <label className="block text-xs font-mono mb-1" style={{ color: C.muted }}>รหัสเชิญ</label>
      <input value={invite} onChange={e => setInvite(e.target.value)} placeholder="เช่น vela01"
        className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono mb-3 text-center tracking-widest"
        style={{ background: C.bg, borderColor: C.line, color: C.ink }} />
      {err && <p className="text-xs font-mono mb-2 text-center" style={{ color: C.accent }}>{err}</p>}

      {user?.phone ? (
        <button onClick={register} disabled={busy || !invite.trim()}
          className="w-full py-3 rounded-2xl font-black uppercase text-sm active:scale-95 disabled:opacity-40" style={btn}>
          {busy ? 'กำลังสร้างลิงก์...' : 'รับลิงก์ของฉันเลย'}
        </button>
      ) : (
        <div>
          <p className="text-xs font-mono mb-2 text-center" style={{ color: C.faint }}>เข้าสู่ระบบก่อน แล้วกรอกรหัสเชิญ</p>
          <LineLoginButton />
          <Link href="/account" className="block mt-2 text-xs font-mono text-center" style={{ color: C.accent }}>หรือเข้าด้วยเบอร์โทร →</Link>
        </div>
      )}

      {/* waitlist */}
      <div className="mt-5 pt-4" style={{ borderTop: `1px dashed ${C.line}` }}>
        {wlDone ? (
          <p className="text-sm text-center" style={{ color: C.green }}>✓ รับชื่อไว้แล้ว เดี๋ยวทางร้านติดต่อกลับนะคะ 🐰</p>
        ) : !wlOpen ? (
          <button onClick={() => setWlOpen(true)} className="w-full text-sm font-mono py-2" style={{ color: C.accent }}>
            ยังไม่มีรหัสเชิญ? สนใจร่วมโปรแกรม แจ้งชื่อไว้ →
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-mono text-center" style={{ color: C.muted }}>แจ้งชื่อ+ช่องทางติดต่อ เดี๋ยวทางร้านส่งรหัสเชิญให้</p>
            <input value={wlName} onChange={e => setWlName(e.target.value)} placeholder="ชื่อของคุณ"
              className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={{ background: C.bg, borderColor: C.line, color: C.ink }} />
            <input value={wlContact} onChange={e => setWlContact(e.target.value)} placeholder="เบอร์ / LINE ID"
              className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono" style={{ background: C.bg, borderColor: C.line, color: C.ink }} />
            <button onClick={submitWaitlist} disabled={wlBusy || (!wlName.trim() && !wlContact.trim())}
              className="w-full py-2.5 rounded-2xl font-black uppercase text-xs active:scale-95 disabled:opacity-40"
              style={{ fontFamily: 'var(--font-display)', background: C.ink, color: C.bg }}>
              {wlBusy ? 'กำลังส่ง...' : 'แจ้งชื่อไว้'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function ReferralContent() {
  const [n, setN] = useState(10)
  const [rep, setRep] = useState(3)                 // ลูกค้าสั่งซ้ำต่อเดือน (ปกติ 3-4 รอบ)
  const perMonth = useMemo(() => n * rep * PER, [n, rep])
  const perYear = perMonth * 12

  return (
    <main className="min-h-screen" style={{ background: C.bg }}>
      <div className="max-w-lg mx-auto px-5 py-10">
        <Link href="/" className="text-xs font-mono" style={{ color: C.muted }}>← กลับหน้าแรก</Link>

        {/* Hero */}
        <section className="mt-6 mb-8 text-center">
          <h1 className="font-black text-3xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: C.ink }}>
            แชร์กาแฟที่คุณดื่มจริง<br />รับรายได้ทุกครั้งที่เพื่อนสั่ง
          </h1>
          <p className="text-sm mt-3" style={{ color: C.accent, fontWeight: 700 }}>— ตลอด 12 เดือน</p>
          <p className="text-sm mt-3" style={{ color: C.muted }}>
            ไม่ต้องสต็อกของ ไม่ต้องขายเอง แค่แชร์ลิงก์ของคุณ
          </p>
        </section>

        {/* กล่องตัวเลข 3 บรรทัด */}
        <section className="grid grid-cols-3 gap-2 mb-8">
          <StatBox big="10%" small="ทุกออเดอร์ 12 เดือน" />
          <StatBox big="+30.-" small="โบนัส 5 คนแรก" />
          <StatBox big="PromptPay" small="โอนสิ้นเดือน (ขั้นต่ำ 300.-)" />
        </section>

        {/* เครื่องคำนวณสไลเดอร์ */}
        <section className="rounded-3xl border-2 p-5 mb-8" style={{ background: C.card, borderColor: C.line }}>
          <p className="text-sm font-bold mb-4" style={{ color: C.ink }}>ลองคำนวณรายได้</p>

          <p className="text-xs font-mono mb-2" style={{ color: C.muted }}>เพื่อนที่สั่งประจำผ่านคุณ: <b style={{ color: C.accent }}>{n} คน</b></p>
          <input type="range" min={1} max={50} value={n} onChange={e => setN(Number(e.target.value))}
            className="w-full mb-4" style={{ accentColor: C.accent }} />

          <p className="text-xs font-mono mb-2" style={{ color: C.muted }}>แต่ละคนสั่งซ้ำ: <b style={{ color: C.accent }}>{rep} ครั้ง/เดือน</b> <span style={{ color: C.faint }}>(ลูกค้า VeLA ปกติ 3-4 ครั้ง/เดือน)</span></p>
          <input type="range" min={1} max={8} value={rep} onChange={e => setRep(Number(e.target.value))}
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
            คิดจากยอดเฉลี่ย ฿{AOV}/ออเดอร์ × 10% = ฿{PER}/ออเดอร์ · ตัวอย่างการคำนวณ รายได้จริงขึ้นกับยอดสั่งจริง
          </p>
        </section>

        {/* ทำงานยังไง 3 ขั้น */}
        <section className="mb-8">
          <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>ทำงานยังไง</p>
          <div className="space-y-2">
            {[
              ['1', 'ได้รับรหัสเชิญ', 'ทางร้านส่งรหัสเชิญ + ลิงก์ให้ — เข้าสู่ระบบแล้วกรอกรหัส รับลิงก์ส่วนตัวทันที'],
              ['2', 'แชร์ลิงก์ของคุณ', 'เพื่อนกดลิงก์แล้วสั่ง — เพื่อนได้ลด 50% ออเดอร์แรกด้วย'],
              ['3', 'รับรายได้', 'ทุกออเดอร์ของเพื่อน คุณได้ 10% ตลอด 12 เดือน ดูยอดสดในแดชบอร์ด โอนสิ้นเดือน'],
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

        {/* FAQ */}
        <section className="mb-8">
          <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>คำถามที่พบบ่อย</p>
          <div className="space-y-2">
            {[
              ['ต้องซื้อก่อนไหม?', 'ไม่จำเป็น แต่ช่วงนี้เปิดเฉพาะผู้ที่ได้รับรหัสเชิญจากทางร้าน'],
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

        {/* CTA */}
        <JoinBox />

        <p className="text-xs font-mono text-center mt-6" style={{ color: C.faint }}>
          VeLA Cold Brew — โปรแกรมแนะนำเพื่อน
        </p>
      </div>
    </main>
  )
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" style={{ background: C.bg }} />}>
      <ReferralContent />
    </Suspense>
  )
}
