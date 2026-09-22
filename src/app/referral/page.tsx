'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

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
  const [n, setN] = useState(10)
  const perMonth = useMemo(() => n * PER, [n])
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
          <p className="text-sm font-bold mb-1" style={{ color: C.ink }}>ลองคำนวณรายได้</p>
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

        {/* ทำงานยังไง 3 ขั้น */}
        <section className="mb-8">
          <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>ทำงานยังไง</p>
          <div className="space-y-2">
            {[
              ['1', 'ได้รับลิงก์', 'ทางร้านเชิญและออกลิงก์ส่วนตัวให้คุณ'],
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

        {/* FAQ */}
        <section className="mb-8">
          <p className="text-sm font-bold mb-3" style={{ color: C.ink }}>คำถามที่พบบ่อย</p>
          <div className="space-y-2">
            {[
              ['ต้องซื้อก่อนไหม?', 'ไม่จำเป็น แต่ช่วงนี้เปิดเฉพาะผู้ที่ได้รับเชิญจากทางร้าน'],
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

        {/* CTA — invite-only phase */}
        <section className="rounded-3xl border-2 p-5 text-center" style={{ background: C.card, borderColor: C.accent }}>
          <p className="font-black text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: C.ink }}>เปิดเฉพาะผู้ได้รับเชิญ</p>
          <p className="text-sm mb-4" style={{ color: C.muted }}>
            ตอนนี้โปรแกรมยังไม่เปิดสมัครทั่วไป ถ้าได้รับเชิญแล้ว เข้าสู่ระบบเพื่อดูลิงก์และรายได้ของคุณได้เลย
          </p>
          <div className="flex gap-2">
            <Link href="/account?tab=referral" className="flex-1 py-3 rounded-2xl font-black uppercase text-sm active:scale-95"
              style={{ fontFamily: 'var(--font-display)', background: C.accent, color: C.bg }}>
              เข้าสู่ระบบ / ดูแดชบอร์ด
            </Link>
            <a href="https://lin.ee/rdPxbQ8" target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 rounded-2xl font-black uppercase text-sm active:scale-95 flex items-center justify-center"
              style={{ fontFamily: 'var(--font-display)', background: '#06C755', color: '#fff' }}>
              สนใจ ทักไลน์ร้าน
            </a>
          </div>
        </section>

        <p className="text-xs font-mono text-center mt-6" style={{ color: C.faint }}>
          VeLA Cold Brew — โปรแกรมแนะนำเพื่อน
        </p>
      </div>
    </main>
  )
}
