import type { Metadata } from 'next'
import Link from 'next/link'

const SITE = 'https://velacoldbrew.com'
const URL  = `${SITE}/return-policy`

export const metadata: Metadata = {
  title: 'นโยบายการคืนสินค้าและการรับประกัน | VeLA Cold Brew',
  description:
    'นโยบายการคืน เปลี่ยน และคืนเงินของ VeLA Cold Brew — สินค้าเป็นกาแฟสดจึงไม่รับคืนกรณีเปลี่ยนใจ แต่หากสินค้าชำรุด เสียหาย รั่วซึม หรือส่งผิด เรารับผิดชอบเปลี่ยนใหม่หรือคืนเงินให้',
  alternates: { canonical: URL },
  openGraph: {
    title: 'นโยบายการคืนสินค้า | VeLA Cold Brew',
    description: 'กาแฟสดไม่รับคืนกรณีเปลี่ยนใจ · สินค้าเสียหาย/ส่งผิด เปลี่ยนหรือคืนเงินภายใน 7 วัน',
    url: URL, siteName: 'VeLA Cold Brew', type: 'website', locale: 'th_TH',
  },
}

export default function ReturnPolicyPage() {
  const C = { brown: '#3D1F0F', orange: '#D64B2A', cream: '#EDE8DF', card: '#F5F1EB', line: '#E0D9CE', muted: '#8C7B6E' }
  const H2: React.CSSProperties = { fontSize: 21, fontWeight: 800, margin: '30px 0 8px' }

  return (
    <main style={{ background: C.cream, minHeight: '100vh', color: C.brown }}>
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 72px', lineHeight: 1.75, fontSize: 16.5 }}>
        <nav style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
          <Link href="/" style={{ color: C.muted }}>หน้าแรก</Link> › <span>นโยบายการคืนสินค้า</span>
        </nav>

        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, margin: '0 0 6px' }}>
          นโยบายการคืนสินค้าและการรับประกัน
        </h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>มีผลใช้ตั้งแต่ 24 กันยายน 2026</p>

        <p>
          VeLA Cold Brew ใส่ใจคุณภาพและความปลอดภัยของลูกค้าทุกท่าน สินค้าของเราเป็น
          <strong>กาแฟสกัดเย็นที่ผลิตสดใหม่ ไม่ใส่วัตถุกันเสีย</strong> จึงจัดเป็นสินค้าประเภทอาหาร
          ที่มีข้อกำหนดด้านความปลอดภัยเป็นพิเศษ นโยบายด้านล่างนี้จัดทำขึ้นเพื่อความเป็นธรรมกับลูกค้า
          ควบคู่กับมาตรฐานความปลอดภัยด้านอาหาร
        </p>

        <h2 style={H2}>1. การคืนสินค้ากรณีเปลี่ยนใจ</h2>
        <p>
          เนื่องจากเป็นสินค้าอาหารที่ผลิตสดและบริโภคได้ เพื่อความปลอดภัยของผู้บริโภค
          เราจึง <strong>ไม่สามารถรับคืนหรือเปลี่ยนสินค้ากรณีเปลี่ยนใจ</strong> หลังจากจัดส่งแล้วได้
        </p>

        <h2 style={H2}>2. สินค้าชำรุด เสียหาย หรือส่งผิด — เรารับผิดชอบเต็มที่</h2>
        <p>หากได้รับสินค้าแล้วพบว่า:</p>
        <ul style={{ paddingLeft: 22, margin: '8px 0' }}>
          <li>บรรจุภัณฑ์ชำรุด รั่วซึม หรือเสียหายระหว่างจัดส่ง</li>
          <li>สินค้าไม่ตรงกับที่สั่ง (ผิดรส/ผิดขนาด/ผิดรายการ)</li>
          <li>สินค้ามีข้อบกพร่องด้านคุณภาพ</li>
        </ul>
        <p>
          กรุณา <strong>ติดต่อเราภายใน 7 วัน</strong> นับจากวันที่ได้รับสินค้า พร้อมแนบรูปถ่ายสินค้า/บรรจุภัณฑ์
          และหมายเลขคำสั่งซื้อ เราจะ <strong>จัดส่งสินค้าใหม่ให้ หรือคืนเงินเต็มจำนวน</strong> ตามที่ลูกค้าสะดวก
          โดยไม่มีค่าใช้จ่ายเพิ่มเติม
        </p>

        <h2 style={H2}>3. วิธีติดต่อขอเปลี่ยน/คืนเงิน</h2>
        <p>
          ทักหาเราได้ที่ <strong>LINE ร้าน</strong> หรือโทร <strong>062-453-5388</strong>
          แจ้งหมายเลขคำสั่งซื้อ + รูปถ่ายสินค้า ทีมงานจะดำเนินการให้เร็วที่สุด
          โดยทั่วไปได้ข้อสรุปภายใน 1–2 วันทำการ
        </p>

        <h2 style={H2}>4. การคืนเงิน</h2>
        <p>
          กรณีอนุมัติคืนเงิน เราจะคืนเงินผ่านช่องทางเดิมที่ลูกค้าชำระ ภายใน 3–7 วันทำการ
          หลังจากยืนยันข้อมูลครบถ้วน
        </p>

        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: '16px 18px', marginTop: 28 }}>
          <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>
            มีคำถามเกี่ยวกับคำสั่งซื้อหรือการจัดส่ง? ทักไลน์ร้านหรือโทร 062-453-5388 ได้ทุกวัน ·{' '}
            <Link href="/" style={{ color: C.orange, fontWeight: 700 }}>กลับหน้าแรก</Link>
          </p>
        </div>
      </article>
    </main>
  )
}
