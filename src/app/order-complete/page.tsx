'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function OrderCompleteContent() {
  const params  = useSearchParams()
  const orderId = params.get('order_id') || ''
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (!orderId) return
    fetch(`${SB_URL}/rest/v1/orders?order_id=eq.${orderId}&select=order_id,customer,phone,sku,qty,total,status,full_address,province,zip`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      .then(r => r.json())
      .then(data => { if (data?.[0]) setOrder(data[0]) })
      .catch(() => {})
  }, [orderId])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: '#EDE8DF' }}>
      <div className="w-full max-w-sm">

        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#1A6B3C20' }}>
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-black uppercase mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#1A6B3C' }}>
            สั่งซื้อสำเร็จ!
          </h1>
          <p className="text-sm" style={{ color: '#8C7B6E' }}>
            ขอบคุณที่สั่งซื้อกับ VeLA Cold Brew นะคะ 🐰
          </p>
        </div>

        {/* Order summary */}
        {order && (
          <div className="rounded-3xl border-2 overflow-hidden mb-4"
            style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
              <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>
                รายการสั่งซื้อ
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* สินค้า */}
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: '#C5BAB0' }}>สินค้า</p>
                <p className="text-sm" style={{ color: '#3D1F0F' }}>{order.sku}</p>
              </div>
              {/* ยอดรวม */}
              {order.total > 0 && (
                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#E0D9CE' }}>
                  <p className="text-sm font-mono" style={{ color: '#8C7B6E' }}>ยอดรวม</p>
                  <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                    ฿{Number(order.total).toLocaleString()}
                  </p>
                </div>
              )}
              {/* ที่อยู่จัดส่ง */}
              {order.full_address && (
                <div className="pt-2 border-t" style={{ borderColor: '#E0D9CE' }}>
                  <p className="text-xs font-mono mb-1" style={{ color: '#C5BAB0' }}>จัดส่งไปที่</p>
                  <p className="text-sm font-black mb-0.5" style={{ color: '#3D1F0F' }}>{order.customer}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#8C7B6E' }}>
                    {[order.full_address, order.province, order.zip].filter(Boolean).join(' ')}
                  </p>
                </div>
              )}
              {/* Order ID */}
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#E0D9CE' }}>
                <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>Order ID</p>
                <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{order.order_id}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR PromptPay */}
        <div className="rounded-3xl border-2 overflow-hidden mb-4"
          style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
          <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>
              ชำระเงินผ่าน PromptPay
            </p>
          </div>
          <div className="px-5 py-4 flex flex-col items-center">
            <img src="/promptpay-qr.jpg" alt="PromptPay QR"
              className="w-48 h-48 object-contain rounded-2xl mb-3" />
            <a href="/promptpay-qr.jpg" download="VeLA-PromptPay-QR.jpg"
              className="text-xs font-mono px-4 py-2 rounded-xl border-2 transition-all active:scale-95 mb-2"
              style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
              ⬇️ บันทึก QR ไว้สแกน
            </a>
            <p className="text-xs font-mono text-center" style={{ color: '#8C7B6E' }}>
              สแกน QR เพื่อโอนเงิน · PromptPay
            </p>
            {order?.total > 0 && (
              <p className="font-black text-xl mt-2" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                ฿{Number(order.total).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* PromptPay reminder */}
        <div className="rounded-2xl border-2 px-5 py-4 mb-4"
          style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
          <p className="font-black text-sm mb-1"
            style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>
            📌 อย่าลืมโอนเงิน
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#854F0B' }}>
            กรุณาโอนเงินและอัปโหลดสลิปผ่านหน้าประวัติการสั่งซื้อ
            เพื่อให้ทีมงานยืนยันและจัดส่งให้โดยเร็วครับ
          </p>
        </div>

        {/* Steps */}
        <div className="rounded-2xl border-2 px-5 py-4 mb-6"
          style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
          <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#C5BAB0' }}>
            ขั้นตอนต่อไป
          </p>
          <div className="space-y-2">
            {[
              { step: '1', text: 'โอนเงินผ่าน PromptPay' },
              { step: '2', text: 'อัปโหลดสลิปในหน้าประวัติ' },
              { step: '3', text: 'รอทีมงานยืนยัน (ภายใน 24 ชม.)' },
              { step: '4', text: 'รับของที่บ้านเลยครับ 🚚' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black"
                  style={{ background: '#D64B2A', color: '#EDE8DF', fontFamily: 'var(--font-display)' }}>
                  {s.step}
                </div>
                <p className="text-sm" style={{ color: '#3D1F0F' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/account"
            className="block w-full py-3 rounded-2xl font-black uppercase text-sm text-center transition-all active:scale-95"
            style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
            📎 อัปโหลดสลิปหลังโอนเงิน →
          </Link>
          <Link href="/"
            className="block w-full py-3 rounded-2xl font-black uppercase text-sm text-center border-2 transition-all active:scale-95"
            style={{ fontFamily: 'var(--font-display)', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
            กลับหน้าร้าน
          </Link>
        </div>

      </div>
    </main>
  )
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#EDE8DF' }}>
        <p className="text-sm font-mono" style={{ color: '#8C7B6E' }}>กำลังโหลด...</p>
      </main>
    }>
      <OrderCompleteContent />
    </Suspense>
  )
}
