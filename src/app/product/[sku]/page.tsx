'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import { useAuth } from '@/context/AuthContext'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type Product = {
  id: number; sku: string; name: string; description: string
  flavor: string; roast: string; process: string
  price: number; price_original: number; price_discounted: number; price_shopee: number
  discount_pct: number; stock: number; active: boolean; sort_order: number
}

const SKU_META: Record<string, { bg: string; accent: string; img: string; dark: boolean }> = {
  'ORIGINAL': { bg: '#F5C5A0', accent: '#D64B2A', img: '/products/original.png', dark: false },
  'DARK':     { bg: '#2C1810', accent: '#C17F3A', img: '/products/dark.png',     dark: true  },
  'HONEY':    { bg: '#F9D0DC', accent: '#E05A7A', img: '/products/honey.png',    dark: false },
  'NUTTY':    { bg: '#C8E8F5', accent: '#4A8FBF', img: '/products/nutty.png',    dark: false },
  'FRUITY':   { bg: '#C8EFC0', accent: '#3A8F3A', img: '/products/fruity.png',   dark: false },
  'KYOHO':    { bg: '#2A1A3A', accent: '#9B6AC0', img: '/products/kyoho.png',    dark: true  },
  'GESHA':    { bg: '#F0E0C0', accent: '#C07830', img: '/products/gesha.png',    dark: false },
}

const SKU_DETAIL: Record<string, { tagline: string; description: string; howto: string; origin: string }> = {
  'ORIGINAL': {
    tagline: 'รสชาติบาลานซ์ ไม่เปรี้ยวไม่ขมไป',
    description: 'Original คั่วกลางเข้ม Wash Process รสชาติบาลานซ์ เป็นผลผสมรสชาติใช้สำหรับคนที่ชอบรสชาติกาแฟแบบกลางๆ ไม่เปรี้ยวไม่ขมไป ผสมได้หลากหลายเมนู น้ำเปล่า จะเย็นหรือร้อนก็ได้ นม น้ำส้ม น้ำผลไม้อื่นๆ',
    howto: 'ผสมกาแฟ 1 ส่วน : น้ำ/นม 1 ส่วน (อัตรา 1:1) เช่น กาแฟ 50ml + นม 50ml = กาแฟ 100ml พร้อมดื่ม สามารถปรับความเข้มข้นได้ตามชอบ',
    origin: 'Thai Blend | Wash Process | คั่วกลางเข้ม',
  },
  'DARK': {
    tagline: 'สายขม เข้มสะใจ ไม่เปรี้ยว',
    description: 'Dark คั่วเข้ม Wash Process สายขมสะใจ หอม เข้มสะใจ ไม่เปรี้ยว เหมาะสำหรับคนที่ชอบรสชาติกาแฟเข้มข้น สามารถเติมนมได้ตามชอบ',
    howto: 'ผสมกาแฟ 1 ส่วน : น้ำ/นม 1 ส่วน (อัตรา 1:1) สามารถปรับความเข้มข้นได้ตามชอบ เหมาะทำลาเต้เย็น หรือดื่มแบล็คกาแฟ',
    origin: 'Thai Blend | Wash Process | Dark Roast',
  },
  'HONEY': {
    tagline: 'หอมผลไม้ เปรี้ยวเบาๆ หวานปลาย',
    description: 'Honey คั่วกลาง Honey Process หอมผลไม้ เปรี้ยวเบาๆ หวานปลาย ฟิลธรรมชาติจากน้ำบ้านแม่จันได้อยมาเลย สำหรับคนที่ชอบผสมกลิ่นต่างๆ ไม่ว่าจะใส่นม น้ำส้ม หรืออะไรก็ได้',
    howto: 'ผสมกาแฟ 1 ส่วน : น้ำ/นม 1 ส่วน (อัตรา 1:1) เหมาะทำน้ำผลไม้ผสมกาแฟ หรือลาเต้ใส่น้ำผึ้ง',
    origin: 'Thai Mae Chan Tai | Honey Process | คั่วกลาง',
  },
  'NUTTY': {
    tagline: 'หอมทะลุนม มันนัวร์สุดๆ',
    description: 'Nutty Milk คั่วกลาง Natural Process Brazil Cerrado หอมทะลุนม มันนัว ผสมกับนมลงดีสุด ใครชอบเมนูนมๆจะติดใจ 1 ถุง ปริมาณ 1,000ml',
    howto: 'ผสมกาแฟ 1 ส่วน : นม 1 ส่วน (อัตรา 1:1) เหมาะทำนมกาแฟ ใส่ไอศครีม หรือ smoothie กาแฟนม',
    origin: 'Brazil Cerrado | Natural Process | คั่วกลาง',
  },
  'FRUITY': {
    tagline: 'รสเบอร์รี่ กลิ่นดอกไม้ หวานสดชื่น',
    description: 'Fruity คั่วกลางอ่อน Natural Process Myanmar หอมหึ่งไปกับกลิ่นดอกไม้ และรสชาติเบอร์รี่สุด ตั้งง่ายไลท์ๆ หวานจากธรรมชาติ สดชื่น',
    howto: 'ผสมกาแฟ 1 ส่วน : น้ำ/น้ำผลไม้ 1 ส่วน เหมาะทำ sparkling coffee หรือ coffee tonic ใส่น้ำโซดา',
    origin: 'Myanmar | Natural Process | คั่วกลางอ่อน',
  },
  'KYOHO': {
    tagline: 'Kyoho Grape · Mulberry · Blueberry · Caramel',
    description: 'VeLA Kyoho Cold Drip Premium เราใช้การสกัดแบบหยดน้ำให้ไหลผ่านกาแฟอย่างช้าๆ ใช้เวลานาน 3–8 ชั่วโมง เพื่อให้ได้รสชาติที่เข้มข้น กลมกล่อม และหอมหวาน',
    howto: 'พร้อมดื่มได้เลย 200ml เสิร์ฟแบบ on the rocks หรือผสมนมเล็กน้อย ไม่ต้องเติมน้ำตาล',
    origin: 'Ethiopia Guji Sidama | Wine Yeast Fermentation | Medium Light Roast',
  },
  'GESHA': {
    tagline: 'Floral · Black Tea · Mango · Long Aftertaste',
    description: 'VeLA Gesha Cold Drip Premium ETHIOPIA GESHA (Geisha) Natural Process จากแหล่งปลูก Bench Maji เก็บผลเชอร์รี่ด้วยมือล้วน (Hand Picked) เกรด G1 ระดับสูงกว่าน้ำทะเล 2,000–2,300 เมตร',
    howto: 'พร้อมดื่มได้เลย 200ml เสิร์ฟแบบ on the rocks หรือผสมนมเล็กน้อย ไม่ต้องเติมน้ำตาล',
    origin: 'Ethiopia Gesha | Natural Process | Omni Roast',
  },
}

export default function ProductPage() {
  const { user } = useAuth()
  const params  = useParams()
  const rawSku  = (params.sku as string || '').toUpperCase().replace('-200', '')
  const meta    = SKU_META[rawSku] || SKU_META['ORIGINAL']
  const detail  = SKU_DETAIL[rawSku] || SKU_DETAIL['ORIGINAL']
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

  const handleAddToCart = () => {
    if (!current) return
    const cart = JSON.parse(localStorage.getItem('vela_cart') || '[]')
    const idx = cart.findIndex((i: any) => i.sku === current.sku)
    if (idx >= 0) cart[idx].qty += qty
    else cart.push({ sku: current.sku, qty, price: price, name: current.name })
    localStorage.setItem('vela_cart', JSON.stringify(cart))
    setCartCount(cart.reduce((s: number, i: any) => s + i.qty, 0))
    setCartTotal(cart.reduce((s: number, i: any) => s + i.price * i.qty, 0))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const price      = firstOrderDiscount
    ? Math.round((current?.price || 0) * 0.5)
    : (current?.price_discounted || current?.price || 0)
  const origPrice  = current?.price_original || current?.price || 0
  const discPct    = firstOrderDiscount ? 50 : (current?.discount_pct || 0)
  const textColor  = isDark ? '#EDE8DF' : '#3D1F0F'
  const mutedColor = isDark ? '#8C7B6E' : '#8C7B6E'

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
          <div className="flex justify-center order-first md:order-last">
            <img src={meta.img} alt={rawSku}
              className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl animate-float" />
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

      {/* Detail cards */}
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <h2 className="text-xl font-black uppercase mb-3"
              style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>รายละเอียด</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>
              {detail.description}
            </p>
          </div>
          <div className="rounded-3xl border-2 p-6" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <h2 className="text-xl font-black uppercase mb-3"
              style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>วิธีดื่ม</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#3D1F0F', fontFamily: 'var(--font-body)' }}>
              {detail.howto}
            </p>
            <div className="rounded-2xl px-4 py-3" style={{ background: meta.bg + '80' }}>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
                ⏱ สกัดนานกว่า 20 ชั่วโมง · ไม่มีสารปรุงแต่ง · ไม่มีน้ำตาล
              </p>
            </div>
          </div>
        </div>

        {/* Other products */}
        {products.filter(p => !p.sku.includes('-200') && p.sku !== rawSku).length > 0 && (
          <div>
            <h2 className="text-2xl font-black uppercase mb-5"
              style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>รสอื่นๆ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.filter(p => !p.sku.includes('-200') && p.sku !== rawSku).map(p => {
                const m = SKU_META[p.sku] || SKU_META['ORIGINAL']
                return (
                  <Link key={p.sku} href={`/product/${p.sku}`}
                    className="rounded-2xl overflow-hidden border-2 transition-all hover:shadow-md active:scale-95"
                    style={{ borderColor: '#E0D9CE', background: m.bg }}>
                    <img src={m.img} alt={p.name} className="w-full aspect-square object-contain p-3" />
                    <div className="px-3 pb-3">
                      <p className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: m.accent }}>
                        {p.sku}
                      </p>
                      <p className="font-mono text-xs" style={{ color: m.dark ? '#C5BAB0' : '#8C7B6E' }}>฿{p.price_discounted || p.price}</p>
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
