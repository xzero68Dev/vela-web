import { buildFeedItems, SITE, BRAND, GOOGLE_CATEGORY } from '@/lib/productFeed'

// Google Merchant RSS 2.0 feed — velacoldbrew.com/feed/products.xml
export const revalidate = 3600

const esc = (s: any) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const items = await buildFeedItems()
  const now = new Date().toUTCString()

  const body = items.map(it => `    <item>
      <g:id>${esc(it.id)}</g:id>
      <g:title>${esc(it.title)}</g:title>
      <g:description>${esc(it.description)}</g:description>
      <g:link>${esc(it.link)}</g:link>
      <g:image_link>${esc(it.image)}</g:image_link>
      <g:availability>${it.availability}</g:availability>
      <g:price>${esc(it.price)}</g:price>
      <g:brand>${esc(BRAND)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${GOOGLE_CATEGORY}</g:google_product_category>
      <g:product_type>Cold Brew Coffee</g:product_type>
      <g:item_group_id>${esc(it.itemGroup)}</g:item_group_id>
      <g:shipping>
        <g:country>TH</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 THB</g:price>
      </g:shipping>
    </item>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>VeLA Cold Brew — Product Feed</title>
    <link>${SITE}</link>
    <description>หัวเชื้อกาแฟสกัดเย็น (cold brew concentrate) จากภูเก็ต</description>
    <lastBuildDate>${now}</lastBuildDate>
${body}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
