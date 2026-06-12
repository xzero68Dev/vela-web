'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'

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

  const [result,  setResult]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!barcode) return
    fetch(`${API}/track/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcodes: [barcode] })
    })
      .then(r => r.json())
      .then(data => {
        const r = data.results?.[0]
        if (r) setResult(r)
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
        ) : error ? (
          <div className="text-center py-20">
            <VelaBunny size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm" style={{ color: '#8C7B6E' }}>{error}</p>
            <p className="text-xs font-mono mt-2" style={{ color: '#C5BAB0' }}>{barcode}</p>
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
