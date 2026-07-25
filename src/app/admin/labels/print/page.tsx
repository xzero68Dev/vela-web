'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminAuth } from '@/components/useAdminAuth'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const SHOP = {
  name: 'VeLA Cold Brew',
  address: '143/32 หมู่บ้านสามกองปาร์ค หมู่ 5 ถ.ประชาสามัคคี ต.รัษฎา อ.เมืองภูเก็ต จ.ภูเก็ต 83000',
  phone: '090-698-0460',
}

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

function Label({ order, ship }: { order: any; ship?: any }) {
  const items = parseItems(order.sku)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const carrier = ship?.carrier || CARRIER_LABEL[order.preferred_carrier] || order.preferred_carrier || ''
  const tracking = ship?.tracking && ship.tracking !== '-' ? ship.tracking : ''
  const fullAddr = [order.full_address, order.province, order.zip].filter(Boolean).join(' ')
  return (
    <div className="sheet">
      <div className="row" style={{ paddingTop: 0 }}>
        <div className="lbl">ผู้ส่ง / FROM</div>
        <div className="from"><b>{SHOP.name}</b> · โทร {SHOP.phone}<br />{SHOP.address}</div>
      </div>
      <div className="row">
        <div className="lbl">ผู้รับ / TO</div>
        <div className="to-name">{order.customer}</div>
        <div className="to-phone">โทร {order.phone || '-'}</div>
        <div className="to-addr">{fullAddr}</div>
      </div>
      <div className="row rowflex">
        <div>
          <div className="lbl">Order</div>
          <div className="oid">#{order.order_id}</div>
          <div className="date">{order.order_date}</div>
        </div>
        {carrier && (
          <div style={{ textAlign: 'right' }}>
            <span className="carrier">{carrier}</span>
            {tracking && <div className="trk">{tracking}</div>}
          </div>
        )}
      </div>
      <div style={{ paddingTop: 8 }}>
        <div className="items-title">📦 รายการสินค้า ({totalQty} ชิ้น)</div>
        {items.map((it, i) => (
          <div className="item" key={i}>
            <span className="chk" /><span className="qty">{it.qty}×</span><span className="iname">{it.name}</span>
          </div>
        ))}
        <div className="totline">รวม {items.length} รายการ · {totalQty} ชิ้น</div>
      </div>
      {order.note && <div className="note">📝 หมายเหตุ: {order.note}</div>}
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
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .labels-root { background:#e5e5e5; padding:16px; font-family:'Sarabun',system-ui,sans-serif; }
        .toolbar { max-width:360px; margin:0 auto 14px; }
        .btn { width:100%; padding:14px; border:none; border-radius:10px; font-weight:800; cursor:pointer; font-size:16px; background:#D64B2A; color:#fff; }
        .hint { text-align:center; font-size:12px; color:#666; margin-top:8px; }
        .sheet { width:96mm; background:#fff; border:2px solid #000; color:#000; padding:12px 14px; margin:0 auto 10px; box-sizing:border-box; }
        .row { border-bottom:1px dashed #999; padding:7px 0; }
        .rowflex { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .lbl { font-size:10px; color:#555; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
        .from { font-size:11px; color:#222; line-height:1.35; }
        .to-name { font-size:19px; font-weight:800; line-height:1.2; }
        .to-phone { font-size:14px; font-weight:700; }
        .to-addr { font-size:14px; line-height:1.4; margin-top:2px; }
        .oid { font-size:20px; font-weight:800; letter-spacing:1px; font-family:'Courier New',monospace; }
        .date { font-size:11px; color:#555; }
        .carrier { display:inline-block; border:2px solid #000; border-radius:6px; padding:2px 9px; font-weight:800; font-size:13px; }
        .trk { font-family:'Courier New',monospace; font-size:15px; font-weight:700; margin-top:3px; }
        .items-title { font-size:13px; font-weight:800; margin:5px 0; }
        .item { display:flex; align-items:flex-start; gap:8px; padding:4px 0; border-bottom:1px solid #eee; }
        .chk { width:15px; height:15px; border:2px solid #000; border-radius:3px; flex-shrink:0; margin-top:2px; }
        .qty { font-weight:800; font-size:15px; min-width:32px; }
        .iname { font-size:14px; line-height:1.3; }
        .totline { text-align:right; font-weight:800; font-size:13px; margin-top:5px; }
        .note { background:#FFF3CD; border:1px solid #E0C060; border-radius:6px; padding:5px 9px; font-size:12px; margin-top:7px; }
        @media print {
          html, body, .labels-root { background:#fff !important; padding:0 !important; margin:0 !important; }
          .toolbar { display:none !important; }
          .sheet { margin:0 auto; page-break-after:always; break-after:page; border:2px solid #000; }
          .sheet:last-child { page-break-after:auto; break-after:auto; }
        }
      `}</style>

      <div className="toolbar">
        <button className="btn" onClick={() => window.print()}>🖨️ พิมพ์ใบแปะหน้า ({orders.length} ใบ)</button>
        <p className="hint">ตั้งกระดาษเป็น A6 หรือ A5 ในหน้าต่างพิมพ์เพื่อได้ป้ายพอดี · ปิดหัว/ท้ายกระดาษ (Headers and footers)</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontFamily: 'monospace', color: '#666' }}>กำลังโหลด...</p>
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
