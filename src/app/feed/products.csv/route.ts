import { buildFeedItems, BRAND, GOOGLE_CATEGORY } from '@/lib/productFeed'

// Google Merchant CSV feed — velacoldbrew.com/feed/products.csv
export const revalidate = 3600

// escape สำหรับ CSV: ครอบ " ถ้ามี , " หรือขึ้นบรรทัดใหม่ + double ""
const csv = (s: any) => {
  const v = String(s ?? '')
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

const HEADERS = [
  'id', 'title', 'description', 'link', 'image_link', 'availability', 'price',
  'brand', 'condition', 'identifier_exists', 'google_product_category',
  'product_type', 'item_group_id', 'shipping',
]

export async function GET() {
  const items = await buildFeedItems()

  const rows = items.map(it => [
    it.id,
    it.title,
    it.description,
    it.link,
    it.image,
    it.availability,
    it.price,
    BRAND,
    'new',
    'no',
    GOOGLE_CATEGORY,
    'Cold Brew Coffee',
    it.itemGroup,
    'TH:::0.00 THB',   // country:region:service:price
  ].map(csv).join(','))

  const out = [HEADERS.join(','), ...rows].join('\n')

  return new Response(out, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
