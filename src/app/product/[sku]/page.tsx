// src/app/products/[sku]/page.tsx
// Wrapper ที่ไม่ใช่ client component เพื่อให้ export generateMetadata ได้
// แล้ว render ProductPage (client component) ข้างใน

import type { Metadata } from 'next'
import ProductPage from './ProductPage'  // ย้าย product_page.tsx มาเป็น ProductPage.tsx

const SKU_META_SEO: Record<string, { title: string; description: string }> = {
  'ORIGINAL': {
    title: 'กาแฟสกัดเย็น Original VeLA Cold Brew',
    description: 'กาแฟสกัดเย็น Original สูตรคลาสสิก หอมเข้มข้น สกัดเย็น 24 ชั่วโมง ไม่ขม ไม่เปรี้ยว ส่งถึงบ้านทั่วไทย',
  },
  'DARK': {
    title: 'กาแฟสกัดเย็น Dark VeLA Cold Brew',
    description: 'กาแฟสกัดเย็น Dark คั่วเข้ม เข้มข้นสุดขีด สำหรับคนชอบกาแฟรสจัด สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย',
  },
  'HONEY': {
    title: 'กาแฟสกัดเย็น Honey VeLA Cold Brew',
    description: 'กาแฟสกัดเย็น Honey กลิ่นหอมน้ำผึ้ง หวานนุ่ม สดชื่น สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย',
  },
  'NUTTY': {
    title: 'กาแฟสกัดเย็น Nutty VeLA Cold Brew',
    description: 'กาแฟสกัดเย็น Nutty กลิ่นถั่ว หอมโกโก้ นุ่มลิ้น สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย',
  },
  'FRUITY': {
    title: 'กาแฟสกัดเย็น Fruity VeLA Cold Brew',
    description: 'กาแฟสกัดเย็น Fruity กลิ่นผลไม้สดใส เปรี้ยวหวาน สดชื่น สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย',
  },
  'KYOHO': {
    title: 'Cold Drip Premium KYOHO VeLA Cold Brew',
    description: 'Cold Drip Premium KYOHO กลิ่นองุ่น Kyoho หอมหวาน สกัดเย็นแบบ Cold Drip คุณภาพสูง จากภูเก็ต',
  },
  'GESHA': {
    title: 'Cold Drip Premium GESHA VeLA Cold Brew',
    description: 'Cold Drip Premium GESHA กาแฟ specialty สายพันธุ์ Gesha สกัดเย็นแบบ Cold Drip คุณภาพสูง จากภูเก็ต',
  },
}

export async function generateMetadata({ params }: { params: { sku: string } }): Promise<Metadata> {
  const sku = params.sku.toUpperCase().replace('-200', '')
  const meta = SKU_META_SEO[sku] || {
    title: 'สินค้า VeLA Cold Brew Coffee',
    description: 'กาแฟสกัดเย็นคุณภาพสูงจากภูเก็ต สกัดเย็น 24 ชั่วโมง ส่งถึงบ้านทั่วไทย',
  }
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://velacoldbrew.com/products/${params.sku}`,
    },
  }
}

export default function Page({ params }: { params: { sku: string } }) {
  return <ProductPage />
}
