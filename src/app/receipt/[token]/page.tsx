'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type ReceiptInfo = {
  receipt_no?: string
  date_str?: string
  total?: number
  order_id?: string
  customer_name?: string
  shop?: { name?: string; address?: string; phone?: string }
}

export default function ReceiptPage() {
  const params = useParams()
  const token  = String(params?.token || '')
  const [info,    setInfo]    = useState<ReceiptInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`${API}/receipt/${encodeURIComponent(token)}`)
      .then(r => { if (!r.ok) throw new Error('nf'); return r.json() })
      .then(setInfo)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  const pdfUrl = `${API}/receipt/${encodeURIComponent(token)}/pdf`

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#EDE8DF' }}>
      {/* header */}
      <div className="px-5 py-4 border-b-2 flex items-center justify-center" style={{ borderColor: '#E0D9CE' }}>
        <img src="/logo.png" alt="VeLA Cold Brew" className="h-8 object-contain" />
      </div>

      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        {loading ? (
          <p className="text-sm font-mono mt-10" style={{ color: '#C5BAB0' }}>กำลังโหลด…</p>
        ) : notFound || !info ? (
          <div className="text-center mt-10 space-y-3">
            <p className="text-4xl">🧾</p>
            <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
              ไม่พบใบเสร็จนี้
            </p>
            <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
              ลิงก์อาจหมดอายุหรือไม่ถูกต้อง
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-5">

            {/* บัตรใบเสร็จ */}
            <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
              <div className="px-5 py-4 text-center" style={{ background: '#2E75B6' }}>
                <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>
                  ใบเสร็จรับเงิน
                </p>
                <p className="text-xs font-mono" style={{ color: '#D6E4F5' }}>{info.shop?.name || 'VeLA Cold Brew'}</p>
              </div>

              <div className="px-5 py-4 divide-y-2" style={{ borderColor: '#E0D9CE' }}>
                {[
                  { label: 'เลขที่',   value: info.receipt_no },
                  { label: 'วันที่',   value: info.date_str },
                  { label: 'ลูกค้า',   value: info.customer_name },
                  { label: 'อ้างอิง',  value: info.order_id },
                ].filter(x => x.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3 py-2.5">
                    <span className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{label}</span>
                    <span className="text-xs text-right" style={{ color: '#3D1F0F' }}>{value}</span>
                  </div>
                ))}
                {typeof info.total === 'number' && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ยอดสุทธิ</span>
                    <span className="font-black text-xl" style={{ fontFamily: 'var(--font-display)', color: '#2E75B6' }}>
                      ฿{Number(info.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95"
                  style={{ fontFamily: 'var(--font-display)', background: '#2E75B6', color: '#fff' }}>
                  ⬇️ ดาวน์โหลดใบเสร็จ (PDF)
                </a>
              </div>
            </div>

            {/* CTA — ชวนสั่งที่เว็บ */}
            <div className="rounded-3xl border-2 p-5 text-center space-y-3" style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
              <p className="text-3xl">☕</p>
              <p className="font-black text-base" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
                ชอบกาแฟสดของเราไหม?
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#8C7B6E' }}>
                สั่งตรงที่เว็บ VeLA — สะสมแต้มทุกออเดอร์ เลือกรสได้ครบ ส่งสดถึงบ้าน
              </p>
              <Link href="/"
                className="block w-full text-center py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95"
                style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                🛒 สั่งกาแฟที่ VeLA →
              </Link>
            </div>

            {info.shop && (
              <p className="text-center text-xs font-mono leading-relaxed" style={{ color: '#C5BAB0' }}>
                {info.shop.name} · โทร {info.shop.phone}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
