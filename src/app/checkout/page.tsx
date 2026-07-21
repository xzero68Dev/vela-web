'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'
import { useAuth } from '@/context/AuthContext'
import AddressForm from '@/components/AddressForm'
import AddressList from '@/components/AddressList'
import { getUtm } from '@/lib/utm'
import { fbTrack } from '@/lib/fbpixel'

const API    = process.env.NEXT_PUBLIC_API_URL    || 'https://vela-tracking.onrender.com'
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type CartItem = { sku: string; qty: number; price: number; name: string }

function CheckoutForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [cart,       setCart]       = useState<CartItem[]>([])
  const { user, updateProfile } = useAuth()
  const [form,       setForm]       = useState({ name: '', phone: '', address: '', province: '', zip: '', note: '' })
  const [addresses,  setAddresses]  = useState<any[]>([])
  const [selAddrId,  setSelAddrId]  = useState<number | undefined>()
  const [showNewAddr, setShowNewAddr] = useState(false)

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // โหลดที่อยู่ที่บันทึกไว้
  const fetchAddresses = async (phone: string) => {
    const res = await fetch(`${SB_URL}/rest/v1/addresses?phone=eq.${phone}&order=is_default.desc,id.desc`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      setAddresses(data)
      // เลือก default หรืออันแรก
      const def = data.find((a: any) => a.is_default) || data[0]
      setSelAddrId(def.id)
      setForm(prev => ({
        ...prev,
        name:     def.name     || prev.name,
        phone:    def.phone    || prev.phone,
        address:  def.full_address || prev.address,
        province: def.province || prev.province,
        zip:      def.zip      || prev.zip,
      }))
    }
  }

  // Auto-fill จาก LINE user (ดึงข้อมูลทั้งหมดจาก customers table)
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        name:     prev.name     || user.name     || user.display_name || '',
        phone:    prev.phone    || user.phone    || '',
        address:  prev.address  || user.address  || '',
        province: prev.province || user.province || '',
        zip:      prev.zip      || user.zip      || '',
        note:     prev.note,
      }))
      // โหลดที่อยู่ที่บันทึกไว้
      const phone = user.phone || ''
      if (phone) fetchAddresses(phone)
    }
  }, [user?.line_user_id])
  const [loading,    setLoading]    = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [orderId,    setOrderId]    = useState('')
  const [paidTotal,  setPaidTotal]  = useState(0)
  const [errors,     setErrors]     = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const raw = searchParams.get('cart')
      if (raw) setCart(JSON.parse(decodeURIComponent(raw)))
    } catch {}
  }, [searchParams])

  // FB Pixel: InitiateCheckout — ยิงครั้งเดียวเมื่อเข้าหน้า checkout พร้อมสินค้าในตะกร้า
  const icFired = useRef(false)
  useEffect(() => {
    if (icFired.current || cart.length === 0) return
    icFired.current = true
    fbTrack('InitiateCheckout', {
      content_ids: cart.map(i => i.sku),
      contents:    cart.map(i => ({ id: i.sku, quantity: i.qty })),
      content_type: 'product',
      num_items:   cart.reduce((s, i) => s + i.qty, 0),
      value:       cart.reduce((s, i) => s + i.price * i.qty, 0),
      currency:    'THB',
    })
  }, [cart])

  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const [firstOrderDiscount, setFirstOrderDiscount] = useState(false)

  // เช็คส่วนลดลูกค้าใหม่จาก backend
  useEffect(() => {
    if (!user?.phone) return
    fetch(`${API}/products/check-first-order?phone=${encodeURIComponent(user.phone)}`)
      .then(r => r.json())
      .then(d => setFirstOrderDiscount(d.eligible === true))
      .catch(() => {
        // fallback: ใช้ localStorage
        setFirstOrderDiscount(localStorage.getItem('vela_first_order_discount') === '1')
      })
  }, [user?.phone])
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
      // บันทึกที่อยู่ลง customers ถ้า login LINE แล้ว
      if (user) {
        await updateProfile({
          name:     form.name,
          phone:    form.phone,
          address:  form.address,
          province: form.province,
          zip:      form.zip,
        })
      }

      // สร้าง order ID
      const oid = `WEB${Date.now().toString().slice(-8)}`

      // เช็คว่าใช้ส่วนลดครั้งแรกไหม — ดูจาก cart item price เทียบกับ total
      // ถ้าราคาใน cart ถูกกว่า 60% ของยอดรวมปกติ (30% discount) = ใช้ first-order 50%
      const isFirstOrderDiscount = firstOrderDiscount

      // บันทึกลง Supabase ผ่าน backend
      const res = await fetch(`${API}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id:             oid,
          customer:             form.name,
          phone:                form.phone,
          full_address:         form.address,
          province:             form.province,
          zip:                  form.zip,
          note:                 form.note,
          items:                cart,
          total:                total,
          channel:              'web',
          status:               'รอชำระเงิน',
          first_order_discount: isFirstOrderDiscount,
          ...getUtm(),  // utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_page
        })
      })

      if (!res.ok) throw new Error('บันทึก order ไม่สำเร็จ')

      // เก็บยอดรวมไว้ก่อนเคลียร์ตะกร้า (เพราะ total คำนวณจาก cart สดๆ — เคลียร์แล้ว total จะกลายเป็น 0)
      setPaidTotal(total)

      // เคลียร์ตะกร้าทิ้ง — ทั้ง localStorage (ที่หน้าแรก/หน้าสินค้าใช้เป็นค่าจริง) และ state ปัจจุบัน
      localStorage.removeItem('vela_cart')
      setCart([])

      router.push(`/order-complete?order_id=${oid}`)
    } catch (e: any) {
      alert(e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const SlipUpload = ({ orderId }: { orderId: string }) => {
    const [uploading, setUploading] = useState(false)
    const [uploaded,  setUploaded]  = useState(false)
    const [error,     setError]     = useState('')

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true); setError('')
      try {
        const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        const ext  = file.name.split('.').pop()
        const path = `${orderId}-${Date.now()}.${ext}`

        // Upload ไปที่ Supabase Storage bucket "slips"
        const upRes = await fetch(`${SB_URL}/storage/v1/object/slips/${path}`, {
          method: 'POST',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': file.type },
          body: file,
        })
        if (!upRes.ok) throw new Error('upload failed')

        const slip_url = `${SB_URL}/storage/v1/object/public/slips/${path}`

        // บันทึก slip_url ลง orders
        await fetch(`${SB_URL}/rest/v1/orders?order_id=eq.${orderId}`, {
          method: 'PATCH',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ slip_url }),
        })
        setUploaded(true)
      } catch {
        setError('อัพโหลดไม่สำเร็จ กรุณาลองใหม่')
      } finally { setUploading(false) }
    }

    return (
      <div className="rounded-2xl border-2 p-4 mb-4" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
        <p className="text-sm font-black uppercase mb-2" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
          อัพโหลดสลิปโอนเงิน
        </p>
        {uploaded ? (
          <p className="text-sm font-mono" style={{ color: '#1A6B3C' }}>✓ อัพโหลดสลิปแล้ว รอการยืนยัน</p>
        ) : (
          <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:opacity-70"
            style={{ borderColor: '#D64B2A', color: '#D64B2A' }}>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <span className="text-sm font-mono">{uploading ? 'กำลังอัพโหลด...' : '📎 เลือกรูปสลิป'}</span>
          </label>
        )}
        {error && <p className="text-xs mt-1 font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
      </div>
    )
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
              ชำระเงิน ฿{paidTotal.toLocaleString()}
            </p>
            <p className="text-xs font-mono mb-4" style={{ color: '#8C7B6E' }}>PromptPay · โอนภายใน 24 ชั่วโมง</p>

            {/* QR PromptPay */}
            <img src="/promptpay-qr.jpg" alt="PromptPay QR"
              className="w-56 h-auto mx-auto rounded-2xl mb-3 shadow-md" />
            <p className="text-sm font-mono" style={{ color: '#3D1F0F' }}>
              ชื่อบัญชี: <strong>นาย จตุรพร งามขจรกุลกิจ</strong>
            </p>
          </div>

          {/* Slip upload */}
          <SlipUpload orderId={orderId} />

          <div className="rounded-2xl border-2 p-4 mb-6 text-left" style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
            <p className="text-xs" style={{ color: '#854F0B' }}>
              หรือส่งสลิปมาที่ LINE: <strong>@301saklb</strong> พร้อมแจ้ง Order #{orderId}
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
          {/* Banner ส่วนลดลูกค้าใหม่ */}
          {firstOrderDiscount && (
            <div className="px-5 py-3 flex items-center gap-3 border-b-2" style={{ background: '#D64B2A', borderColor: '#C04020' }}>
              <span className="text-xl">🎉</span>
              <div>
                <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: '#EDE8DF' }}>
                  ส่วนลดพิเศษลูกค้าใหม่ 50%!
                </p>
                <p className="text-xs font-mono" style={{ color: '#F5C5A0' }}>
                  ใช้ได้ครั้งเดียวเท่านั้น
                </p>
              </div>
            </div>
          )}
          <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>สรุปคำสั่งซื้อ</p>
          </div>
          {cart.map(item => (
            <div key={item.sku} className="px-5 py-3 flex justify-between border-b" style={{ borderColor: '#E0D9CE' }}>
              <p className="text-sm" style={{ color: '#3D1F0F' }}>{item.name} × {item.qty}</p>
              <p className="text-sm font-mono" style={{ color: '#D64B2A' }}>฿{(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
          <div className="px-5 py-3 flex justify-between">
            <p className="text-sm font-mono" style={{ color: '#8C7B6E' }}>ค่าส่ง</p>
            <p className="text-sm font-mono" style={{ color: '#1A6B3C' }}>ฟรี 🎉</p>
          </div>
          {/* แสดง savings */}
          {(() => {
            if (firstOrderDiscount) {
              const origTotal = Math.round(total / 0.5)
              return (
                <div className="px-5 py-2 flex justify-between" style={{ background: '#FFF5F3' }}>
                  <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>🎉 ส่วนลดลูกค้าใหม่ 50%</p>
                  <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>-฿{(origTotal - total).toLocaleString()}</p>
                </div>
              )
            }
            const origTotal = Math.round(total / 0.7)
            return (
              <div className="px-5 py-2 flex justify-between" style={{ background: '#FFF5F3' }}>
                <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>ส่วนลด 30%</p>
                <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>-฿{(origTotal - total).toLocaleString()}</p>
              </div>
            )
          })()}
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

            {/* แสดงที่อยู่ที่เลือกอยู่ + ปุ่มเปลี่ยน */}
            {user && addresses.length > 0 && !showNewAddr ? (() => {
              const shownAddr = addresses.find(a => a.id === selAddrId)
                ?? addresses.find(a => a.is_default)
                ?? addresses[0]
              return (
                <div>
                  <div className="rounded-2xl border-2 p-4 mb-2" style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-black text-sm mb-0.5" style={{ color: '#3D1F0F' }}>{shownAddr.name}</p>
                        <p className="text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>{shownAddr.phone}</p>
                        <p className="text-xs leading-relaxed" style={{ color: '#8C7B6E' }}>
                          {[shownAddr.full_address, shownAddr.subdistrict, shownAddr.district, shownAddr.province, shownAddr.zip].filter(Boolean).join(' ')}
                        </p>
                      </div>
                      <button onClick={() => setShowNewAddr(true)}
                        className="text-xs px-3 py-1.5 rounded-xl border-2 flex-shrink-0 transition-all active:scale-95"
                        style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                        เปลี่ยน
                      </button>
                    </div>
                  </div>
                </div>
              )
            })() : (
              /* ถ้ายังไม่มีที่อยู่ หรือกดเปลี่ยน — แสดง list ให้เลือก */
              <div>
                {addresses.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {addresses.map(a => (
                      <div key={a.id}
                        onClick={() => {
                          setSelAddrId(a.id)
                          setForm(prev => ({
                            ...prev,
                            name:     a.name,
                            phone:    a.phone,
                            address:  a.full_address,
                            province: a.province,
                            zip:      a.zip || '',
                          }))
                          setTimeout(() => setShowNewAddr(false), 50)
                        }}
                        className="rounded-xl border-2 p-3 cursor-pointer transition-all active:scale-98"
                        style={{
                          background: selAddrId === a.id ? '#FFF5F3' : '#EDE8DF',
                          borderColor: selAddrId === a.id ? '#D64B2A' : '#D8D0C5',
                        }}>
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-black" style={{ color: '#3D1F0F' }}>{a.name}
                              {a.is_default && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: '#D64B2A', color: '#EDE8DF' }}>หลัก</span>}
                            </p>
                            <p className="text-xs" style={{ color: '#8C7B6E' }}>{[a.full_address, a.province].filter(Boolean).join(' ')}</p>
                          </div>
                          {selAddrId === a.id && <span style={{ color: '#D64B2A' }}>✓</span>}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowNewAddr(false)}
                      className="w-full text-xs py-2 rounded-xl border-2 transition-all"
                      style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                      ยกเลิก
                    </button>
                  </div>
                )}
                {!addresses.length && (
                  <AddressForm
                    hideButton
                    onChange={(data) => setForm(prev => ({ ...prev, name: data.name, phone: data.phone, address: data.full_address, province: data.province, zip: data.zip }))}
                    onSave={(data) => {
                      setForm(prev => ({ ...prev, name: data.name, phone: data.phone, address: data.full_address, province: data.province, zip: data.zip }))
                      if (user?.phone) {
                        fetch(`${SB_URL}/rest/v1/addresses`, {
                          method: 'POST',
                          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
                          body: JSON.stringify({ ...data, phone: user.phone, customer_id: user.id }),
                        }).then(() => { if (user?.phone) fetchAddresses(user.phone) })
                      }
                    }}
                  />
                )}
              </div>
            )}

            {/* หมายเหตุ */}
            <div>
              <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>หมายเหตุ (ถ้ามี)</label>
              <input type="text" placeholder="เช่น แพ้นม หรืออื่นๆ"
                value={form.note}
                onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none"
                style={{ background: '#EDE8DF', color: '#3D1F0F', borderColor: '#D8D0C5' }} />
            </div>


            {errors.address  && <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>กรุณาเลือกหรือกรอกที่อยู่จัดส่ง</p>}
            {errors.province && <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>กรุณาระบุจังหวัด</p>}
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
