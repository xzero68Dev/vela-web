'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'

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
  price_shopee: number
  stock: number
  active: boolean
  sort_order: number
}

type CartItem = { product: Product; qty: number }

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

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const baseSku = getBaseSku(product.sku)
  const meta    = SKU_META[baseSku] || { bg: '#F5F1EB', accent: '#D64B2A', img: '', dark: false }

  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ background: meta.bg }}>

      {/* Product image — full frame */}
      <Link href={`/product/${baseSku}`} className="block">
        <div className="aspect-square overflow-hidden">
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
        <div className="flex items-center justify-between">
          <span className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
            ฿{product.price}
          </span>
          <button onClick={() => onAdd(product)}
            className="text-xs font-black uppercase px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: meta.accent, color: '#EDE8DF', fontFamily: 'var(--font-display)' }}>
            + ตะกร้า
          </button>
        </div>
      </div>
    </div>
  )
}

// Tracking section
function TrackingSection() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error,   setError]   = useState('')

  const parseInput = (raw: string) =>
    raw.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(s => /^[A-Z]{2}\d{6,}TH$/i.test(s))

  const handleTrack = async () => {
    const barcodes = parseInput(input)
    if (!barcodes.length) { setError('กรุณาใส่เลข tracking รูปแบบ JMxxxxxxxxTH'); return }
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
        <p className="text-center text-sm mb-6" style={{ color: '#8C7B6E' }}>ใส่เลข tracking เพื่อตรวจสอบสถานะ</p>

        <div className="rounded-2xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleTrack())}
            placeholder={'JM123456789TH\nJM987654321TH'} rows={2}
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
          <div key={r.barcode} className="mt-3 rounded-2xl border-2 px-5 py-4"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm" style={{ color: '#3D1F0F' }}>{r.barcode}</p>
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ color: STATUS_COLOR[r.status] || '#8C7B6E', background: (STATUS_COLOR[r.status] || '#8C7B6E') + '15' }}>
                {r.status_th || r.status}
              </span>
            </div>
            {r.latest_event?.location && (
              <p className="text-xs mt-1 font-mono" style={{ color: '#8C7B6E' }}>
                {r.latest_event.location}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const [products, setProducts]     = useState<Product[]>([])
  const [cart,     setCart]         = useState<CartItem[]>([])
  const [loading,  setLoading]      = useState(true)
  const [showCart, setShowCart]     = useState(false)

  useEffect(() => {
    if (!SB_URL || !SB_KEY) { setLoading(false); return }
    fetch(`${SB_URL}/rest/v1/products?active=eq.true&order=sort_order`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    })
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.sku === product.sku)
      if (existing) return prev.map(i => i.product.sku === product.sku ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
    setShowCart(true)
  }

  const updateQty = (sku: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.sku !== sku))
    else setCart(prev => prev.map(i => i.product.sku === sku ? { ...i, qty } : i))
  }

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const groups = groupProducts(products)

  return (
    <main style={{ background: '#EDE8DF', minHeight: '100vh' }}>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#EDE8DF' }}>
        <div className="max-w-5xl mx-auto px-5 py-16 flex flex-col items-center text-center">
          <div className="animate-float mb-6">
            <VelaBunny size={64} />
          </div>
          <h1 className="text-7xl md:text-9xl font-black uppercase leading-none mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#D64B2A', letterSpacing: '-0.03em' }}>
            VeLA
          </h1>
          <p className="text-sm tracking-[0.3em] uppercase font-mono mb-2" style={{ color: '#8C7B6E' }}>
            Cold Brew Coffee
          </p>
          <p className="text-base max-w-md" style={{ color: '#8C7B6E', fontFamily: 'var(--font-body)' }}>
            กาแฟสกัดเย็น จากเมล็ดกาแฟคุณภาพสูง<br />สัดดนานกว่า 20 ชั่วโมง
          </p>
          <div className="mt-6 px-5 py-2 rounded-full text-xs font-mono border-2"
            style={{ borderColor: '#D64B2A', color: '#D64B2A' }}>
            🐰 ราคาพิเศษ สั่งตรงกับร้าน ถูกกว่า Shopee
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
                .map(p => <ProductCard key={p.sku} product={p} onAdd={addToCart} />)}
            </div>
          )}
        </div>
      </section>

      {/* Tracking */}
      <TrackingSection />

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
                <div key={item.product.sku} className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: '#E0D9CE' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#3D1F0F' }}>{item.product.name}</p>
                    <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>฿{item.product.price} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => updateQty(item.product.sku, item.qty - 1)}
                      className="w-7 h-7 rounded-lg border-2 text-sm font-bold flex items-center justify-center"
                      style={{ borderColor: '#D8D0C5', color: '#3D1F0F' }}>−</button>
                    <span className="text-sm font-mono w-4 text-center" style={{ color: '#3D1F0F' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.product.sku, item.qty + 1)}
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
              <Link href={`/checkout?cart=${encodeURIComponent(JSON.stringify(cart.map(i => ({ sku: i.product.sku, qty: i.qty, price: i.product.price, name: i.product.name }))))}`}
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
