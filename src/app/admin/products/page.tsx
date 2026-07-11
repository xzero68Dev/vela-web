'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const API       = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

type Product = {
  id: number; sku: string; name: string; flavor: string; roast: string; process: string
  price: number; price_discounted: number; discount_pct: number; active: boolean; sort_order: number
}

export default function AdminProductsPage() {
  const ready = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [editing,  setEditing]  = useState<Record<number, Partial<Product>>>({})
  const [saving,   setSaving]   = useState<number | null>(null)
  const [msg,      setMsg]      = useState('')

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`${API}/products`)
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
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
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

  if (!ready) return null

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
                  {/* Active toggle */}
                  <button
                    onClick={() => { handleEdit(p.id, 'active', !val(p, 'active')); }}
                    className="text-xs px-2 py-1 rounded-lg font-mono transition-all"
                    style={{
                      background: val(p, 'active') ? '#C5E8D5' : '#E0D9CE',
                      color: val(p, 'active') ? '#1A6B3C' : '#8C7B6E',
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
