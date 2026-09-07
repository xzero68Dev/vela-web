import { MetadataRoute } from 'next'

const BASE = 'https://velacoldbrew.com'
const API  = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

// อัปเดต sitemap ทุกชั่วโมง (สินค้าใหม่จาก admin จะโผล่เองไม่ต้องแก้โค้ด)
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // fallback = 7 SKU หลัก เผื่อ API ล่มตอน build
  let skus: string[] = ['ORIGINAL', 'DARK', 'HONEY', 'NUTTY', 'FRUITY', 'KYOHO', 'GESHA']
  try {
    const res  = await fetch(`${API}/products`, { next: { revalidate: 3600 } })
    const data = await res.json()
    const list = Array.isArray(data.products) ? data.products : []
    const dyn  = list
      .map((p: any) => (p.sku || '').toUpperCase())
      .filter((s: string) => s && !s.includes('-200'))   // ขนาด 200ml ใช้หน้าเดียวกับตัวหลัก ไม่ต้องมี URL แยก
    if (dyn.length) skus = Array.from(new Set(dyn))
  } catch {
    // ใช้ fallback
  }

  const now = new Date()
  return [
    { url: BASE,                 lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/leaderboard`, lastModified: now, changeFrequency: 'daily',  priority: 0.6 },
    ...skus.map(sku => ({
      url: `${BASE}/product/${sku}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
