import type { Metadata } from 'next'
import Script from 'next/script'
import { SKU_META, SKU_DETAIL, ALL_SKUS } from '@/lib/products-data'
import ProductClient from './ProductClient'

const SITE = 'https://velacoldbrew.com'
const API  = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

const has = (v: any) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)

// pre-render 7 รสหลัก — ที่เหลือ (สินค้าใหม่จาก admin) render on-demand ได้ (dynamicParams = true โดยดีฟอลต์)
export function generateStaticParams() {
  return ALL_SKUS.map(sku => ({ sku }))
}

async function fetchProduct(rawSku: string): Promise<any | null> {
  try {
    const res = await fetch(`${API}/products`, { next: { revalidate: 300 } })
    const data = await res.json()
    const list = Array.isArray(data.products) ? data.products : []
    return list.find((p: any) => (p.sku || '').toUpperCase() === rawSku) || null
  } catch {
    return null
  }
}

// รวมข้อมูล SEO: DB (detail/image_url) ทับ ของเดิมใน products-data.ts เป็น fallback
function resolveSeo(rawSku: string, prod: any) {
  const hd = SKU_DETAIL[rawSku] as any
  const hm = SKU_META[rawSku]
  const dd = (prod?.detail && typeof prod.detail === 'object') ? prod.detail : {}
  const name = has(dd.name) ? dd.name : (hd?.name || prod?.name || rawSku)
  const seoTitle = hd?.seoTitle || `${name} | VeLA Cold Brew`
  const seoDesc  = hd?.seoDescription
    || (has(dd.description) ? dd.description : '')
    || (has(dd.tagline) ? dd.tagline : '')
    || prod?.description
    || 'VeLA Cold Brew หัวเชื้อกาแฟสกัดเย็น เมล็ด Arabica แม่จันใต้ สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน'
  const hashtags = has(dd.hashtags) ? dd.hashtags : (hd?.hashtags || [])
  const img = has(prod?.image_url) ? String(prod.image_url)
    : (hm?.img ? `${SITE}${hm.img}` : `${SITE}/products/original.png`)
  return { name, seoTitle, seoDesc, hashtags, img }
}

export async function generateMetadata({ params }: { params: { sku: string } }): Promise<Metadata> {
  const rawSku = (params.sku || '').toUpperCase().replace('-200', '')
  const prod = await fetchProduct(rawSku)
  const { name, seoTitle, seoDesc, hashtags, img } = resolveSeo(rawSku, prod)
  const url = `${SITE}/product/${rawSku}`
  return {
    title:       seoTitle,
    description: seoDesc,
    keywords:    hashtags,
    alternates:  { canonical: url },
    openGraph: {
      title: seoTitle, description: seoDesc, url,
      siteName: 'VeLA Cold Brew', type: 'website', locale: 'th_TH',
      images: [{ url: img, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle, description: seoDesc, images: [img],
    },
  }
}

export default async function ProductPage({ params }: { params: { sku: string } }) {
  const rawSku = (params.sku || '').toUpperCase().replace('-200', '')
  const prod = await fetchProduct(rawSku)
  const { name, seoDesc, img } = resolveSeo(rawSku, prod)
  const url = `${SITE}/product/${rawSku}`

  // JSON-LD Product structured data (SEO)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: [img],
    description: seoDesc,
    sku: rawSku,
    brand: { '@type': 'Brand', name: 'VeLA Cold Brew' },
    category: 'Cold Brew Coffee',
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'VeLA Cold Brew' },
    },
  }

  return (
    <>
      <Script id={`ld-product-${rawSku}`} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ส่ง SKU จริงเข้าไป — ไม่ collapse เป็น ORIGINAL อีกแล้ว */}
      <ProductClient sku={rawSku} />
    </>
  )
}
