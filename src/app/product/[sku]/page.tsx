import type { Metadata } from 'next'
import ProductPage from './ProductPage'

const SKU_SEO: Record<string, { title: string; description: string; price: string }> = {
  'ORIGINAL':     { title: 'กาแฟสกัดเย็น Original VeLA Cold Brew', description: 'กาแฟสกัดเย็น Original สูตรคลาสสิก หอมเข้มข้น สกัดเย็น 24 ชั่วโมง ไม่ขม ไม่เปรี้ยว ส่งถึงบ้านทั่วไทย', price: '250' },
  'DARK':         { title: 'กาแฟสกัดเย็น Dark VeLA Cold Brew', description: 'กาแฟสกัดเย็น Dark คั่วเข้ม เข้มข้นสะใจ สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย', price: '250' },
  'HONEY':        { title: 'กาแฟสกัดเย็น Honey VeLA Cold Brew', description: 'กาแฟสกัดเย็น Honey หอมผลไม้ เปรี้ยวเบาๆ หวานปลาย สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย', price: '250' },
  'NUTTY':        { title: 'กาแฟสกัดเย็น Nutty VeLA Cold Brew', description: 'กาแฟสกัดเย็น Nutty หอมทะลุนม มันนัว สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย', price: '250' },
  'FRUITY':       { title: 'กาแฟสกัดเย็น Fruity VeLA Cold Brew', description: 'กาแฟสกัดเย็น Fruity กลิ่นเบอร์รี่ หอมดอกไม้ หวานสดชื่น สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย', price: '250' },
  'KYOHO':        { title: 'Cold Drip Premium KYOHO VeLA Cold Brew', description: 'Cold Drip Premium KYOHO กลิ่นองุ่น Kyoho หอมหวาน สกัดเย็นแบบ Cold Drip 3-8 ชั่วโมง จากภูเก็ต', price: '125' },
  'GESHA':        { title: 'Cold Drip Premium GESHA VeLA Cold Brew', description: 'Cold Drip Premium GESHA กาแฟ specialty สายพันธุ์ Gesha Ethiopia สกัดเย็นแบบ Cold Drip คุณภาพสูง จากภูเก็ต', price: '150' },
  'ORIGINAL-200': { title: 'กาแฟสกัดเย็น Original ขนาดทดลอง 200ml VeLA', description: 'กาแฟสกัดเย็น Original ขนาดทดลอง 200ml เหมาะสำหรับลองชิมครั้งแรก ส่งถึงบ้านทั่วไทย', price: '65' },
}

export async function generateMetadata({ params }: { params: { sku: string } }): Promise<Metadata> {
  const sku = params.sku.toUpperCase()
  const seo = SKU_SEO[sku] || { title: 'สินค้า VeLA Cold Brew Coffee', description: 'กาแฟสกัดเย็นคุณภาพสูงจากภูเก็ต', price: '250' }
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `https://velacoldbrew.com/product/${params.sku}`,
      images: [{ url: `/products/${sku.toLowerCase().replace('-200','')}.png` }],
    },
  }
}

export default function Page({ params }: { params: { sku: string } }) {
  const sku = params.sku.toUpperCase()
  const seo = SKU_SEO[sku] || { title: 'VeLA Cold Brew Coffee', description: '', price: '250' }

  // JSON-LD structured data สำหรับ Google Shopping
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: seo.title,
    description: seo.description,
    brand: { '@type': 'Brand', name: 'VeLA Cold Brew Coffee' },
    offers: {
      '@type': 'Offer',
      price: seo.price,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      url: `https://velacoldbrew.com/product/${params.sku}`,
    },
    image: `https://velacoldbrew.com/products/${sku.toLowerCase().replace('-200','')}.png`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPage />
    </>
  )
}
