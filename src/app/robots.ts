import type { MetadataRoute } from 'next'

// Next.js สร้าง /robots.txt ให้อัตโนมัติจากไฟล์นี้
// อนุญาตให้ Google เก็บหน้าสาธารณะ, กันหน้า admin/บัญชี/เช็คเอาต์ ไม่ให้ถูก index
export default function robots(): MetadataRoute.Robots {
  const base = 'https://velacoldbrew.com'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/checkout', '/order-complete'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
