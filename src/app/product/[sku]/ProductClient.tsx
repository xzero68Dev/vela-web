'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { fbTrack } from '@/lib/fbpixel'
import { SKU_META, SKU_DETAIL, resolveSku } from '@/lib/products-data'

type Product = {
  id: number; sku: string; name: string; description: string
  flavor: string; roast: string; process: string
  price: number; price_original: number; price_discounted: number; price_shopee: number
  discount_pct: number; stock: number; active: boolean; sort_order: number
}

export default function ProductClient({ sku }: { sku: string }) {
  const { user } = useAuth()
  const rawSku  = resolveSku(sku)
  const meta    = SKU_META[rawSku]
  const detail  = SKU_DETAIL[rawSku]
  const isDark  = meta.dark

  const [products,   setProducts]   = useState<Product[]>([])
  const [sizeOption, setSizeOption] = useState<'1L' | '200ml'>('1L')
  const [qty,        setQty]        = useState(1)
  const [added,      setAdded]      = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [cartCount,  setCartCount]  = useState(0)
  const [cartTotal,  setCartTotal]  = useState(0)

  // โหลด cart count จาก localStorage
  useEffect(() => {
    const updateCartInfo = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('vela_cart') || '[]')
        setCartCount(saved.reduce((s: number, i: any) => s + i.qty, 0))
        setCartTotal(saved.reduce((s: number, i: any) => s + i.price * i.qty, 0))
      } catch {}
    }
    updateCartInfo()
    window.addEventListener('storage', updateCartInfo)
    return () => window.removeEventListener('storage', updateCartInfo)
  }, [])

  const [firstOrderDiscount, setFirstOrderDiscount] = useState(false)

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
    fetch(`${API}/products`)
      .then(r => r.json())
      .then((data: any) => { setProducts(Array.isArray(data.products) ? data.products : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // เช็คส่วนลดลูกค้าใหม่
  useEffect(() => {
    if (!user?.phone) return
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
    fetch(`${API}/products/check-first-order?phone=${encodeURIComponent(user.phone)}`)
      .then(r => r.json())
      .then(d => setFirstOrderDiscount(d.eligible === true))
      .catch(() => {})
  }, [user?.phone])

  const prod1L  = products.find(p => p.sku === rawSku)
  const prod200 = products.find(p => p.sku === `${rawSku}-200`)
  const current = sizeOption === '200ml' && prod200 ? prod200 : prod1L

  // ราคาปกติ (หลังลด 30%) — ส่วนลดลูกค้าใหม่ 50% เพดาน ฿130 คิดระดับบิลตอน checkout
  const price      = current?.price_discounted || current?.price || 0
  const origPrice  = current?.price_original || current?.price || 0
  const discPct    = current?.discount_pct || 0
  const textColor  = isDark ? '#EDE8DF' : '#3D1F0F'

  const handleAddToCart = () => {
    if (!current) return
    const cart = JSON.parse(localStorage.getItem('vela_cart') || '[]')
    const idx = cart.findIndex((i: any) => i.sku === current.sku)
    if (idx >= 0) cart[idx].qty += qty
    else cart.push({ sku: current.sku, qty, price: price, name: current.name })
    localStorage.setItem('vela_cart', JSON.stringify(cart))
    setCartCount(cart.reduce((s: number, i: any) => s + i.qty, 0))
    setCartTotal(cart.reduce((s: number, i: any) => s + i.price * i.qty, 0))
    // FB Pixel: AddToCart
    fbTrack('AddToCart', {
      content_ids:  [current.sku],
      content_name: current.name,
      content_type: 'product',
      contents:     [{ id: current.sku, quantity: qty }],
      value:        price * qty,
      currency:     'THB',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // FB Pixel: ViewContent — ยิงเมื่อเปิดดูรายละเอียดสินค้า
  useEffect(() => {
    if (!current) return
    fbTrack('ViewContent', {
      content_ids:  [current.sku],
      content_name: current.name,
      content_type: 'product',
      value:        price,
      currency:     'THB',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.sku, sizeOption])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDE8DF' }}>
      <p className="font-mono text-sm" style={{ color: '#C5BAB0' }}>กำลังโหลด...</p>
    </div>
  )

  return (
    <main style={{ background: '#EDE8DF', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: meta.bg }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        <div className="max-w-5xl mx-auto px-5 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: textColor }}>← กลับร้าน</Link>
        </div>

        <div className="max-w-5xl mx-auto px-5 pb-12 grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="flex justify-center order-first md:order-last relative">
            <img src={meta.img} alt={detail.name}
              className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl animate-float" />
            {firstOrderDiscount && (
              <span className="absolute bottom-2 right-2 text-xs font-black px-3 py-1 rounded-full shadow-md"
                style={{ background: '#D64B2A', color: '#EDE8DF', fontFamily: 'var(--font-display)' }}>
                ลูกค้าใหม่ -50%
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1 opacity-50" style={{ color: textColor }}>
              VeLA Cold Brew Coffee
            </p>
            <h1 className="text-7xl font-black uppercase leading-none mb-2"
              style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>
              {rawSku}
            </h1>
            <p className="text-sm font-semibold mb-1 leading-snug" style={{ color: textColor, fontFamily: 'var(--font-body)' }}>
              {detail.name}
            </p>
            <p className="text-xs font-mono mb-3 opacity-60" style={{ color: textColor }}>{detail.origin}</p>
            <p className="text-base mb-6 leading-relaxed" style={{ color: textColor, fontFamily: 'var(--font-body)' }}>
              {detail.tagline}
            </p>

            {/* Size selector */}
            {prod200 && (
              <div className="flex gap-2 mb-5">
                {(['1L', '200ml'] as const).map(s => (
                  <button key={s} onClick={() => setSizeOption(s)}
                    className="px-4 py-2 rounded-xl border-2 text-sm font-mono transition-all"
                    style={sizeOption === s
                      ? { background: meta.accent, color: '#EDE8DF', borderColor: meta.accent }
                      : { background: 'transparent', color: textColor, borderColor: isDark ? '#FFFFFF30' : '#D8D0C5' }}>
                    {s === '1L' ? '1 ลิตร' : 'ขนาดทดลอง 200ml'}
                  </button>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="text-5xl font-black" style={{ fontFamily: 'var(--font-display)', color: textColor }}>
                ฿{price}
              </span>
              {discPct > 0 && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm line-through opacity-40" style={{ color: textColor }}>฿{origPrice}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: meta.accent + '30', color: meta.accent }}>-{discPct}%</span>
                </div>
              )}
            </div>

            {/* Qty + cart */}
            <div className="flex gap-3 items-center mb-3">
              <div className="flex items-center gap-2 rounded-xl border-2 px-3 py-2.5"
                style={{ borderColor: isDark ? '#FFFFFF30' : '#D8D0C5' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-6 h-6 font-bold text-lg flex items-center justify-center"
                  style={{ color: textColor }}>−</button>
                <span className="w-6 text-center font-mono text-sm" style={{ color: textColor }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-6 h-6 font-bold text-lg flex items-center justify-center"
                  style={{ color: textColor }}>+</button>
              </div>
              <button onClick={handleAddToCart}
                className="flex-1 py-3 rounded-xl font-black uppercase tracking-wider transition-all active:scale-95"
                style={{
                  fontFamily: 'var(--font-display)', fontSize: '15px',
                  background: added ? '#1A6B3C' : meta.accent, color: '#EDE8DF',
                }}>
                {added ? '✓ เพิ่มแล้ว!' : '+ ใส่ตะกร้า'}
              </button>
            </div>
            {/* ปุ่ม checkout ทันที */}
            <Link href={`/checkout?cart=${encodeURIComponent(JSON.stringify([{ sku: current?.sku, qty, price: price, name: current?.name }]))}`}
              className="block w-full py-3 rounded-xl text-center font-black uppercase tracking-wider mt-2 transition-all active:scale-95 border-2"
              style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: meta.accent, borderColor: meta.accent }}>
              สั่งซื้อเลย →
            </Link>
            <p className="text-xs font-mono opacity-50 mt-2" style={{ color: textColor }}>
              🚚 ส่งฟรี · ผลิตสดทุกวัน · เก็บได้ 1 เดือน (นับจากวันที่ส่ง)
            </p>
          </div>
        </div>
      </div>

      {/* ===== Shopee-style detail ===== */}
      <div className="max-w-5xl mx-auto px-5 py-10">

        {/* จุดเด่น */}
        <section className="mb-8">
          <h2 className="text-2xl font-black uppercase mb-4"
            style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>จุดเด่น</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {detail.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border-2 px-4 py-3"
                style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: meta.accent, color: '#EDE8DF' }}>✓</span>
                <p className="text-sm leading-relaxed" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>{h}</p>
              </div>
            ))}
          </div>
        </section>

        {/* รายละเอียดสินค้า */}
        <section className="mb-8 rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
          <h2 className="text-xl font-black uppercase mb-3"
            style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>รายละเอียดสินค้า</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>
            {detail.description}
          </p>
        </section>

        {/* วิธีชง/ดื่ม + ข้อมูลสินค้า */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <section className="rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <h2 className="text-xl font-black uppercase mb-3"
              style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>วิธีชง / ดื่ม</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>
              {detail.howto}
            </p>
            <div className="rounded-2xl px-4 py-3" style={{ background: meta.bg + '80' }}>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
                ⏱ สกัดเย็นนานกว่า 20 ชั่วโมง · ไม่มีสารปรุงแต่ง · ไม่มีน้ำตาล
              </p>
            </div>
          </section>

          <section className="rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <h2 className="text-xl font-black uppercase mb-3"
              style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>ข้อมูลสินค้า</h2>
            <table className="w-full text-sm">
              <tbody>
                {detail.specs.map((s, i) => (
                  <tr key={s.label} style={{ background: i % 2 ? 'transparent' : '#EDE8DF80' }}>
                    <td className="py-2 px-3 font-mono align-top whitespace-nowrap" style={{ color: '#8C7B6E', width: '38%' }}>{s.label}</td>
                    <td className="py-2 px-3 align-top" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* การเก็บรักษา */}
        <section className="mb-10 rounded-3xl border-2 p-6 flex items-start gap-4"
          style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
          <span className="text-2xl flex-shrink-0">🧊</span>
          <div>
            <h2 className="text-xl font-black uppercase mb-2"
              style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>การเก็บรักษา</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>
              {detail.storage}
            </p>
          </div>
        </section>

        {/* Hashtags */}
        {detail.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {detail.hashtags.map(tag => (
              <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full"
                style={{ background: '#F5F1EB', border: '1px solid #E0D9CE', color: '#8C7B6E' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Other products */}
        {products.filter(p => !p.sku.includes('-200') && p.sku !== rawSku).length > 0 && (
          <div>
            <h2 className="text-2xl font-black uppercase mb-5"
              style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>รสอื่น ๆ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.filter(p => !p.sku.includes('-200') && p.sku !== rawSku).map(p => {
                const mm = SKU_META[p.sku] || SKU_META['ORIGINAL']
                return (
                  <Link key={p.sku} href={`/product/${p.sku}`}
                    className="rounded-2xl overflow-hidden border-2 transition-all hover:shadow-md active:scale-95"
                    style={{ borderColor: '#E0D9CE', background: mm.bg }}>
                    <img src={mm.img} alt={p.name} className="w-full aspect-square object-contain p-3" />
                    <div className="px-3 pb-3">
                      <p className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: mm.accent }}>
                        {p.sku}
                      </p>
                      <p className="font-mono text-xs" style={{ color: mm.dark ? '#C5BAB0' : '#8C7B6E' }}>฿{p.price_discounted || p.price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <Link href={`/checkout?cart=${encodeURIComponent(localStorage.getItem('vela_cart') || '[]')}`}
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-black uppercase text-sm transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
          🛒 ({cartCount}) · ฿{cartTotal.toLocaleString()}
        </Link>
      )}
    </main>
  )
}
