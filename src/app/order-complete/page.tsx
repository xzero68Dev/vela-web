'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fbTrack } from '@/lib/fbpixel'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API    = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'


function SlipUpload({ orderId, total }: { orderId: string; total: number }) {
  const [uploading, setUploading] = useState(false)
  const [verified,  setVerified]  = useState<'success' | 'pending' | 'error' | null>(null)
  const [error,     setError]     = useState('')
  const [reason,    setReason]    = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError(''); setVerified(null)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${orderId}-${Date.now()}.${ext}`
      const upRes = await fetch(`${SB_URL}/storage/v1/object/slips/${path}`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': file.type },
        body: file,
      })
      if (!upRes.ok) throw new Error('อัปโหลดไม่สำเร็จ')
      const slip_url = `${SB_URL}/storage/v1/object/public/slips/${path}`
      await fetch(`${SB_URL}/rest/v1/orders?order_id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ slip_url }),
      })
      const verRes  = await fetch(`${API}/orders/slip-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, slip_url }),
      })
      const verData = await verRes.json()
      if (verData.verified) {
        setVerified('success')
      } else {
        const r: string = verData.reason || ''
        if (r.includes('1014') || r.includes('ไม่ได้โอน')) {
          setVerified('error'); setReason('สลิปนี้ไม่ได้โอนเข้าบัญชีร้าน กรุณาตรวจสอบบัญชีปลายทางแล้วอัปโหลดใหม่ครับ')
        } else if (r.includes('1010') || r.includes('ซ้ำ')) {
          setVerified('error'); setReason('สลิปนี้เคยใช้ไปแล้ว กรุณาส่งสลิปใบใหม่ครับ')
        } else if (r.includes('1013') || r.includes('ยอด')) {
          setVerified('error'); setReason('ยอดเงินในสลิปไม่ตรง กรุณาตรวจสอบแล้วอัปโหลดใหม่ครับ')
        } else {
          setVerified('pending'); setReason('ทีมงานจะตรวจสอบและยืนยันภายใน 24 ชั่วโมงครับ')
        }
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally { setUploading(false) }
  }

  if (verified === 'success') return (
    <div className="rounded-3xl p-6 text-center" style={{ background: '#C5E8D5', border: '2px solid #1A6B3C' }}>
      <p className="text-4xl mb-2">✅</p>
      <p className="font-black text-xl mb-1" style={{ fontFamily: 'var(--font-display)', color: '#1A6B3C' }}>
        ชำระเงินสำเร็จ!
      </p>
      <p className="text-sm font-mono" style={{ color: '#1A6B3C' }}>
        ระบบตรวจสอบยอดเงินเรียบร้อยแล้ว ทีมงานจะจัดส่งให้โดยเร็วครับ
      </p>
    </div>
  )

  if (verified === 'error') return (
    <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
      <div className="px-5 py-4 text-center">
        <p className="text-3xl mb-2">⚠️</p>
        <p className="font-black text-sm mb-2" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          สลิปไม่ถูกต้อง
        </p>
        <p className="text-xs font-mono mb-4" style={{ color: '#D64B2A' }}>{reason}</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95 font-black uppercase text-sm"
          style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          {uploading ? '🔄 กำลังตรวจสอบ...' : '📎 อัปโหลดสลิปใหม่'}
        </label>
      </div>
    </div>
  )

  if (verified === 'pending') return (
    <div className="rounded-3xl border-2 p-6 text-center" style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
      <p className="text-3xl mb-2">⏳</p>
      <p className="font-black text-sm mb-1" style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>
        ส่งสลิปแล้ว รอทีมงานตรวจสอบ
      </p>
      <p className="text-xs font-mono" style={{ color: '#854F0B' }}>{reason || 'ทีมงานจะยืนยันภายใน 24 ชั่วโมงครับ'}</p>
    </div>
  )

  return (
    <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
      <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>
          ขั้นตอนที่ 2 — แนบสลิปการโอน
        </p>
      </div>
      <div className="px-5 py-4 text-center">
        <p className="text-xs font-mono mb-4" style={{ color: '#8C7B6E' }}>
          โอนเงิน ฿{Number(total).toLocaleString()} เรียบร้อยแล้ว? แนบสลิปได้เลยครับ
        </p>
        <label className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 font-black uppercase text-sm"
          style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          {uploading ? '🔄 กำลังตรวจสอบ...' : '📎 แนบสลิปการโอน'}
        </label>
        {error && <p className="text-xs mt-2 font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
      </div>
    </div>
  )
}

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

  // FB Pixel: Purchase — ยิงเมื่อโหลด order สำเร็จ กันยิงซ้ำตอน refresh ด้วย localStorage
  useEffect(() => {
    if (!order || !orderId) return
    try {
      const KEY = 'vela_purchase_fired'
      const fired: string[] = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (fired.includes(orderId)) return
      fbTrack('Purchase', {
        content_name: order.sku,
        content_type: 'product',
        num_items:    order.qty || undefined,
        value:        Number(order.total) || 0,
        currency:     'THB',
      })
      localStorage.setItem(KEY, JSON.stringify([...fired, orderId].slice(-50)))
    } catch {}
  }, [order, orderId])

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

        {/* Dynamic QR + Auto-confirm */}
        {/* QR PromptPay — static QR */}
        {order && (
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
              <p className="text-xs font-mono text-center mb-2" style={{ color: '#D64B2A' }}>
                ⚠️ <strong>สแกน QR เท่านั้น</strong> อย่ากรอกเลขบัญชีเอง
              </p>
              <a href="/promptpay-qr.jpg" download="VeLA-PromptPay-QR.jpg"
                className="text-xs font-mono px-4 py-2 rounded-xl border-2 transition-all active:scale-95 mb-2"
                style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
                ⬇️ บันทึก QR ไว้สแกน
              </a>
              {order.total > 0 && (
                <p className="font-black text-xl mt-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                  ฿{Number(order.total).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Slip Upload */}
        {order && (
          <div className="mb-4">
            <SlipUpload orderId={orderId} total={order.total || 0} />
          </div>
        )}

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
