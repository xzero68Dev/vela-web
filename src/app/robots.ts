import type { MetadataRoute } from 'next'

// Next.js สร้าง /robots.txt อัตโนมัติจากไฟล์นี้
// อนุญาตหน้าสาธารณะ, กันหน้า admin/บัญชี/เช็คเอาต์/API/หน้าติดตามพัสดุ ไม่ให้ถูก index
export default function robots(): MetadataRoute.Robots {
  const base = 'https://velacoldbrew.com'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/account', '/checkout', '/order-complete', '/line-callback', '/track', '/receipt'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
