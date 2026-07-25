'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAdminAuth } from '@/components/useAdminAuth'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ข้อมูลผู้ส่ง (ร้าน)
const SHOP = {
  name: 'VeLA Cold Brew',
  address: '143/32 หมู่บ้านสามกองปาร์ค หมู่ 5 ถ.ประชาสามัคคี ต.รัษฎา อ.เมืองภูเก็ต จ.ภูเก็ต 83000',
  phone: '090-698-0460',
}

const CARRIER_LABEL: Record<string, string> = {
  thailand_post: 'ไปรษณีย์ไทย EMS',
  kex: 'KEX Express',
  'POST SABUY': 'ไปรษณีย์ไทย (POST SABUY)',
  'KEX Express': 'KEX Express',
  'Flash Express': 'Flash Express',
  'Seller Own Fleet': 'ส่งเอง',
}

// แยก string "Name x2, Name2 x1" → [{name, qty}]
function parseItems(sku: string): { name: string; qty: number }[] {
  return (sku || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(part => {
      const m = part.match(/^(.+?)\s*[x×]\s*(\d+)\s*$/i)
      return m ? { name: m[1].trim(), qty: parseInt(m[2], 10) } : { name: part, qty: 1 }
    })
}

export default function LabelPage() {
  const ready = useAdminAuth()
  const params = useParams()
  const orderId = (params.orderId as string || '').toUpperCase()
  const [order, setOrder] = useState<any>(null)
  const [ship,  setShip]  = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready || !orderId) return
    ;(async () => {
      try {
        const oRes = await fetch(
          `${SB_URL}/rest/v1/orders?order_id=eq.${orderId}&select=order_id,order_date,customer,phone,full_address,province,zip,sku,qty,note,channel,total,preferred_carrier`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
        const oData = await oRes.json()
        setOrder(Array.isArray(oData) && oData[0] ? oData[0] : null)
        const sRes = await fetch(
          `${SB_URL}/rest/v1/shipping?order_id=eq.${orderId}&select=tracking,carrier`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
        const sData = await sRes.json()
        setShip(Array.isArray(sData) && sData[0] ? sData[0] : null)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [ready, orderId])

  if (!ready) return null
  if (loading) return <div style={{ padding: 40, fontFamily: 'monospace', color: '#888' }}>กำลังโหลด...</div>
  if (!order)  return <div style={{ padding: 40, fontFamily: 'monospace', color: '#c00' }}>ไม่พบออเดอร์ {orderId}</div>

  const items = parseItems(order.sku)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const carrier = ship?.carrier || CARRIER_LABEL[order.preferred_carrier] || order.preferred_carrier || ''
  const tracking = ship?.tracking && ship.tracking !== '-' ? ship.tracking : ''
  const fullAddr = [order.full_address, order.province, order.zip].filter(Boolean).join(' ')

  return (
    <div className="label-root">
      <style>{`
        .label-root { background:#e5e5e5; min-height:100vh; padding:20px; font-family: 'Sarabun', system-ui, sans-serif; }
        .toolbar { max-width:420px; margin:0 auto 14px; display:flex; gap:8px; }
        .btn { flex:1; padding:12px; border:none; border-radius:10px; font-weight:800; cursor:pointer; font-size:15px; }
        .btn-print { background:#D64B2A; color:#fff; }
        .btn-back { background:#fff; color:#333; border:2px solid #ccc; }
        .label { max-width:420px; margin:0 auto; background:#fff; border:2px solid #000; border-radius:4px; padding:14px 16px; color:#000; }
        .row { border-bottom:1px dashed #999; padding:8px 0; }
        .lbl { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
        .to-name { font-size:20px; font-weight:800; line-height:1.2; }
        .to-phone { font-size:15px; font-weight:700; }
        .to-addr { font-size:15px; line-height:1.45; margin-top:2px; }
        .from { font-size:11px; color:#333; line-height:1.35; }
        .oid { font-size:22px; font-weight:800; letter-spacing:1px; font-family:'Courier New',monospace; }
        .carrier { display:inline-block; border:2px solid #000; border-radius:6px; padding:3px 10px; font-weight:800; font-size:14px; }
        .trk { font-family:'Courier New',monospace; font-size:16px; font-weight:700; margin-top:3px; }
        .items-title { font-size:13px; font-weight:800; margin:6px 0; text-transform:uppercase; }
        .item { display:flex; align-items:flex-start; gap:8px; padding:5px 0; border-bottom:1px solid #eee; }
        .chk { width:16px; height:16px; border:2px solid #000; border-radius:3px; flex-shrink:0; margin-top:2px; }
        .qty { font-weight:800; font-size:16px; min-width:34px; }
        .iname { font-size:15px; line-height:1.3; }
        .totline { text-align:right; font-weight:800; font-size:14px; margin-top:6px; }
        .note { background:#FFF3CD; border:1px solid #E0C060; border-radius:6px; padding:6px 10px; font-size:13px; margin-top:8px; }
        @media print {
          @page { size: A6; margin: 6mm; }
          .label-root { background:#fff; padding:0; }
          .toolbar { display:none !important; }
          .label { border:2px solid #000; max-width:none; margin:0; border-radius:0; }
        }
      `}</style>

      <div className="toolbar">
        <button className="btn btn-back" onClick={() => window.close()}>ปิด</button>
        <button className="btn btn-print" onClick={() => window.print()}>🖨️ พิมพ์ใบแปะหน้า</button>
      </div>

      <div className="label">
        {/* ผู้ส่ง */}
        <div className="row" style={{ paddingTop: 0 }}>
          <div className="lbl">ผู้ส่ง / FROM</div>
          <div className="from"><b>{SHOP.name}</b> · โทร {SHOP.phone}<br />{SHOP.address}</div>
        </div>

        {/* ผู้รับ */}
        <div className="row">
          <div className="lbl">ผู้รับ / TO</div>
          <div className="to-name">{order.customer}</div>
          <div className="to-phone">โทร {order.phone || '-'}</div>
          <div className="to-addr">{fullAddr}</div>
        </div>

        {/* ออเดอร์ + ขนส่ง */}
        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <div className="lbl">Order</div>
            <div className="oid">#{order.order_id}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{order.order_date}</div>
          </div>
          {carrier && (
            <div style={{ textAlign: 'right' }}>
              <span className="carrier">{carrier}</span>
              {tracking && <div className="trk">{tracking}</div>}
            </div>
          )}
        </div>

        {/* รายการสินค้า — เช็คลิสต์แพ็ค */}
        <div style={{ paddingTop: 8 }}>
          <div className="items-title">📦 รายการสินค้า ({totalQty} ชิ้น)</div>
          {items.map((it, i) => (
            <div className="item" key={i}>
              <span className="chk" />
              <span className="qty">{it.qty}×</span>
              <span className="iname">{it.name}</span>
            </div>
          ))}
          <div className="totline">รวม {items.length} รายการ · {totalQty} ชิ้น</div>
        </div>

        {order.note && <div className="note">📝 หมายเหตุ: {order.note}</div>}
      </div>
    </div>
  )
}
