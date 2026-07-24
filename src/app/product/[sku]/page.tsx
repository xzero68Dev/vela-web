import type { Metadata } from 'next'
import Script from 'next/script'
import { SKU_META, SKU_DETAIL, ALL_SKUS, resolveSku } from '@/lib/products-data'
import ProductClient from './ProductClient'

const SITE = 'https://velacoldbrew.com'

export function generateStaticParams() {
  return ALL_SKUS.map(sku => ({ sku }))
}

export function generateMetadata({ params }: { params: { sku: string } }): Metadata {
  const sku = resolveSku(params.sku)
  const d   = SKU_DETAIL[sku]
  const m   = SKU_META[sku]
  const url = `${SITE}/product/${sku}`
  const img = `${SITE}${m.img}`
  return {
    title:       d.seoTitle,
    description: d.seoDescription,
    keywords:    d.hashtags,
    alternates:  { canonical: url },
    openGraph: {
      title:       d.seoTitle,
      description: d.seoDescription,
      url,
      siteName: 'VeLA Cold Brew',
      type: 'website',
      locale: 'th_TH',
      images: [{ url: img, alt: d.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title:       d.seoTitle,
      description: d.seoDescription,
      images: [img],
    },
  }
}

export default function ProductPage({ params }: { params: { sku: string } }) {
  const sku = resolveSku(params.sku)
  const d   = SKU_DETAIL[sku]
  const m   = SKU_META[sku]
  const url = `${SITE}/product/${sku}`

  // JSON-LD Product structured data (SEO)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: d.name,
    image: [`${SITE}${m.img}`],
    description: d.seoDescription,
    sku,
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
      <Script id={`ld-product-${sku}`} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductClient sku={sku} />
    </>
  )
}
