'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'
import { useAuth } from '@/context/AuthContext'

const API    = process.env.NEXT_PUBLIC_API_URL    || 'https://vela-tracking.onrender.com'
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type CartItem = { sku: string; qty: number; price: number; name: string }

function CheckoutForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [cart,       setCart]       = useState<CartItem[]>([])
  const { user } = useAuth()
  const [form,       setForm]       = useState({ name: '', phone: '', address: '', province: '', zip: '', note: '' })

  // Auto-fill จาก LINE user
  useEffect(() => {
    if (user?.displayName && !form.name) {
      setForm(prev => ({ ...prev, name: prev.name || user.displayName || '', phone: prev.phone || user.phone || '' }))
    }
  }, [user])
  const [loading,    setLoading]    = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [orderId,    setOrderId]    = useState('')
  const [errors,     setErrors]     = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const raw = searchParams.get('cart')
      if (raw) setCart(JSON.parse(decodeURIComponent(raw)))
    } catch {}
  }, [searchParams])

  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = 0 // ส่งฟรี

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())     e.name     = 'กรุณาใส่ชื่อ'
    if (!form.phone.trim() || form.phone.length < 9) e.phone = 'กรุณาใส่เบอร์โทรที่ถูกต้อง'
    if (!form.address.trim())  e.address  = 'กรุณาใส่ที่อยู่'
    if (!form.province.trim()) e.province = 'กรุณาใส่จังหวัด'
    if (!form.zip.trim())      e.zip      = 'กรุณาใส่รหัสไปรษณีย์'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // สร้าง order ID
      const oid = `WEB${Date.now().toString().slice(-8)}`

      // บันทึกลง Supabase ผ่าน backend
      const res = await fetch(`${API}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id:     oid,
          customer:     form.name,
          phone:        form.phone,
          full_address: form.address,
          province:     form.province,
          zip:          form.zip,
          note:         form.note,
          items:        cart,
          total:        total,
          channel:      'web',
          status:       'รอชำระเงิน',
        })
      })

      if (!res.ok) throw new Error('บันทึก order ไม่สำเร็จ')
      setOrderId(oid)
      setSubmitted(true)
    } catch (e: any) {
      alert(e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#EDE8DF' }}>
        <div className="w-full max-w-md text-center">
          <div className="animate-bounce-in mb-6">
            <VelaBunny size={64} className="mx-auto" />
          </div>
          <h1 className="text-4xl font-black uppercase mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#1A6B3C' }}>
            รับออเดอร์แล้ว!
          </h1>
          <p className="text-sm mb-6" style={{ color: '#8C7B6E' }}>Order #{orderId}</p>

          {/* QR PromptPay */}
          <div className="rounded-3xl border-2 p-6 mb-6" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <p className="font-black text-lg uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
              ชำระเงิน ฿{total.toLocaleString()}
            </p>
            <p className="text-xs font-mono mb-4" style={{ color: '#8C7B6E' }}>PromptPay · โอนภายใน 24 ชั่วโมง</p>

            {/* QR Code placeholder - ใส่ QR จริงได้ที่นี่ */}
            <div className="w-48 h-48 mx-auto rounded-2xl border-2 flex items-center justify-center mb-3"
              style={{ borderColor: '#D8D0C5', background: '#EDE8DF' }}>
              <p className="text-xs text-center font-mono px-4" style={{ color: '#C5BAB0' }}>
                QR Code<br/>PromptPay<br/>(ใส่รูปจริงที่นี่)
              </p>
            </div>

            <p className="text-sm font-mono" style={{ color: '#3D1F0F' }}>
              เบอร์พร้อมเพย์: <strong>0906980460</strong>
            </p>
            <p className="text-xs mt-1" style={{ color: '#8C7B6E' }}>ชื่อบัญชี: VeLA Cold Brew</p>
          </div>

          <div className="rounded-2xl border-2 p-4 mb-6 text-left" style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
            <p className="text-xs" style={{ color: '#854F0B' }}>
              📸 กรุณาส่งสลิปโอนเงินมาที่ LINE: <strong>@vela</strong> พร้อมแจ้ง Order #{orderId}
            </p>
          </div>

          <button onClick={() => router.push('/')}
            className="w-full py-3 rounded-2xl font-black uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', fontSize: '14px', background: '#D64B2A', color: '#EDE8DF' }}>
            กลับหน้าร้าน
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: '#EDE8DF' }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelaBunny size={32} />
            <h1 className="text-3xl font-black uppercase"
              style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
              สั่งซื้อ
            </h1>
          </div>
          <Link href="/" className="text-xs font-mono px-3 py-1.5 rounded-xl border-2 hover:opacity-70 transition-opacity"
            style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
            ← หน้าร้าน
          </Link>
        </div>

        {/* LINE Login shortcut */}
        {!user && (
          <div className="rounded-2xl border-2 px-5 py-4 mb-4 flex items-center justify-between" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#3D1F0F' }}>Login ด้วย LINE</p>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>กรอกข้อมูลได้เร็วขึ้น + ดูประวัติสั่งซื้อ</p>
            </div>
            <LineLoginButton onDone={() => {}} />
          </div>
        )}

        {/* Order summary */}
        <div className="rounded-2xl border-2 overflow-hidden mb-6" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>สรุปคำสั่งซื้อ</p>
          </div>
          {cart.map(item => (
            <div key={item.sku} className="px-5 py-3 flex justify-between border-b" style={{ borderColor: '#E0D9CE' }}>
              <p className="text-sm" style={{ color: '#3D1F0F' }}>{item.name} × {item.qty}</p>
              <p className="text-sm font-mono" style={{ color: '#3D1F0F' }}>฿{(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
          <div className="px-5 py-3 flex justify-between">
            <p className="text-sm font-mono" style={{ color: '#8C7B6E' }}>ค่าส่ง</p>
            <p className="text-sm font-mono" style={{ color: '#1A6B3C' }}>ฟรี 🎉</p>
          </div>
          <div className="px-5 py-3 border-t-2 flex justify-between" style={{ borderColor: '#E0D9CE' }}>
            <p className="font-black" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>รวมทั้งหมด</p>
            <p className="font-black text-xl" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
              ฿{total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border-2 overflow-hidden mb-6" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>ข้อมูลจัดส่ง</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { key: 'name',     label: 'ชื่อ-นามสกุล',      placeholder: 'สมชาย ใจดี',           type: 'text' },
              { key: 'phone',    label: 'เบอร์โทรศัพท์',      placeholder: '0812345678',            type: 'tel' },
              { key: 'address',  label: 'ที่อยู่',             placeholder: 'บ้านเลขที่ ถนน ซอย',   type: 'text' },
              { key: 'province', label: 'จังหวัด',             placeholder: 'กรุงเทพมหานคร',         type: 'text' },
              { key: 'zip',      label: 'รหัสไปรษณีย์',       placeholder: '10100',                 type: 'text' },
              { key: 'note',     label: 'หมายเหตุ (ถ้ามี)',   placeholder: 'เช่น แพ้นม หรืออื่นๆ', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-all"
                  style={{
                    background: '#EDE8DF', color: '#3D1F0F',
                    borderColor: errors[f.key] ? '#D64B2A' : '#D8D0C5',
                  }} />
                {errors[f.key] && <p className="text-xs mt-0.5 font-mono" style={{ color: '#D64B2A' }}>{errors[f.key]}</p>}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || cart.length === 0}
          className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          style={{ fontFamily: 'var(--font-display)', fontSize: '18px', background: '#D64B2A', color: '#EDE8DF' }}>
          {loading ? 'กำลังดำเนินการ...' : `ยืนยันคำสั่งซื้อ ฿${total.toLocaleString()}`}
        </button>

        <p className="text-center text-xs mt-3 font-mono" style={{ color: '#C5BAB0' }}>
          ส่งฟรี · ชำระผ่าน PromptPay หลังยืนยัน order
        </p>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#EDE8DF' }}>
      <p className="font-mono text-sm" style={{ color: '#C5BAB0' }}>กำลังโหลด...</p>
    </div>}>
      <CheckoutForm />
    </Suspense>
  )
}
