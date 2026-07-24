import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://velacoldbrew.com'

  // ต้องตรงกับ route จริง: /product/[sku] (เอกพจน์ + SKU ตัวใหญ่)
  const products = ['ORIGINAL', 'DARK', 'HONEY', 'NUTTY', 'FRUITY', 'KYOHO', 'GESHA']

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    ...products.map(sku => ({
      url: `${base}/product/${sku}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
