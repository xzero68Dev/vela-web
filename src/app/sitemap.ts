import type { MetadataRoute } from 'next'

// Next.js สร้าง /sitemap.xml ให้อัตโนมัติจากไฟล์นี้
// เพิ่ม URL หน้าใหม่ (เช่น บทความ cold brew concentrate) ที่นี่เมื่อมี
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://velacoldbrew.com'
  const now = new Date()
  return [
    { url: `${base}/`,         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/referral`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
