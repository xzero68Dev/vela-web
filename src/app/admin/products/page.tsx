'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import { adminHeaders } from '@/components/auth'
import AdminNav from '@/components/AdminNav'

const API       = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const SB_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type Product = {
  id: number; sku: string; name: string; flavor: string; roast: string; process: string
  price: number; price_discounted: number; discount_pct: number; active: boolean; in_stock: boolean; sort_order: number
  image_url?: string
}

type NewProduct = {
  sku: string; name: string; price: string; discount_pct: string
  flavor: string; roast: string; process: string; description: string
  image_url: string; active: boolean; in_stock: boolean
  // เนื้อหาหน้าสินค้า (detail)
  origin: string; tagline: string; highlights: string; howto: string
  specs: string; storage: string; hashtags: string
  bg: string; accent: string; dark: boolean
}

const BLANK_NEW: NewProduct = {
  sku: '', name: '', price: '', discount_pct: '0',
  flavor: '', roast: '', process: '', description: '',
  image_url: '', active: true, in_stock: true,
  origin: '', tagline: '', highlights: '', howto: '',
  specs: '', storage: '', hashtags: '',
  bg: '', accent: '', dark: false,
}

const inputStyle = { borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }
const labelCls   = 'block text-xs font-mono mb-1'
const labelStyle = { color: '#8C7B6E' }

export default function AdminProductsPage() {
  const ready = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [editing,  setEditing]  = useState<Record<number, Partial<Product>>>({})
  const [saving,   setSaving]   = useState<number | null>(null)
  const [msg,      setMsg]      = useState('')

  // ── เพิ่มสินค้าใหม่ ──
  const [showAdd,     setShowAdd]     = useState(false)
  const [newP,        setNewP]        = useState<NewProduct>(BLANK_NEW)
  const [adding,      setAdding]      = useState(false)
  const [uploadingImg, setUploadingImg] = useState<number | 'new' | null>(null)

  const fetchProducts = useCallback(async () => {
    // show_all=1 → เห็นสินค้าที่ปิดขายด้วย จะได้กดเปิดกลับได้ (ไม่หายจากหน้า admin)
    const res = await fetch(`${API}/products?show_all=1`)
    const data = await res.json()
    setProducts(data.products || [])
  }, [])

  useEffect(() => { if (ready) fetchProducts() }, [ready, fetchProducts])

  const handleEdit = (id: number, field: string, value: any) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleSave = async (p: Product) => {
    const changes = editing[p.id]
    if (!changes || Object.keys(changes).length === 0) return
    setSaving(p.id)
    try {
      const res = await fetch(`${API}/admin/products/${p.id}`, {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error(await res.text())
      setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n })
      setMsg('✅ บันทึกแล้ว')
      setTimeout(() => setMsg(''), 2000)
      fetchProducts()
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally { setSaving(null) }
  }

  const val = (p: Product, field: keyof Product) =>
    editing[p.id]?.[field] !== undefined ? editing[p.id][field] : p[field]

  const setNew = (field: keyof NewProduct, value: any) =>
    setNewP(prev => ({ ...prev, [field]: value }))

  // อัปโหลดรูปสินค้าไป Supabase Storage — ใช้ bucket "slips" ที่ public + อัปโหลดได้อยู่แล้ว (ไม่ต้องตั้ง bucket ใหม่)
  // ตั้งชื่อไฟล์ขึ้นต้น product- เพื่อแยกจากสลิปในโฟลเดอร์เดียวกัน
  const IMG_BUCKET = 'slips'
  const uploadImage = async (file: File, base: string, tag: number | 'new', onUrl: (url: string) => void) => {
    if (!file) return
    if (!SB_URL || !SB_KEY) { setMsg('❌ ยังไม่ได้ตั้งค่า Supabase (ใช้ช่องวางลิงก์แทนได้)'); return }
    setUploadingImg(tag); setMsg('')
    try {
      const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const rand = (crypto?.randomUUID?.() || `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`).replace(/-/g, '')
      const b    = (base || 'product').replace(/[^a-zA-Z0-9_-]/g, '') || 'product'
      const path = `product-${b}-${Date.now()}-${rand}.${ext}`
      const upRes = await fetch(`${SB_URL}/storage/v1/object/${IMG_BUCKET}/${path}`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': file.type },
        body: file,
      })
      if (!upRes.ok) throw new Error('upload failed')
      onUrl(`${SB_URL}/storage/v1/object/public/${IMG_BUCKET}/${path}`)
      setMsg('✅ อัปโหลดรูปแล้ว')
      setTimeout(() => setMsg(''), 2000)
    } catch {
      setMsg('❌ อัปโหลดรูปไม่สำเร็จ — ลองใหม่ หรือวางลิงก์รูปแทน')
    } finally { setUploadingImg(null) }
  }

  const submitNew = async () => {
    if (!newP.sku.trim() || !newP.name.trim()) { setMsg('❌ ต้องมี SKU และชื่อสินค้า'); return }
    const price = Number(newP.price)
    if (!price || price <= 0) { setMsg('❌ ใส่ราคาให้มากกว่า 0'); return }
    // แปลงช่องข้อความเป็นโครงสร้าง detail (jsonb)
    const highlights = newP.highlights.split('\n').map(s => s.trim()).filter(Boolean)
    const specs = newP.specs.split('\n').map(line => {
      const idx = line.indexOf(':')
      if (idx < 0) return null
      const label = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      return (label && value) ? { label, value } : null
    }).filter(Boolean) as { label: string; value: string }[]
    const hashtags = newP.hashtags.split(/[,\s]+/).map(s => s.replace(/^#/, '').trim()).filter(Boolean)
    const detail = {
      origin:      newP.origin.trim(),
      tagline:     newP.tagline.trim(),
      highlights,
      description: newP.description.trim(),
      howto:       newP.howto.trim(),
      specs,
      storage:     newP.storage.trim(),
      hashtags,
      bg:          newP.bg.trim(),
      accent:      newP.accent.trim(),
      dark:        newP.dark,
    }

    setAdding(true); setMsg('')
    try {
      const res = await fetch(`${API}/admin/products/create`, {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          sku:          newP.sku.trim(),
          name:         newP.name.trim(),
          price,
          discount_pct: Number(newP.discount_pct) || 0,
          flavor:       newP.flavor.trim(),
          roast:        newP.roast.trim(),
          process:      newP.process.trim(),
          description:  newP.description.trim(),
          image_url:    newP.image_url.trim(),
          active:       newP.active,
          in_stock:     newP.in_stock,
          detail,
        }),
      })
      if (!res.ok) {
        let detail = await res.text()
        try { detail = JSON.parse(detail).detail || detail } catch {}
        throw new Error(detail)
      }
      setMsg('✅ เพิ่มสินค้าแล้ว')
      setTimeout(() => setMsg(''), 2500)
      setShowAdd(false)
      setNewP(BLANK_NEW)
      fetchProducts()
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally { setAdding(false) }
  }

  if (!ready) return null

  const newPayPrice = Math.round((Number(newP.price) || 0) * (1 - (Number(newP.discount_pct) || 0) / 100))

  return (
    <main className="min-h-screen pb-20" style={{ background: '#EDE8DF' }}>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-black text-xl uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
            จัดการสินค้า
          </h1>
          {msg && <p className="text-sm font-mono">{msg}</p>}
        </div>

        {/* ── ปุ่ม/ฟอร์มเพิ่มสินค้าใหม่ ── */}
        <div className="mb-6">
          {!showAdd ? (
            <button onClick={() => { setShowAdd(true); setNewP(BLANK_NEW); setMsg('') }}
              className="w-full py-3 rounded-2xl font-black uppercase text-sm border-2 border-dashed transition-all active:scale-95"
              style={{ fontFamily: 'var(--font-display)', borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
              ➕ เพิ่มสินค้าใหม่
            </button>
          ) : (
            <div className="rounded-2xl border-2 overflow-hidden" style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
              <div className="px-5 py-3 border-b-2 flex items-center justify-between" style={{ borderColor: '#F0D0C8' }}>
                <p className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                  ➕ สินค้าใหม่
                </p>
                <button onClick={() => { setShowAdd(false); setNewP(BLANK_NEW) }}
                  className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: '#E0D9CE', color: '#8C7B6E' }}>
                  ✕ ยกเลิก
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* SKU + ชื่อ */}
                <div>
                  <label className={labelCls} style={labelStyle}>SKU <span style={{ color: '#D64B2A' }}>*</span> <span style={{ color: '#C5BAB0' }}>(ใช้จับคู่ราคา/สต็อก · ห้ามซ้ำ · เช่น Dark, Honey)</span></label>
                  <input type="text" value={newP.sku} onChange={e => setNew('sku', e.target.value)}
                    placeholder="เช่น Dark"
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>ชื่อสินค้า <span style={{ color: '#D64B2A' }}>*</span></label>
                  <input type="text" value={newP.name} onChange={e => setNew('name', e.target.value)}
                    placeholder="เช่น Cold Brew Dark Roast 1L"
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                </div>

                {/* ราคา + ส่วนลด */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={labelStyle}>ราคาเต็ม (฿) <span style={{ color: '#D64B2A' }}>*</span></label>
                    <input type="number" min="0" value={newP.price} onChange={e => setNew('price', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>ส่วนลด (%)</label>
                    <input type="number" min="0" max="99" value={newP.discount_pct} onChange={e => setNew('discount_pct', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono" style={inputStyle} />
                  </div>
                </div>

                {/* ราคาที่ลูกค้าจ่าย */}
                <div className="rounded-xl px-4 py-2 flex justify-between items-center" style={{ background: '#D64B2A10', border: '1px solid #D64B2A30' }}>
                  <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>ราคาที่ลูกค้าจ่าย</p>
                  <p className="font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>฿{newPayPrice}</p>
                </div>

                {/* รสชาติ */}
                <div>
                  <label className={labelCls} style={labelStyle}>รสชาติ</label>
                  <input type="text" value={newP.flavor} onChange={e => setNew('flavor', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                </div>

                {/* Roast + Process */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={labelStyle}>การคั่ว</label>
                    <input type="text" value={newP.roast} onChange={e => setNew('roast', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Process</label>
                    <input type="text" value={newP.process} onChange={e => setNew('process', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                </div>

                {/* รายละเอียด */}
                <div>
                  <label className={labelCls} style={labelStyle}>รายละเอียด</label>
                  <textarea value={newP.description} onChange={e => setNew('description', e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                </div>

                {/* รูปสินค้า: อัปโหลด หรือ วางลิงก์ */}
                <div>
                  <label className={labelCls} style={labelStyle}>รูปสินค้า</label>
                  <div className="flex items-start gap-3">
                    {newP.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={newP.image_url} alt="preview" className="w-20 h-20 rounded-xl object-cover border-2" style={{ borderColor: '#D8D0C5' }} />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl" style={{ borderColor: '#D8D0C5', color: '#C5BAB0' }}>🖼️</div>
                    )}
                    <div className="flex-1 space-y-2">
                      <label className="block">
                        <span className="inline-block text-xs font-mono px-3 py-2 rounded-xl border-2 cursor-pointer transition-all active:scale-95"
                          style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }}>
                          {uploadingImg === 'new' ? 'กำลังอัปโหลด...' : '📎 อัปโหลดรูป'}
                        </span>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, newP.sku, 'new', url => setNew('image_url', url)) }} />
                      </label>
                      <input type="text" value={newP.image_url} onChange={e => setNew('image_url', e.target.value)}
                        placeholder="หรือวางลิงก์รูป https://..."
                        className="w-full px-3 py-2 rounded-xl border-2 text-xs font-mono" style={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* ── เนื้อหาหน้าสินค้า (detail) — ไม่บังคับ แต่ถ้าเป็นรสใหม่ควรกรอกให้ครบ ── */}
                <div className="rounded-xl border-2 border-dashed p-3 space-y-3" style={{ borderColor: '#E0C8C0' }}>
                  <p className="text-xs font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: '#B8735A' }}>
                    📄 เนื้อหาหน้าสินค้า (ถ้าเป็นรสใหม่ ควรกรอกให้ครบ)
                  </p>

                  <div>
                    <label className={labelCls} style={labelStyle}>แหล่ง/บรรทัดสั้นใต้ชื่อ (origin)</label>
                    <input type="text" value={newP.origin} onChange={e => setNew('origin', e.target.value)}
                      placeholder="เช่น แม่จันใต้ · Arabica · Honey Process · คั่วกลาง"
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>tagline (บรรทัดเด่น)</label>
                    <input type="text" value={newP.tagline} onChange={e => setNew('tagline', e.target.value)}
                      placeholder="เช่น หอมผลไม้ เปรี้ยวเบา ๆ หวานปลาย ดื่มง่าย"
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>จุดเด่น <span style={{ color: '#C5BAB0' }}>(บรรทัดละ 1 ข้อ)</span></label>
                    <textarea value={newP.highlights} onChange={e => setNew('highlights', e.target.value)} rows={4}
                      placeholder={'หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ\nดื่มง่าย ไลท์ ๆ สบายคอ\nเมล็ด Arabica แม่จันใต้'}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>วิธีชง / ดื่ม</label>
                    <textarea value={newP.howto} onChange={e => setNew('howto', e.target.value)} rows={2}
                      placeholder="ผสมกาแฟ 1 ส่วน : น้ำหรือนม 1 ส่วน (1:1) ปรับได้ตามชอบ"
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>ตารางข้อมูลสินค้า <span style={{ color: '#C5BAB0' }}>(บรรทัดละ 1 แถว รูปแบบ "หัวข้อ: ค่า")</span></label>
                    <textarea value={newP.specs} onChange={e => setNew('specs', e.target.value)} rows={5}
                      placeholder={'ปริมาณ: 1,000 มล. (1 ลิตร)\nเมล็ดกาแฟ: Arabica บ้านแม่จันใต้\nกระบวนการ: Honey Process\nระดับคั่ว: คั่วกลาง\nอัตราส่วนชง: 1:1'}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>การเก็บรักษา</label>
                    <textarea value={newP.storage} onChange={e => setNew('storage', e.target.value)} rows={2}
                      placeholder="บรรจุในถุงฟอยล์ แช่เย็นทันทีหลังได้รับ เก็บได้ 1 เดือน"
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>hashtags <span style={{ color: '#C5BAB0' }}>(คั่นด้วยเว้นวรรคหรือจุลภาค)</span></label>
                    <input type="text" value={newP.hashtags} onChange={e => setNew('hashtags', e.target.value)}
                      placeholder="กาแฟ ColdBrew กาแฟแม่จันใต้ HoneyProcess"
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono" style={inputStyle} />
                  </div>

                  {/* สีธีมหน้าสินค้า */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={labelStyle}>สีพื้นหลัง (bg)</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={newP.bg || '#F5F1EB'} onChange={e => setNew('bg', e.target.value)}
                          className="w-9 h-9 rounded-lg border-2 cursor-pointer" style={{ borderColor: '#D8D0C5' }} />
                        <input type="text" value={newP.bg} onChange={e => setNew('bg', e.target.value)}
                          placeholder="#F9D0DC"
                          className="flex-1 px-3 py-2 rounded-xl border-2 text-xs font-mono" style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>สีเน้น (accent)</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={newP.accent || '#D64B2A'} onChange={e => setNew('accent', e.target.value)}
                          className="w-9 h-9 rounded-lg border-2 cursor-pointer" style={{ borderColor: '#D8D0C5' }} />
                        <input type="text" value={newP.accent} onChange={e => setNew('accent', e.target.value)}
                          placeholder="#E05A7A"
                          className="flex-1 px-3 py-2 rounded-xl border-2 text-xs font-mono" style={inputStyle} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setNew('dark', !newP.dark)}
                    className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
                    style={{ background: newP.dark ? '#3D1F0F' : '#EDE8DF', color: newP.dark ? '#EDE8DF' : '#8C7B6E', border: '1px solid #D8D0C5' }}>
                    {newP.dark ? '🌙 พื้นเข้ม (ตัวอักษรสว่าง)' : '☀️ พื้นสว่าง (ตัวอักษรเข้ม)'}
                  </button>
                </div>

                {/* เปิดขาย / มีของ */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setNew('in_stock', !newP.in_stock)}
                    className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
                    style={{ background: newP.in_stock ? '#C5E8D5' : '#F5D5CC', color: newP.in_stock ? '#1A6B3C' : '#D64B2A' }}>
                    {newP.in_stock ? '● มีของ' : '○ หมด'}
                  </button>
                  <button onClick={() => setNew('active', !newP.active)}
                    className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
                    style={{ background: newP.active ? '#D0E8F5' : '#E0D9CE', color: newP.active ? '#1A5C8F' : '#8C7B6E' }}>
                    {newP.active ? '● เปิดขาย' : '○ ปิดขาย'}
                  </button>
                </div>

                {/* ปุ่มเพิ่ม */}
                <button onClick={submitNew} disabled={adding || uploadingImg === 'new'}
                  className="w-full py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                  style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                  {adding ? 'กำลังเพิ่ม...' : '✓ เพิ่มสินค้า'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="rounded-2xl border-2 overflow-hidden"
              style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              {/* Header */}
              <div className="px-5 py-3 border-b-2 flex items-center justify-between"
                style={{ borderColor: '#E0D9CE', background: p.active ? '#F5F1EB' : '#E8E4DE' }}>
                <div>
                  <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
                    {p.name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{p.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* มีของ / หมด — ยังโชว์บนเว็บ แต่ขึ้นว่า "หมด" (ต่างจากปิดขายที่ซ่อนเลย) */}
                  <button
                    onClick={() => { handleEdit(p.id, 'in_stock', val(p, 'in_stock') === false); }}
                    className="text-xs px-2 py-1 rounded-lg font-mono transition-all"
                    style={{
                      background: val(p, 'in_stock') !== false ? '#C5E8D5' : '#F5D5CC',
                      color: val(p, 'in_stock') !== false ? '#1A6B3C' : '#D64B2A',
                    }}>
                    {val(p, 'in_stock') !== false ? '● มีของ' : '○ หมด'}
                  </button>
                  {/* เปิดขาย / ปิดขาย — ปิด = ซ่อนจากเว็บทั้งหมด (แต่ยังอยู่ในหน้านี้ กดเปิดกลับได้) */}
                  <button
                    onClick={() => { handleEdit(p.id, 'active', !val(p, 'active')); }}
                    className="text-xs px-2 py-1 rounded-lg font-mono transition-all"
                    style={{
                      background: val(p, 'active') ? '#D0E8F5' : '#E0D9CE',
                      color: val(p, 'active') ? '#1A5C8F' : '#8C7B6E',
                    }}>
                    {val(p, 'active') ? '● เปิดขาย' : '○ ปิดขาย'}
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* ราคา + ส่วนลด */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>ราคาเต็ม (฿)</label>
                    <input type="number"
                      value={val(p, 'price') as number}
                      onChange={e => handleEdit(p.id, 'price', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono"
                      style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>ส่วนลด (%)</label>
                    <input type="number" min="0" max="99"
                      value={val(p, 'discount_pct') as number}
                      onChange={e => handleEdit(p.id, 'discount_pct', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm font-mono"
                      style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }} />
                  </div>
                </div>

                {/* ราคาหลังลด (read-only) */}
                <div className="rounded-xl px-4 py-2 flex justify-between items-center"
                  style={{ background: '#D64B2A10', border: '1px solid #D64B2A30' }}>
                  <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>ราคาที่ลูกค้าจ่าย</p>
                  <p className="font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                    ฿{Math.round((val(p, 'price') as number) * (1 - (val(p, 'discount_pct') as number) / 100))}
                  </p>
                </div>

                {/* รสชาติ */}
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>รสชาติ</label>
                  <input type="text"
                    value={val(p, 'flavor') as string || ''}
                    onChange={e => handleEdit(p.id, 'flavor', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm"
                    style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }} />
                </div>

                {/* Roast + Process */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>การคั่ว</label>
                    <input type="text"
                      value={val(p, 'roast') as string || ''}
                      onChange={e => handleEdit(p.id, 'roast', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm"
                      style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>Process</label>
                    <input type="text"
                      value={val(p, 'process') as string || ''}
                      onChange={e => handleEdit(p.id, 'process', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm"
                      style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }} />
                  </div>
                </div>

                {/* รูปสินค้า — อัปโหลด หรือ วางลิงก์ */}
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>รูปสินค้า</label>
                  <div className="flex items-start gap-3">
                    {(val(p, 'image_url') as string) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={val(p, 'image_url') as string} alt="preview" className="w-16 h-16 rounded-xl object-cover border-2" style={{ borderColor: '#D8D0C5' }} />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-xl" style={{ borderColor: '#D8D0C5', color: '#C5BAB0' }}>🖼️</div>
                    )}
                    <div className="flex-1 space-y-2">
                      <label className="block">
                        <span className="inline-block text-xs font-mono px-3 py-2 rounded-xl border-2 cursor-pointer transition-all active:scale-95"
                          style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }}>
                          {uploadingImg === p.id ? 'กำลังอัปโหลด...' : '📎 อัปโหลดรูป'}
                        </span>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, p.sku, p.id, url => handleEdit(p.id, 'image_url', url)) }} />
                      </label>
                      <input type="text"
                        value={val(p, 'image_url') as string || ''}
                        onChange={e => handleEdit(p.id, 'image_url', e.target.value)}
                        placeholder="หรือวางลิงก์รูป https://..."
                        className="w-full px-3 py-2 rounded-xl border-2 text-xs font-mono"
                        style={{ borderColor: '#D8D0C5', background: '#EDE8DF', color: '#3D1F0F' }} />
                    </div>
                  </div>
                </div>

                {/* ปุ่มบันทึก */}
                {editing[p.id] && Object.keys(editing[p.id]).length > 0 && (
                  <button onClick={() => handleSave(p)} disabled={saving === p.id}
                    className="w-full py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                    {saving === p.id ? 'กำลังบันทึก...' : '✓ บันทึก'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
