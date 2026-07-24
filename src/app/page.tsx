'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'
import { useAuth } from '@/context/AuthContext'
import { fbTrack } from '@/lib/fbpixel'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type Product = {
  id: number
  sku: string
  name: string
  description: string
  flavor: string
  roast: string
  process: string
  price: number
  price_original: number
  price_discounted: number
  price_shopee: number
  discount_pct: number
  stock: number
  active: boolean
  sort_order: number
}

type CartItem = { sku: string; qty: number; price: number; name: string }

// Color accent per product
const SKU_COLOR: Record<string, string> = {
  'ORIGINAL':     '#8B5E3C',
  'DARK':         '#2C1810',
  'HONEY':        '#D4890A',
  'NUTTY':        '#C17F3A',
  'FRUITY':       '#E05A7A',
  'ORIGINAL-200': '#8B5E3C',
  'DARK-200':     '#2C1810',
  'HONEY-200':    '#D4890A',
  'NUTTY-200':    '#C17F3A',
  'FRUITY-200':   '#E05A7A',
  'KYOHO':        '#6B3FA0',
  'GESHA':        '#C17F3A',
}

// Group products
const GROUP_LABELS: Record<string, string> = {
  '1L':   'Cold Brew Concentrate 1L',
  '200ml': 'ขนาดทดลอง 200ml',
  'drip': 'Cold Drip Premium 200ml',
}

function groupProducts(products: Product[]) {
  const groups: Record<string, Product[]> = { '1L': [], '200ml': [], 'drip': [] }
  products.forEach(p => {
    if (p.sku.includes('-200')) groups['200ml'].push(p)
    else if (p.sku === 'KYOHO' || p.sku === 'GESHA') groups['drip'].push(p)
    else groups['1L'].push(p)
  })
  return groups
}

// SKU metadata (same as product page)
const SKU_META: Record<string, { bg: string; accent: string; img: string; dark: boolean }> = {
  'ORIGINAL': { bg: '#F5C5A0', accent: '#D64B2A', img: '/products/original.png', dark: false },
  'DARK':     { bg: '#2C1810', accent: '#C17F3A', img: '/products/dark.png',     dark: true  },
  'HONEY':    { bg: '#F9D0DC', accent: '#E05A7A', img: '/products/honey.png',    dark: false },
  'NUTTY':    { bg: '#C8E8F5', accent: '#4A8FBF', img: '/products/nutty.png',    dark: false },
  'FRUITY':   { bg: '#C8EFC0', accent: '#3A8F3A', img: '/products/fruity.png',   dark: false },
  'KYOHO':    { bg: '#2A1A3A', accent: '#9B6AC0', img: '/products/kyoho.png',    dark: true  },
  'GESHA':    { bg: '#F0E0C0', accent: '#C07830', img: '/products/gesha.png',    dark: false },
}

function getBaseSku(sku: string) { return sku.replace('-200', '') }

function ProductCard({ product, onAdd, firstOrderDiscount }: { product: Product; onAdd: (p: Product) => void; firstOrderDiscount?: boolean }) {
  const baseSku = getBaseSku(product.sku)
  const meta    = SKU_META[baseSku] || { bg: '#F5F1EB', accent: '#D64B2A', img: '', dark: false }
  // แสดงราคาปกติ (หลังลด 30%) เสมอ — ส่วนลดลูกค้าใหม่ 50% (เพดาน ฿130) คิดระดับบิลตอน checkout
  const effectivePrice = product.price_discounted || product.price
  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ background: meta.bg }}>

      {/* Product image — full frame */}
      <Link href={`/product/${baseSku}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          {/* Tag ลูกค้าใหม่ -50% — มุมขวาล่างของรูป (โชว์เฉพาะคนมีสิทธิ์, ราคายังปกติ) */}
          {firstOrderDiscount && (
            <div className="absolute bottom-2 right-2 z-10 px-2 py-1 rounded-lg text-xs font-black uppercase shadow-md"
              style={{ background: '#D64B2A', color: '#EDE8DF', fontFamily: 'var(--font-display)' }}>
              ลูกค้าใหม่ -50%
            </div>
          )}
          {meta.img
            ? <img src={meta.img} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            : <div className="w-full h-full flex items-center justify-center opacity-20"><VelaBunny size={60} /></div>
          }
        </div>
      </Link>

      {/* Bottom info */}
      <div className="px-4 py-3" style={{ background: 'rgba(245,241,235,0.95)' }}>
        <Link href={`/product/${baseSku}`}>
          <h3 className="font-black text-lg uppercase leading-none hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', color: meta.accent }}>
            {baseSku}
          </h3>
        </Link>
        {product.roast && (
          <p className="text-xs font-mono mt-0.5 mb-2" style={{ color: '#8C7B6E' }}>{product.roast}</p>
        )}
        {/* แถวราคา — wrap ได้ ไม่เบียดปุ่ม */}
        <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 mb-2.5">
          {/* ราคาหลังลด */}
          <span className="text-xl font-black leading-none" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
            ฿{effectivePrice}
          </span>
          {/* ราคาเต็มตัดเส้น */}
          <span className="text-xs font-mono line-through" style={{ color: '#C5BAB0' }}>
            ฿{product.price_original || product.price}
          </span>
          {/* badge ส่วนลด */}
          <span className="text-xs font-mono px-1.5 py-0.5 rounded-lg"
            style={{ background: '#D64B2A', color: '#EDE8DF' }}>
            -{product.discount_pct || 30}%
          </span>
        </div>
        {/* ปุ่มเพิ่มตะกร้า — เต็มความกว้าง ได้สัดส่วนทุกขนาดจอ */}
        <button onClick={() => onAdd(product)}
          className="w-full text-sm font-black uppercase py-2 rounded-xl transition-all active:scale-95 whitespace-nowrap"
          style={{ background: meta.accent, color: '#EDE8DF', fontFamily: 'var(--font-display)' }}>
          + ตะกร้า
        </button>
      </div>
    </div>
  )
}

// Leaderboard teaser — แสดง top 3 คร่าวๆ พร้อมลิงก์ไปหน้า leaderboard เต็ม
function LeaderboardTeaser() {
  const [top3,    setTop3]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/leaderboard?limit=3`)
      .then(r => r.json())
      .then(data => setTop3(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ถ้ายังไม่มีข้อมูลเลย หรือกำลังโหลด — ไม่ต้องแสดง section นี้เพื่อไม่ให้ดูว่างเปล่า
  if (loading || top3.length === 0) return null

  const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <section className="py-8 px-5">
      <div className="max-w-2xl mx-auto">
        <Link href="/leaderboard" className="block rounded-3xl overflow-hidden border-2 transition-all hover:shadow-md active:scale-[0.99]"
          style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>
                🏆 VeLA Ranking เดือนนี้
              </p>
              <span className="text-xs font-mono" style={{ color: '#854F0B' }}>ดูทั้งหมด →</span>
            </div>
            <div className="space-y-1.5">
              {top3.map(entry => (
                <div key={entry.rank} className="flex items-center gap-2 text-sm">
                  <span>{MEDAL[entry.rank]}</span>
                  <span className="flex-1 truncate" style={{ color: '#3D1F0F' }}>{entry.customer || 'ลูกค้า VeLA'}</span>
                  <span className="font-mono font-bold" style={{ color: '#D64B2A' }}>{entry.points} pt</span>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

// ช่องทางการติดต่อร้าน (LINE / Facebook / TikTok)
function ContactSection() {
  const CONTACTS = [
    { name: 'LINE', href: 'https://lin.ee/rdPxbQ8', bg: '#06C755',
      icon: (<svg width="22" height="22" viewBox="0 0 40 40" fill="none"><path d="M20 4C11.163 4 4 10.268 4 18c0 5.946 3.917 11.11 9.8 13.687.43.186.36.501.27.699l-.87 3.247c-.1.383.35.695.711.505C18.447 33.993 28 27.9 28 27.9c.695 0 8-.895 8-9.9C36 10.268 28.837 4 20 4z" fill="#fff"/></svg>) },
    { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61568850250186', bg: '#1877F2',
      icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>) },
    { name: 'TikTok', href: 'https://www.tiktok.com/@velacoldbrew', bg: '#000000',
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v12.9a2.59 2.59 0 1 1-2.6-2.6c.27 0 .53.05.78.12v-3.3a5.9 5.9 0 0 0-.78-.05 5.88 5.88 0 1 0 5.88 5.88V9.9a7.5 7.5 0 0 0 4.38 1.4V8.1a4.28 4.28 0 0 1-3.4-2.28z"/></svg>) },
  ]
  return (
    <section className="py-10 px-5">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-black uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          ช่องทางการติดต่อ
        </h2>
        <p className="text-sm mb-5" style={{ color: '#8C7B6E' }}>ติดตามข่าวสาร โปรโมชั่น และสอบถามได้ที่</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {CONTACTS.map(c => (
            <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 hover:opacity-90"
              style={{ background: c.bg, color: '#fff', fontFamily: 'var(--font-display)' }}>
              {c.icon}{c.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// Tracking section
function TrackingSection() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error,   setError]   = useState('')

  // รับทุกขนส่ง: ไปรษณีย์ไทย JM…TH / EMS …TH, Flash TH…C, KEX SXF…, J&T ฯลฯ
  const parseInput = (raw: string) =>
    raw.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(s => /^[A-Z0-9]{8,}$/.test(s))

  const handleTrack = async () => {
    const barcodes = parseInput(input)
    if (!barcodes.length) { setError('กรุณาใส่เลขพัสดุให้ถูกต้อง'); return }
    setError(''); setLoading(true); setResults([])
    try {
      const res  = await fetch(`${API}/track/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodes }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch { setError('เชื่อมต่อไม่ได้ กรุณาลองใหม่') }
    finally { setLoading(false) }
  }

  const STATUS_COLOR: Record<string, string> = {
    accepted: '#8C7B6E', in_transit: '#8B5E00', out_for_delivery: '#1A5C8F',
    delivered: '#1A6B3C', returned: '#D64B2A', problem: '#D64B2A', pending: '#C5BAB0',
  }

  return (
    <section className="py-16 px-5" style={{ background: '#E8E2D8' }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-black uppercase text-center mb-2"
          style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          ติดตามพัสดุ
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: '#8C7B6E' }}>ใส่เลขพัสดุเพื่อตรวจสอบสถานะ (ไปรษณีย์ไทย · Flash · KEX)</p>

        <div className="rounded-2xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleTrack())}
            placeholder={'เช่น TH17018Z9BAF4A หรือ JM123456789TH'} rows={2}
            className="w-full rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none border-2 transition-all"
            style={{ background: '#EDE8DF', color: '#3D1F0F', borderColor: '#D8D0C5' }} />
          {error && <p className="text-xs mt-1 font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
          <button onClick={handleTrack} disabled={loading}
            className="mt-3 w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-display)', fontSize: '15px', background: '#D64B2A', color: '#EDE8DF' }}>
            {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}
          </button>
        </div>

        {results.map(r => (
          <div key={r.barcode} className="mt-3 rounded-2xl border-2 overflow-hidden"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b-2" style={{ borderColor: '#E0D9CE' }}>
              <p className="font-mono text-sm font-bold" style={{ color: '#3D1F0F' }}>{r.barcode}</p>
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ color: STATUS_COLOR[r.status] || '#8C7B6E', background: (STATUS_COLOR[r.status] || '#8C7B6E') + '20' }}>
                {r.status_th || r.status}
              </span>
            </div>
            {/* Timeline */}
            {r.events && r.events.length > 0 ? (
              <div className="px-5 py-3 space-y-2">
                {[...r.events].reverse().map((e: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: i === 0 ? '#D64B2A' : '#D8D0C5' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight" style={{ color: i === 0 ? '#3D1F0F' : '#8C7B6E' }}>
                        {e.description || e.status_th || e.status}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {e.location && (
                          <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{e.location}</p>
                        )}
                        {e.datetime && (
                          <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{e.datetime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : r.latest_event ? (
              <div className="px-5 py-3">
                <p className="text-xs" style={{ color: '#8C7B6E' }}>{r.latest_event.description || r.latest_event.location}</p>
                {r.latest_event.datetime && <p className="text-xs font-mono mt-0.5" style={{ color: '#C5BAB0' }}>{r.latest_event.datetime}</p>}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart,     setCart]     = useState<CartItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showCart, setShowCart] = useState(false)

  // โหลด cart จาก localStorage ตอนเริ่ม
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vela_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch {}
  }, [])

  const [firstOrderDiscount, setFirstOrderDiscount] = useState(false)

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data.products) ? data.products : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // เช็คส่วนลดลูกค้าใหม่เมื่อ login แล้ว
  useEffect(() => {
    if (!user?.phone) return
    fetch(`${API}/products/check-first-order?phone=${encodeURIComponent(user.phone)}`)
      .then(r => r.json())
      .then(d => setFirstOrderDiscount(d.eligible === true))
      .catch(() => {})
  }, [user?.phone])

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('vela_cart', JSON.stringify(
      newCart
    ))
  }

  const addToCart = (product: Product) => {
    // เก็บราคาปกติ (หลังลด 30%) — ส่วนลดลูกค้าใหม่ 50% เพดาน ฿130 คิดระดับบิลตอน checkout
    const cartPrice = product.price_discounted || product.price
    // FB Pixel: AddToCart
    fbTrack('AddToCart', {
      content_ids:  [product.sku],
      content_name: product.name,
      content_type: 'product',
      contents:     [{ id: product.sku, quantity: 1 }],
      value:        cartPrice,
      currency:     'THB',
    })
    setCart(prev => {
      const existing = prev.find(i => i.sku === product.sku)
      const newCart: CartItem[] = existing
        ? prev.map(i => i.sku === product.sku ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { sku: product.sku, qty: 1, price: cartPrice, name: product.name }]
      localStorage.setItem('vela_cart', JSON.stringify(newCart))
      localStorage.setItem('vela_first_order_discount', firstOrderDiscount ? '1' : '0')
      return newCart
    })
    setShowCart(true)
  }

  const updateQty = (sku: string, qty: number) => {
    setCart(prev => {
      const newCart: CartItem[] = qty <= 0
        ? prev.filter(i => i.sku !== sku)
        : prev.map(i => i.sku === sku ? { ...i, qty } : i)
      localStorage.setItem('vela_cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const groups = groupProducts(products)

  return (
    <main style={{ background: '#EDE8DF', minHeight: '100vh' }}>

      {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: '#EDE8DF', position: 'relative' }}>
          <div className="max-w-5xl mx-auto px-5 pt-10 pb-8 flex flex-col items-center text-center">

          {/* Logo */}
          <img src="/logo.png" alt="VeLA Cold Brew" className="h-24 md:h-32 mb-4 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />

          {/* Top right — LINE login + account */}
          <div className="absolute top-5 right-5 flex items-center gap-2">
            {user?.picture_url && (
              <Link href="/account">
                <img src={user.picture_url} alt={user.display_name || 'profile'}
                  className="w-8 h-8 rounded-full border-2 object-cover"
                  style={{ borderColor: '#D8D0C5' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </Link>
            )}
            <Link href="/account" className="text-xs font-mono px-3 py-1.5 rounded-xl border-2 transition-all hover:opacity-80"
              style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
              {user ? (user.display_name?.split(' ')[0] || 'บัญชีฉัน') : 'เข้าสู่ระบบ'}
            </Link>
            {!user && <LineLoginButton />}
          </div>

          {/* Tagline — single line mixed font */}
          <p className="text-center leading-none" style={{ fontSize: 'clamp(18px, 3vw, 32px)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: '#8C7B6E' }}>
              Have a nice{' '}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#D64B2A', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Full Day{' '}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: '#8C7B6E' }}>
              with{' '}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: '#D64B2A', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Cold Brew
            </span>
          </p>
        </div>
      </section>

      {/* Promo banner — ลูกค้าใหม่ลด 50% (โฆษณา landing) */}
      <section className="px-5 pt-2 mb-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl px-5 py-3 text-center border-2"
            style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
            <p className="font-black text-sm md:text-base uppercase leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
              🎉 ลูกค้าใหม่! ออเดอร์แรกลด 50% สูงสุด ฿130
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#8C7B6E' }}>
              ลดอัตโนมัติตอนสั่งซื้อ · 1 สิทธิ์/เบอร์
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="px-5 pb-16">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-sm font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products
                .filter(p => !p.sku.includes('-200'))
                .map(p => <ProductCard key={p.sku} product={p} onAdd={addToCart} firstOrderDiscount={firstOrderDiscount} />)}
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard teaser */}
      <LeaderboardTeaser />

      {/* Tracking */}
      <TrackingSection />

      {/* ช่องทางการติดต่อร้าน */}
      <ContactSection />

      {/* Footer */}
      <footer className="py-8 text-center text-xs font-mono" style={{ color: '#C5BAB0', background: '#EDE8DF' }}>
        VeLA Cold Brew Coffee © {new Date().getFullYear()}
      </footer>

      {/* Cart floating button */}
      {cart.length > 0 && !showCart && (
        <button onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-black uppercase text-sm transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
          🛒 ตะกร้า ({cart.reduce((s, i) => s + i.qty, 0)}) · ฿{total.toLocaleString()}
        </button>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md mx-4 mb-4 md:mb-0 rounded-3xl border-2 overflow-hidden"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>

            <div className="px-5 py-4 border-b-2 flex items-center justify-between" style={{ borderColor: '#E0D9CE' }}>
              <h3 className="font-black text-xl uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                ตะกร้าสินค้า
              </h3>
              <button onClick={() => setShowCart(false)} style={{ color: '#8C7B6E' }}>✕</button>
            </div>

            <div className="px-5 py-3 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.sku} className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: '#E0D9CE' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#3D1F0F' }}>{item.name}</p>
                    <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>฿{item.price} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => updateQty(item.sku, item.qty - 1)}
                      className="w-7 h-7 rounded-lg border-2 text-sm font-bold flex items-center justify-center"
                      style={{ borderColor: '#D8D0C5', color: '#3D1F0F' }}>−</button>
                    <span className="text-sm font-mono w-4 text-center" style={{ color: '#3D1F0F' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.sku, item.qty + 1)}
                      className="w-7 h-7 rounded-lg border-2 text-sm font-bold flex items-center justify-center"
                      style={{ borderColor: '#D8D0C5', color: '#3D1F0F' }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t-2" style={{ borderColor: '#E0D9CE' }}>
              <div className="flex justify-between mb-4">
                <span className="font-mono text-sm" style={{ color: '#8C7B6E' }}>รวม</span>
                <span className="font-black text-xl" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
                  ฿{total.toLocaleString()}
                </span>
              </div>
              <Link href={`/checkout?cart=${encodeURIComponent(localStorage.getItem('vela_cart') || '[]')}`}
                className="block w-full py-3.5 rounded-2xl text-center font-black uppercase tracking-widest transition-all active:scale-95"
                style={{ fontFamily: 'var(--font-display)', fontSize: '16px', background: '#D64B2A', color: '#EDE8DF' }}>
                สั่งซื้อเลย
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
