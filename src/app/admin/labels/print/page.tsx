'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminAuth } from '@/components/useAdminAuth'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const SHOP = { name: 'VeLA Cold Brew', phone: '090-698-0460' }

const CARRIER_LABEL: Record<string, string> = {
  thailand_post: 'ไปรษณีย์ไทย EMS', kex: 'KEX Express',
  'POST SABUY': 'ไปรษณีย์ไทย (POST SABUY)', 'KEX Express': 'KEX Express',
  'Flash Express': 'Flash Express', 'Seller Own Fleet': 'ส่งเอง',
}

function parseItems(sku: string): { name: string; qty: number }[] {
  return (sku || '').split(',').map(s => s.trim()).filter(Boolean).map(part => {
    const m = part.match(/^(.+?)\s*[x×]\s*(\d+)\s*$/i)
    return m ? { name: m[1].trim(), qty: parseInt(m[2], 10) } : { name: part, qty: 1 }
  })
}

// บาร์โค้ด Code128 ของเลขพัสดุ (ให้ขนส่งสแกน)
function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (ref.current && value) {
      try {
        JsBarcode(ref.current, value, {
          format: 'CODE128', width: 1.7, height: 46, displayValue: true,
          fontSize: 14, textMargin: 2, margin: 0, font: 'monospace', lineColor: '#000',
        })
      } catch {}
    }
  }, [value])
  return <svg ref={ref} className="barcode" />
}

// QR ลิงก์ติดตามพัสดุ (velacoldbrew.com/track/เลข)
function TrackQR({ value }: { value: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (value) QRCode.toDataURL(value, { margin: 0, width: 160, errorCorrectionLevel: 'M' }).then(setUrl).catch(() => {})
  }, [value])
  return url ? <img src={url} alt="track qr" className="trackqr" /> : null
}

function Label({ order, ship }: { order: any; ship?: any }) {
  const items = parseItems(order.sku)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const carrier = ship?.carrier || CARRIER_LABEL[order.preferred_carrier] || order.preferred_carrier || ''
  const tracking = ship?.tracking && ship.tracking !== '-' ? ship.tracking : ''
  const fullAddr = [order.full_address, order.province, order.zip].filter(Boolean).join(' ')
  return (
    <div className="sheet">
      {/* ผู้ส่ง = โลโก้ + QR LINE ร้าน */}
      <div className="from">
        <img className="flogo" src="/logo.png" alt="VeLA Cold Brew"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        <div className="fmeta"><b>{SHOP.name}</b><br /><span className="fnote">มีปัญหาทักไลน์ร้าน 👉</span></div>
        <div className="fqr">
          <img src="/line-qr.png" alt="LINE ร้าน"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <div className="fqr-cap">LINE ร้าน</div>
        </div>
      </div>

      {/* ผู้รับ */}
      <div className="to">
        <div className="lbl">ผู้รับ / TO</div>
        <div className="to-name">{order.customer}</div>
        <div className="to-phone">โทร {order.phone || '-'}</div>
        <div className="to-addr">{fullAddr}</div>
      </div>

      {/* ออเดอร์ + ขนส่ง + QR ติดตาม */}
      <div className="ord">
        <div>
          <div className="oid">#{order.order_id}</div>
          <div className="date">{order.order_date}</div>
          {carrier && <span className="carrier">{carrier}</span>}
        </div>
        {tracking && (
          <div className="ord-qr">
            {/* QR = ลิงก์ติดตามพัสดุ ให้ลูกค้าสแกนดูสถานะ (ใบ ShipSmile มีบาร์โค้ด/QR ขนส่งอยู่แล้ว) */}
            <TrackQR value={`https://velacoldbrew.com/track/${tracking}`} />
            <div className="ord-qr-cap">สแกนติดตาม</div>
          </div>
        )}
      </div>

      {/* บาร์โค้ดเลขพัสดุ — ให้ขนส่งสแกน */}
      {tracking && (
        <div className="bcode">
          <Barcode value={tracking} />
        </div>
      )}

      {/* รายการสินค้า — เช็คลิสต์ (ยืดเต็มพื้นที่ที่เหลือ) */}
      <div className="items">
        <div className="items-title">📦 รายการสินค้า · {totalQty} ชิ้น</div>
        {items.map((it, i) => (
          <div className="item" key={i}>
            <span className="chk" /><span className="qty">{it.qty}×</span><span className="iname">{it.name}</span>
          </div>
        ))}
      </div>

      {order.note ? <div className="note">📝 {order.note}</div> : null}
    </div>
  )
}

function LabelsInner() {
  const ready = useAdminAuth()
  const sp = useSearchParams()
  const ids = (sp.get('ids') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  const [orders, setOrders] = useState<any[]>([])
  const [ships, setShips]   = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!ids.length) { setLoading(false); return }
    ;(async () => {
      try {
        const headers = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
        const inList = ids.map(i => `"${i}"`).join(',')
        const oRes = await fetch(`${SB_URL}/rest/v1/orders?order_id=in.(${inList})&select=order_id,order_date,customer,phone,full_address,province,zip,sku,qty,note,channel,total,preferred_carrier`, { headers })
        const oData = await oRes.json()
        const byId: Record<string, any> = {}
        ;(Array.isArray(oData) ? oData : []).forEach((o: any) => { byId[o.order_id] = o })
        setOrders(ids.map(i => byId[i]).filter(Boolean))
        const sRes = await fetch(`${SB_URL}/rest/v1/shipping?order_id=in.(${inList})&select=order_id,tracking,carrier`, { headers })
        const sData = await sRes.json()
        const sm: Record<string, any> = {}
        ;(Array.isArray(sData) ? sData : []).forEach((s: any) => { if (!sm[s.order_id]) sm[s.order_id] = s })
        setShips(sm)
      } catch {}
      finally { setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  if (!ready) return null

  return (
    <div className="labels-root">
      <style>{`
        * { -webkit-print-color-adjust:exact; print-color-adjust:exact; box-sizing:border-box; }
        .labels-root { background:#c9c9c9; padding:16px 0; font-family:'Sarabun',system-ui,sans-serif; }
        .toolbar { width:100mm; margin:0 auto 14px; }
        .btn { width:100%; padding:14px; border:none; border-radius:10px; font-weight:800; cursor:pointer; font-size:16px; background:#D64B2A; color:#fff; }
        .hint { text-align:center; font-size:11px; color:#444; margin-top:8px; line-height:1.5; }

        /* ป้ายขนาด 100 x 150 มม. เต็มแผ่น */
        .sheet {
          width:100mm; height:150mm; background:#fff; color:#000;
          padding:4mm 5mm; margin:0 auto 12px; display:flex; flex-direction:column; overflow:hidden;
          border:1px solid #000;
        }
        .from { display:flex; align-items:center; gap:8px; border-bottom:2px solid #000; padding-bottom:5px; }
        .flogo { height:12mm; width:auto; max-width:34mm; object-fit:contain; }
        .fmeta { flex:1; font-size:12px; line-height:1.3; color:#000; }
        .fnote { font-size:10px; color:#555; }
        .fqr { text-align:center; flex-shrink:0; }
        .fqr img { height:15mm; width:15mm; object-fit:contain; display:block; }
        .fqr-cap { font-size:8px; color:#333; margin-top:1px; }
        .lbl { font-size:10px; color:#555; text-transform:uppercase; letter-spacing:.5px; }
        .to { padding:6px 0; border-bottom:1px dashed #666; }
        .to-name { font-size:22px; font-weight:800; line-height:1.15; }
        .to-phone { font-size:16px; font-weight:700; }
        .to-addr { font-size:16px; line-height:1.4; margin-top:2px; }
        .ord { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; padding:6px 0; border-bottom:1px dashed #666; }
        .oid { font-size:20px; font-weight:800; letter-spacing:1px; font-family:'Courier New',monospace; }
        .date { font-size:12px; color:#555; margin-bottom:3px; }
        .carrier { display:inline-block; border:2px solid #000; border-radius:6px; padding:2px 9px; font-weight:800; font-size:14px; }
        .ord-qr { text-align:center; flex-shrink:0; }
        .ord-qr .trackqr { width:16mm; height:16mm; object-fit:contain; display:block; }
        .ord-qr-cap { font-size:8px; color:#333; margin-top:1px; }
        .bcode { text-align:center; padding:5px 0 3px; border-bottom:1px dashed #666; }
        .bcode .barcode { width:100%; max-width:88mm; height:auto; }
        .items { flex:1 1 auto; padding-top:6px; overflow:hidden; }
        .items-title { font-size:14px; font-weight:800; margin-bottom:4px; }
        .item { display:flex; align-items:flex-start; gap:8px; padding:4px 0; border-bottom:1px solid #ddd; }
        .chk { width:16px; height:16px; border:2px solid #000; border-radius:3px; flex-shrink:0; margin-top:2px; }
        .qty { font-weight:800; font-size:16px; min-width:34px; }
        .iname { font-size:15px; line-height:1.3; }
        .note { background:#FFF3CD; border:1px solid #C9A227; border-radius:6px; padding:5px 9px; font-size:13px; margin-top:6px; }

        @media print {
          @page { size:100mm 150mm; margin:0; }
          html, body, .labels-root { background:#fff !important; padding:0 !important; margin:0 !important; }
          .toolbar { display:none !important; }
          .sheet { margin:0; border:none; page-break-after:always; break-after:page; }
          .sheet:last-child { page-break-after:auto; break-after:auto; }
        }
      `}</style>

      <div className="toolbar">
        <button className="btn" onClick={() => window.print()}>🖨️ พิมพ์ใบแปะหน้า ({orders.length} ใบ)</button>
        <p className="hint">Paper size: <b>100 × 150 (SF Express)</b> · Margins: <b>None</b> · ปิด Headers and footers</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontFamily: 'monospace', color: '#555' }}>กำลังโหลด...</p>
      ) : orders.length === 0 ? (
        <p style={{ textAlign: 'center', fontFamily: 'monospace', color: '#c00' }}>ไม่พบออเดอร์</p>
      ) : (
        orders.map(o => <Label key={o.order_id} order={o} ship={ships[o.order_id]} />)
      )}
    </div>
  )
}

export default function LabelsPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: 'monospace' }}>กำลังโหลด...</div>}>
      <LabelsInner />
    </Suspense>
  )
}
