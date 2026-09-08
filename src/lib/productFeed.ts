import { SKU_META, SKU_DETAIL } from '@/lib/products-data'

// สร้างรายการสินค้าสำหรับ product feed (Google Merchant) — ใช้ร่วมกันทั้ง XML และ CSV
export const SITE  = 'https://velacoldbrew.com'
export const API   = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
export const BRAND = 'VeLA Cold Brew'
export const GOOGLE_CATEGORY = '1868' // Food, Beverages & Tobacco > Beverages > Coffee

const has = (v: any) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)

export function money(n: number) { return `${(Math.round(n * 100) / 100).toFixed(2)} THB` }

function ensureKeyword(title: string) {
  const t = title.toLowerCase()
  if (t.includes('กาแฟสกัดเย็น') || t.includes('cold brew')) return title
  return `${title} — กาแฟสกัดเย็น (Cold Brew)`
}

export type FeedItem = {
  id: string; title: string; description: string; link: string; image: string
  availability: string; price: string; itemGroup: string
}

export async function buildFeedItems(): Promise<FeedItem[]> {
  let products: any[] = []
  try {
    const res = await fetch(`${API}/products`, { next: { revalidate: 3600 } })
    const data = await res.json()
    products = Array.isArray(data.products) ? data.products : []
  } catch { /* ว่าง — คืน [] */ }

  return products.map((p: any) => {
    const sku     = String(p.sku || '')
    const baseSku = sku.replace('-200', '').toUpperCase()
    const is200   = sku.includes('-200')
    const hd: any = SKU_DETAIL[baseSku] || {}
    const hm: any = SKU_META[baseSku] || {}
    const dd: any = (p.detail && typeof p.detail === 'object') ? p.detail : {}

    let name = has(dd.name) ? dd.name : (hd.name || p.name || baseSku)
    if (is200) name = `${name} (ขนาด 200ml)`
    const desc = has(dd.description) ? dd.description
      : (hd.description || hd.tagline || p.description
        || 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น เมล็ด Arabica แม่จันใต้ ไม่มีน้ำตาล ผลิตสดทุกวัน ส่งฟรีทั่วไทย')
    const image = has(p.image_url) ? String(p.image_url)
      : (hm.img ? `${SITE}${hm.img}` : `${SITE}/products/original.png`)
    const price   = Number(p.price_discounted || p.price || 0)
    const inStock = p.in_stock !== false

    return {
      id: sku,
      title: ensureKeyword(name),
      description: desc,
      link: `${SITE}/product/${baseSku}`,
      image,
      availability: inStock ? 'in_stock' : 'out_of_stock',
      price: money(price),
      itemGroup: baseSku,
    }
  }).filter(it => it.id)
}
