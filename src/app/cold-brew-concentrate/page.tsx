import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'

const SITE = 'https://velacoldbrew.com'
const URL  = `${SITE}/cold-brew-concentrate`
const UPDATED = '2026-09-24'

export const metadata: Metadata = {
  title: 'Cold Brew Concentrate คืออะไร? หัวเชื้อกาแฟสกัดเย็น ชงยังไง เก็บได้กี่วัน',
  description:
    'รวมทุกเรื่องหัวเชื้อกาแฟสกัดเย็น (cold brew concentrate) — คืออะไร ต่างจากกาแฟสกัดเย็นพร้อมดื่มยังไง ชงสัดส่วนเท่าไหร่ เก็บได้กี่วัน พร้อมสูตรชงง่าย ๆ ที่บ้าน',
  keywords: ['cold brew concentrate', 'หัวเชื้อกาแฟสกัดเย็น', 'กาแฟสกัดเย็นเข้มข้น', 'cold brew คือ', 'กาแฟสกัดเย็น ชงยังไง', 'cold brew concentrate ไทย'],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Cold Brew Concentrate คืออะไร? หัวเชื้อกาแฟสกัดเย็น ฉบับเข้าใจง่าย',
    description: 'คืออะไร ต่างจากพร้อมดื่มยังไง ชงสัดส่วนเท่าไหร่ เก็บได้กี่วัน — อ่านจบชงเป็นทันที',
    url: URL, siteName: 'VeLA Cold Brew', type: 'article', locale: 'th_TH',
    images: [{ url: `${SITE}/logo.png`, alt: 'VeLA Cold Brew Concentrate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cold Brew Concentrate คือ? หัวเชื้อกาแฟสกัดเย็น ชงยังไง',
    description: 'คืออะไร ต่างจากพร้อมดื่มยังไง ชงสัดส่วนเท่าไหร่ เก็บได้กี่วัน',
  },
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Cold brew concentrate ต่างจากกาแฟสกัดเย็นพร้อมดื่ม (RTD) ยังไง?',
    a: 'หัวเชื้อ (concentrate) คือกาแฟสกัดเย็นแบบเข้มข้นที่ต้องนำไปผสมน้ำหรือนมก่อนดื่ม 1 ขวดจึงชงได้หลายแก้ว คุ้มกว่าและเก็บได้นานกว่า ส่วนแบบพร้อมดื่ม (Ready to Drink) เจือจางมาให้แล้ว เปิดดื่มได้ทันทีแต่ราคาต่อแก้วสูงกว่า',
  },
  {
    q: 'หัวเชื้อกาแฟสกัดเย็น ชงสัดส่วนเท่าไหร่?',
    a: 'เริ่มที่หัวเชื้อ 1 ส่วน ต่อ น้ำหรือนม 3–4 ส่วน แล้วปรับความเข้มตามชอบ เช่น อยากได้อเมริกาโน่เย็นใช้หัวเชื้อ + น้ำ + น้ำแข็ง, อยากได้ลาเต้ใช้หัวเชื้อ + นม ยิ่งใส่หัวเชื้อมากยิ่งเข้ม',
  },
  {
    q: 'เก็บได้กี่วัน?',
    a: 'หัวเชื้อสกัดเย็นที่ไม่ใส่สารกันเสียควรเก็บในตู้เย็นตลอด และดื่มภายในเวลาที่ระบุข้างบรรจุภัณฑ์ โดยทั่วไปหัวเชื้อสกัดเย็นเก็บเย็นได้ราว 1–2 สัปดาห์ ของ VeLA ผลิตสดใหม่ทุกวันไม่ใส่วัตถุกันเสีย',
  },
  {
    q: 'ชงร้อนได้ไหม?',
    a: 'ได้ เทหัวเชื้อใส่แก้วแล้วเติมน้ำร้อนแทนน้ำเย็น ก็ได้อเมริกาโน่ร้อนแบบไม่ขม เพราะการสกัดเย็นดึงความขม/กรดออกไปน้อยกว่าการชงร้อนทั่วไป',
  },
  {
    q: 'กาแฟสกัดเย็นขมไหม แคลอรีสูงไหม?',
    a: 'กาแฟสกัดเย็นนุ่มและขมน้อยกว่ากาแฟชงร้อนเพราะสกัดที่อุณหภูมิต่ำนาน 20 ชั่วโมงขึ้นไป ตัวหัวเชื้อดำล้วนไม่ใส่น้ำตาลจึงแคลอรีต่ำมาก แคลอรีจะมาจากนม/น้ำเชื่อมที่เติมเองภายหลัง',
  },
]

export default function ColdBrewConcentratePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cold Brew Concentrate คืออะไร? หัวเชื้อกาแฟสกัดเย็น ชงยังไง เก็บได้กี่วัน',
    description: 'ทุกเรื่องหัวเชื้อกาแฟสกัดเย็น — คืออะไร ต่างจากพร้อมดื่ม ชงสัดส่วนเท่าไหร่ เก็บได้กี่วัน',
    image: [`${SITE}/logo.png`],
    inLanguage: 'th-TH',
    datePublished: UPDATED,
    dateModified: UPDATED,
    author:    { '@type': 'Organization', name: 'VeLA Cold Brew', url: SITE },
    publisher: { '@id': `${SITE}/#organization` },
    mainEntityOfPage: URL,
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Cold Brew Concentrate คืออะไร', item: URL },
    ],
  }

  const C = { brown: '#3D1F0F', orange: '#D64B2A', cream: '#EDE8DF', card: '#F5F1EB', line: '#E0D9CE', muted: '#8C7B6E' }

  return (
    <>
      <Script id="ld-article-cbc" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <Script id="ld-faq-cbc" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Script id="ld-breadcrumb-cbc" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ background: C.cream, minHeight: '100vh', color: C.brown }}>
        <article style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 72px', lineHeight: 1.75, fontSize: 17 }}>
          <nav style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            <Link href="/" style={{ color: C.muted }}>หน้าแรก</Link> ›{' '}
            <span>Cold Brew Concentrate คืออะไร</span>
          </nav>

          <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.3, margin: '0 0 12px' }}>
            Cold Brew Concentrate คืออะไร? หัวเชื้อกาแฟสกัดเย็น ฉบับเข้าใจง่าย
          </h1>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>
            อัปเดตล่าสุด 24 กันยายน 2026 · โดย VeLA Cold Brew
          </p>

          <p>
            ถ้าเคยเห็นคำว่า <strong>“cold brew concentrate”</strong> หรือ <strong>“หัวเชื้อกาแฟสกัดเย็น”</strong> แล้วสงสัยว่ามันคืออะไร
            ต่างจากกาแฟสกัดเย็นทั่วไปยังไง บทความนี้สรุปให้ครบในที่เดียว อ่านจบชงเป็นทันที
          </p>

          <h2 style={{ fontSize: 23, fontWeight: 800, margin: '36px 0 10px' }}>Cold Brew Concentrate คืออะไร</h2>
          <p>
            Cold brew concentrate คือ <strong>กาแฟสกัดเย็นแบบเข้มข้น</strong> ที่ได้จากการแช่กาแฟบดกับน้ำเย็นเป็นเวลานาน
            (VeLA สกัดที่อุณหภูมิต่ำนานกว่า 20 ชั่วโมง) โดยใช้กาแฟต่อน้ำในอัตราส่วนสูงกว่าปกติ จึงได้ “หัวเชื้อ” ที่เข้มข้น
            หอม และนุ่ม ไม่ขมเหมือนกาแฟชงร้อน เพราะการสกัดเย็นดึงสารที่ให้ความขมและกรดออกมาน้อยกว่า ตัวหัวเชื้อดำล้วน
            <strong> ไม่มีน้ำตาลและไม่ใส่สารปรุงแต่ง</strong> เอาไปผสมน้ำหรือนมได้ตามใจ
          </p>

          <h2 style={{ fontSize: 23, fontWeight: 800, margin: '36px 0 10px' }}>ต่างจากกาแฟสกัดเย็น “พร้อมดื่ม” ยังไง</h2>
          <p>
            ความสับสนที่พบบ่อยที่สุดคือระหว่าง <strong>หัวเชื้อ (concentrate)</strong> กับ <strong>แบบพร้อมดื่ม (Ready to Drink / RTD)</strong>
          </p>
          <div style={{ overflowX: 'auto', margin: '14px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: C.card, borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: C.brown, color: C.cream }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>ประเด็น</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>หัวเชื้อ (Concentrate)</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>พร้อมดื่ม (RTD)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['วิธีดื่ม', 'ผสมน้ำ/นมก่อน', 'เปิดดื่มได้เลย'],
                  ['ความคุ้ม', '1 ขวดชงได้หลายแก้ว', '1 ขวด = 1 แก้ว'],
                  ['เก็บรักษา', 'เก็บได้นานกว่า', 'สั้นกว่า'],
                  ['ปรับรสได้', 'ปรับเข้ม/อ่อน/ใส่นมได้เอง', 'รสคงที่'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: C.muted }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>สรุปง่าย ๆ: อยากคุ้มและปรับรสเองเลือก <strong>หัวเชื้อ</strong> · อยากสะดวกหยิบดื่มเลือก <strong>พร้อมดื่ม</strong></p>

          <h2 style={{ fontSize: 23, fontWeight: 800, margin: '36px 0 10px' }}>ชงยังไง — สัดส่วนที่ชงง่ายที่สุด</h2>
          <p>สูตรตั้งต้นที่จำง่าย: <strong>หัวเชื้อ 1 ส่วน : น้ำหรือนม 3–4 ส่วน</strong> แล้วปรับความเข้มตามชอบ</p>
          <ul style={{ paddingLeft: 22, margin: '10px 0' }}>
            <li><strong>อเมริกาโน่เย็น</strong> — หัวเชื้อ + น้ำเปล่า + น้ำแข็ง</li>
            <li><strong>ลาเต้เย็น</strong> — หัวเชื้อ + นมสด + น้ำแข็ง</li>
            <li><strong>กาแฟร้อน</strong> — หัวเชื้อ + น้ำร้อน (ได้อเมริกาโน่ร้อนแบบไม่ขม)</li>
            <li><strong>เมนูซิกเนเจอร์</strong> — ผสมนมข้น น้ำผึ้ง น้ำส้ม หรือโซดา ได้ตามชอบ</li>
          </ul>
          <p style={{ color: C.muted, fontSize: 15 }}>เคล็ดลับ: ยิ่งใส่หัวเชื้อมากยิ่งเข้ม เริ่มน้อยก่อนแล้วค่อยเติมจะปรับง่ายกว่า</p>

          <h2 style={{ fontSize: 23, fontWeight: 800, margin: '36px 0 10px' }}>เก็บได้กี่วัน</h2>
          <p>
            หัวเชื้อสกัดเย็นที่ <strong>ไม่ใส่สารกันเสีย</strong> ควรเก็บในตู้เย็นตลอดเวลา และดื่มภายในเวลาที่ระบุข้างบรรจุภัณฑ์
            โดยทั่วไปหัวเชื้อสกัดเย็นเก็บเย็นได้ราว 1–2 สัปดาห์ ของ VeLA ผลิตสดใหม่ทุกวัน ไม่สต๊อกสินค้า
            จึงได้รสชาติสด ไม่ต้องพึ่งวัตถุกันเสีย
          </p>

          <h2 style={{ fontSize: 23, fontWeight: 800, margin: '36px 0 10px' }}>คำถามที่พบบ่อย</h2>
          {FAQ.map((f, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 16px', margin: '10px 0' }}>
              <p style={{ fontWeight: 700, margin: '0 0 6px' }}>{f.q}</p>
              <p style={{ margin: 0, color: '#4a3a2c' }}>{f.a}</p>
            </div>
          ))}

          {/* CTA */}
          <div style={{ background: C.brown, color: C.cream, borderRadius: 16, padding: '24px 22px', margin: '40px 0 8px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: C.cream }}>อยากลองหัวเชื้อกาแฟสกัดเย็น VeLA?</h2>
            <p style={{ margin: '0 0 16px', opacity: 0.9 }}>
              เมล็ด Arabica แม่จันใต้ สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน — ส่งทั่วไทย
            </p>
            <Link href="/" style={{ display: 'inline-block', background: C.orange, color: '#fff', fontWeight: 800, padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}>
              เลือกซื้อกาแฟสกัดเย็น →
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
