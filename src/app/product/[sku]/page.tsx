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

// รวมข้อมูลหน้าสินค้า: DB (detail/image_url/price) ทับ ของเดิมใน products-data.ts เป็น fallback
function resolveSeo(rawSku: string, prod: any) {
  const hd = SKU_DETAIL[rawSku] as any
  const hm = SKU_META[rawSku]
  const dd = (prod?.detail && typeof prod.detail === 'object') ? prod.detail : {}
  const name = has(dd.name) ? dd.name : (hd?.name || prod?.name || rawSku)
  const tagline     = has(dd.tagline) ? dd.tagline : (hd?.tagline || '')
  const origin      = has(dd.origin) ? dd.origin : (hd?.origin || '')
  const description = has(dd.description) ? dd.description : (hd?.description || prod?.description || '')
  const highlights: string[] = has(dd.highlights) ? dd.highlights : (hd?.highlights || [])
  const specs: { label: string; value: string }[] = has(dd.specs) ? dd.specs : (hd?.specs || [])
  const storage = has(dd.storage) ? dd.storage : (hd?.storage || '')
  const seoTitle = hd?.seoTitle || `${name} | VeLA Cold Brew`
  const seoDesc  = hd?.seoDescription || description || tagline || prod?.description
    || 'VeLA Cold Brew หัวเชื้อกาแฟสกัดเย็น เมล็ด Arabica แม่จันใต้ สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน'
  const hashtags = has(dd.hashtags) ? dd.hashtags : (hd?.hashtags || [])
  const img = has(prod?.image_url) ? String(prod.image_url)
    : (hm?.img ? `${SITE}${hm.img}` : `${SITE}/products/original.png`)
  const price   = Number(prod?.price_discounted || prod?.price || 0)
  const inStock = prod ? prod.in_stock !== false : true
  return { name, tagline, origin, description, highlights, specs, storage, seoTitle, seoDesc, hashtags, img, price, inStock }
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
  const s = resolveSeo(rawSku, prod)
  const url = `${SITE}/product/${rawSku}`
  const priceValidUntil = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10)

  // JSON-LD Product — ใส่ราคา/สต็อกจริงจาก DB
  const offer: any = {
    '@type': 'Offer',
    url,
    priceCurrency: 'THB',
    availability: s.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceValidUntil,
    seller: { '@type': 'Organization', name: 'VeLA Cold Brew' },
  }
  if (s.price > 0) offer.price = String(s.price)

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.name,
    image: [s.img],
    description: s.seoDesc,
    sku: rawSku,
    brand: { '@type': 'Brand', name: 'VeLA Cold Brew' },
    category: 'Cold Brew Coffee',
    offers: offer,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE },
      { '@type': 'ListItem', position: 2, name: s.name, item: url },
    ],
  }

  return (
    <>
      <Script id={`ld-product-${rawSku}`} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <Script id={`ld-breadcrumb-${rawSku}`} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* เนื้อหา server-rendered สำหรับ crawler (Google/Bing/AI) ที่ไม่รัน JS —
          ข้อความตรงกับหน้าจริงที่ ProductClient แสดง (accessibility: sr-only) */}
      <section className="sr-only">
        <h1>{s.name}</h1>
        {s.tagline && <p>{s.tagline}</p>}
        {s.origin && <p>{s.origin}</p>}
        {s.price > 0 && (
          <p>ราคา ฿{s.price.toLocaleString()} บาท · {s.inStock ? 'มีสินค้าพร้อมส่ง' : 'สินค้าหมดชั่วคราว'} · ส่งฟรีทั่วไทย</p>
        )}
        {s.description && <p>{s.description}</p>}
        {s.highlights.length > 0 && (
          <ul>{s.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
        )}
        {s.specs.length > 0 && (
          <table><tbody>
            {s.specs.map((sp, i) => (
              <tr key={i}><th>{sp.label}</th><td>{sp.value}</td></tr>
            ))}
          </tbody></table>
        )}
        {s.storage && <p>การเก็บรักษา: {s.storage}</p>}
        <p>VeLA Cold Brew — หัวเชื้อกาแฟสกัดเย็น (Cold Brew Concentrate) จากภูเก็ต สั่งออนไลน์ที่ velacoldbrew.com</p>
      </section>

      {/* ส่ง SKU จริงเข้าไป — ไม่ collapse เป็น ORIGINAL */}
      <ProductClient sku={rawSku} />
    </>
  )
}
