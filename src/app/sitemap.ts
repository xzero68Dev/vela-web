import type { MetadataRoute } from 'next'
import { buildFeedItems, SITE } from '@/lib/productFeed'

// Next.js สร้าง /sitemap.xml อัตโนมัติจากไฟล์นี้ — แบบ dynamic
// ดึงสินค้าจากแหล่งเดียวกับ product feed (Google Merchant) → หน้าสินค้าทุกตัวเข้า sitemap เสมอ
// เพิ่มสินค้าใหม่ในระบบ = โผล่ใน sitemap เองภายใน 1 ชม. (revalidate 3600)
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // หน้าหลักที่ต้องการให้ Google เก็บ (คงที่)
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,            lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE}/leaderboard`, lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE}/referral`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // หน้าสินค้า /product/[SKU] — ดึงจาก feed แล้ว dedupe (200ml ชี้ URL เดียวกับ 1L)
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const items = await buildFeedItems()
    const seen = new Set<string>()
    productEntries = items
      .filter(it => it.link && !seen.has(it.link) && (seen.add(it.link), true))
      .map(it => ({
        url: it.link,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  } catch {
    // ดึงสินค้าไม่ได้ → ยังคืนหน้าหลักไว้ ไม่ให้ sitemap พัง
  }

  return [...staticEntries, ...productEntries]
}
