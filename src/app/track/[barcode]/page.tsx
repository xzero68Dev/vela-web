'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'
import { useAuth } from '@/context/AuthContext'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

const STATUS_COLOR: Record<string, string> = {
  accepted:         '#8C7B6E',
  in_transit:       '#8B5E00',
  out_for_delivery: '#1A5C8F',
  delivered:        '#1A6B3C',
  returned:         '#D64B2A',
  problem:          '#D64B2A',
  pending:          '#C5BAB0',
}

const STATUS_ICON: Record<string, string> = {
  accepted:         '📦',
  in_transit:       '🚚',
  out_for_delivery: '🏍',
  delivered:        '✅',
  returned:         '↩️',
  problem:          '⚠️',
  pending:          '⏳',
}

export default function TrackPage() {
  const params  = useParams()
  const barcode = (params.barcode as string || '').toUpperCase()

  const { user } = useAuth()
  const [result,  setResult]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // detect carrier จาก format เลข tracking
  const detectCarrier = (b: string): { name: string; url: string } | null => {
    if (/^(TH|SCPK|SXF)/i.test(b))                return { name: 'Kerry Express',   url: `https://th.kerryexpress.com/th/track/` }
    if (/^(FLE|FEX)/i.test(b))                     return { name: 'Flash Express',   url: `https://www.flashexpress.co.th/tracking/?se=${b}` }
    if (/^(TDE|JPT|JTTH)/i.test(b))                return { name: 'J&T Express',    url: `https://www.jtexpress.co.th/trajectoryQuery?waybillno=${b}` }
    if (/^[A-Z]{2}\d{9}TH$/.test(b))              return { name: 'ไปรษณีย์ไทย',  url: `https://track.thailandpost.co.th/?trackNumber=${b}` }
    if (/^\d{13}$/.test(b))                        return { name: 'ไปรษณีย์ไทย',  url: `https://track.thailandpost.co.th/?trackNumber=${b}` }
    if (/^(SCG|SCGL)/i.test(b))                   return { name: 'SCG Express',    url: `https://www.scgexpress.co.th/tracking/TrackingSearch.aspx?txtTrackingNo=${b}` }
    if (/^(DHL)/i.test(b))                        return { name: 'DHL',            url: `https://www.dhl.com/th-th/home/tracking.html?tracking-id=${b}` }
    return null
  }

  const carrier = detectCarrier(barcode)
  const isThaiPost = !carrier || carrier.name === 'ไปรษณีย์ไทย'

  useEffect(() => {
    if (!barcode) return
    // ถ้าไม่ใช่ไปรษณีย์ไทย ไม่ต้องเรียก API ของเรา
    if (!isThaiPost) { setLoading(false); return }
    fetch(`${API}/track/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcodes: [barcode] })
    })
      .then(r => r.json())
      .then(data => {
        const r = data.results?.[0]
        if (r && r.status !== 'not_found') setResult(r)
        else setError('ไม่พบข้อมูลพัสดุ')
      })
      .catch(() => setError('เชื่อมต่อไม่ได้ กรุณาลองใหม่'))
      .finally(() => setLoading(false))
  }, [barcode])

  const color = result ? (STATUS_COLOR[result.status] || '#8C7B6E') : '#8C7B6E'

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#EDE8DF' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#F5F1EB', borderBottom: '2px solid #E0D9CE' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="VeLA" className="h-8 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </Link>
        <Link href="/" className="text-xs font-mono px-3 py-1.5 rounded-xl border-2"
          style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
          ร้านค้า →
        </Link>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-8">

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 rounded-full mx-auto mb-4 animate-spin"
              style={{ borderColor: '#E0D9CE', borderTopColor: '#D64B2A' }} />
            <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังตรวจสอบ...</p>
          </div>

        ) : !isThaiPost && carrier ? (
          /* ขนส่งที่ไม่ใช่ไปรษณีย์ไทย */
          <div className="space-y-4">
            <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <div className="px-5 py-4 text-center border-b-2" style={{ borderColor: '#E0D9CE' }}>
                <div className="text-4xl mb-2">📦</div>
                <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>
                  {carrier.name}
                </p>
                {/* แสดงเลข tracking พร้อมปุ่ม copy */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="font-mono text-sm" style={{ color: '#8C7B6E' }}>{barcode}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(barcode); alert('คัดลอกเลขพัสดุแล้ว!') }}
                    className="text-xs px-2 py-1 rounded-lg border transition-all active:scale-95"
                    style={{ borderColor: '#D8D0C5', color: '#D64B2A', background: '#FFF5F3' }}>
                    คัดลอก
                  </button>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-xs font-mono text-center" style={{ color: '#C5BAB0' }}>
                  กด "คัดลอก" แล้วกดปุ่มด้านล่างเพื่อตรวจสอบสถานะ จากนั้นวางเลขพัสดุในช่องค้นหาครับ
                </p>
                <a href={carrier.url} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-3 rounded-2xl font-black uppercase text-sm text-center transition-all active:scale-95"
                  style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                  ไปที่เว็บ {carrier.name} →
                </a>
              </div>
            </div>
          </div>

        ) : error ? (
          <div className="text-center py-20">
            <VelaBunny size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm" style={{ color: '#8C7B6E' }}>{error}</p>
            <p className="text-xs font-mono mt-2" style={{ color: '#C5BAB0' }}>{barcode}</p>
            {/* ถ้าไม่เจอในระบบ แต่ detect carrier ได้ → ยังแสดงลิงก์ external ได้ */}
            {carrier && (
              <a href={carrier.url} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 rounded-xl border-2 text-xs font-mono transition-all"
                style={{ borderColor: '#D64B2A', color: '#D64B2A' }}>
                ลองเช็คที่ {carrier.name} →
              </a>
            )}
          </div>
        ) : result && (
          <>
            {/* Status card */}
            <div className="rounded-3xl overflow-hidden border-2 mb-4"
              style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>

              {/* Status header */}
              <div className="px-6 py-5 text-center" style={{ background: color + '15' }}>
                <div className="text-4xl mb-2">{STATUS_ICON[result.status] || '📦'}</div>
                <p className="font-black text-2xl uppercase"
                  style={{ fontFamily: 'var(--font-display)', color }}>
                  {result.status_th || result.status}
                </p>
                {result.latest_event?.location && (
                  <p className="text-sm mt-1 font-mono" style={{ color: '#8C7B6E' }}>
                    {result.latest_event.location}
                  </p>
                )}
                {result.latest_event?.datetime && (
                  <p className="text-xs mt-0.5 font-mono" style={{ color: '#C5BAB0' }}>
                    {result.latest_event.datetime}
                  </p>
                )}
              </div>

              {/* Barcode */}
              <div className="px-6 py-3 border-t-2 text-center" style={{ borderColor: '#E0D9CE' }}>
                <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>เลขพัสดุ</p>
                <p className="font-mono font-bold" style={{ color: '#3D1F0F' }}>{barcode}</p>
              </div>
            </div>

            {/* Timeline */}
            {result.events && result.events.length > 0 && (
              <div className="rounded-3xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                <div className="px-5 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>ประวัติการจัดส่ง</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {[...result.events].reverse().map((e: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: i === 0 ? '#D64B2A' : '#D8D0C5' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-tight"
                          style={{ color: i === 0 ? '#3D1F0F' : '#8C7B6E', fontWeight: i === 0 ? 600 : 400 }}>
                          {e.description || e.status_th || e.status}
                        </p>
                        <div className="flex gap-2 flex-wrap mt-0.5">
                          {e.location && <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{e.location}</p>}
                          {e.datetime && <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{e.datetime}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LINE Login CTA */}
            {!user && (
              <div className="mt-4 rounded-2xl border-2 px-5 py-4" style={{ background: '#F0FFF4', borderColor: '#06C75530' }}>
                <p className="font-black text-sm uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#06C755' }}>
                  รับแจ้งเตือนผ่าน LINE
                </p>
                <p className="text-xs mb-3" style={{ color: '#8C7B6E' }}>
                  Login ด้วย LINE เพื่อรับแจ้งเตือนสถานะพัสดุทันที และรับสิทธิพิเศษเฉพาะสมาชิก 🐰
                </p>
                <LineLoginButton onDone={() => {}} />
              </div>
            )}

            {user && (
              <div className="mt-4 rounded-2xl border-2 px-5 py-3 flex items-center gap-3" style={{ background: '#F0FFF4', borderColor: '#06C75530' }}>
                {user.picture_url && <img src={user.picture_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono" style={{ color: '#1A6B3C' }}>✓ เชื่อมต่อ LINE แล้ว</p>
                  <p className="text-xs" style={{ color: '#8C7B6E' }}>จะได้รับแจ้งเตือนผ่าน LINE เมื่อพัสดุถึง</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 rounded-2xl border-2 px-5 py-4 text-center"
              style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <p className="text-xs mb-3" style={{ color: '#8C7B6E' }}>
                สั่งซื้อกาแฟสกัดเย็นคุณภาพสูงจาก VeLA
              </p>
              <Link href="/"
                className="inline-block px-6 py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95"
                style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                ช้อปเลย
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
