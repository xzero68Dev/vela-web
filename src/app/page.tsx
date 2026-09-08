import type { Metadata } from 'next'
import Script from 'next/script'
import HomeClient from './HomeClient'

const SITE = 'https://velacoldbrew.com'

// canonical ชัดเจนสำหรับหน้าแรก — แก้ปัญหา "Duplicate without user-selected canonical"
export const metadata: Metadata = {
  alternates: { canonical: SITE },
}

// Organization schema — ผูกแบรนด์กับ "ภูเก็ต + กาแฟสกัดเย็น" + ช่องทางจริง
// กันชื่อ "Vela" ชนกับ La Vela / Vela Coffee เจ้าอื่นในผลค้นหา
const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'VeLA Cold Brew',
  alternateName: ['VeLA', 'VeLA Cold Brew Coffee', 'เวลา โคลด์บรูว์', 'VeLA กาแฟสกัดเย็น'],
  url: SITE,
  logo: `${SITE}/logo.png`,
  image: `${SITE}/logo.png`,
  description:
    'ร้านกาแฟสกัดเย็น (cold brew) จากภูเก็ต — หัวเชื้อกาแฟสกัดเย็นเข้มข้น เมล็ด Arabica แม่จันใต้ ไม่มีน้ำตาล ผลิตสดทุกวัน สั่งออนไลน์ส่งทั่วไทย',
  telephone: '+66906980460',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '143/32 หมู่บ้านสามกองปาร์ค หมู่ 5 ถ.ประชาสามัคคี ต.รัษฎา',
    addressLocality: 'อ.เมืองภูเก็ต',
    addressRegion: 'ภูเก็ต',
    postalCode: '83000',
    addressCountry: 'TH',
  },
  areaServed: 'TH',
  sameAs: [
    'https://www.tiktok.com/@velacoldbrew',
    'https://lin.ee/rdPxbQ8',
    'https://www.facebook.com/profile.php?id=61568850250186',
    'https://shopee.co.th/velacafe',
  ],
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  name: 'VeLA Cold Brew',
  url: SITE,
  inLanguage: 'th-TH',
  publisher: { '@id': `${SITE}/#organization` },
}

export default function HomePage() {
  return (
    <>
      <Script id="ld-organization" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <Script id="ld-website" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <HomeClient />
    </>
  )
}
