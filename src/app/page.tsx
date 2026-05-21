'use client'
import { useState } from 'react'
import VelaBunny from '@/components/VelaBunny'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type TrackingEvent = {
  status_code: string
  status: string
  description: string
  datetime: string
  location: string
}

type TrackingResult = {
  barcode: string
  status: string
  status_th: string
  latest_event: TrackingEvent | null
  events: TrackingEvent[]
  error?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  accepted:         { label: 'รับฝากแล้ว',         color: '#8C7B6E', bg: '#E0D9CE', dot: '●' },
  in_transit:       { label: 'อยู่ระหว่างขนส่ง',    color: '#8B5E00', bg: '#F5E6C0', dot: '◎' },
  out_for_delivery: { label: 'ออกนำจ่ายแล้ว',      color: '#1A5C8F', bg: '#C8E0F5', dot: '◈' },
  delivered:        { label: 'จัดส่งสำเร็จ',        color: '#1A6B3C', bg: '#C5E8D5', dot: '✓' },
  returned:         { label: 'ตีกลับ',              color: '#D64B2A', bg: '#F5D5CC', dot: '↩' },
  problem:          { label: 'มีปัญหา',             color: '#D64B2A', bg: '#F5D5CC', dot: '!' },
  pending:          { label: 'รอข้อมูล',            color: '#8C7B6E', bg: '#E0D9CE', dot: '○' },
  unknown:          { label: 'ไม่ทราบสถานะ',        color: '#C5BAB0', bg: '#EDE8DF', dot: '?' },
}

function StatusPill({ status, status_th }: { status: string; status_th: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium"
      style={{ color: cfg.color, background: cfg.bg }}>
      <span>{cfg.dot}</span>
      {status_th || cfg.label}
    </span>
  )
}

function Timeline({ events }: { events: TrackingEvent[] }) {
  const ordered = [...events].reverse()
  return (
    <div className="mt-4">
      {ordered.map((e, i) => {
        const cfg = STATUS_CONFIG[e.status] || STATUS_CONFIG.unknown
        const isLatest = i === 0
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                style={{ background: isLatest ? cfg.color : '#C5BAB0',
                  boxShadow: isLatest ? `0 0 6px ${cfg.color}60` : 'none' }} />
              {i < ordered.length - 1 && (
                <div className="w-px flex-1 my-1" style={{ background: '#D8D0C5', minHeight: '16px' }} />
              )}
            </div>
            <div className={`pb-4 flex-1 ${isLatest ? '' : 'opacity-40'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: isLatest ? cfg.color : '#8C7B6E' }}>
                    {e.description}
                  </p>
                  {e.location && (
                    <p className="text-xs mt-0.5" style={{ color: '#8C7B6E', fontFamily: 'var(--font-mono)' }}>
                      {e.location}
                    </p>
                  )}
                </div>
                {e.datetime && (
                  <p className="text-xs font-mono whitespace-nowrap text-right flex-shrink-0" style={{ color: '#C5BAB0' }}>
                    {e.datetime.split(' ')[0]}<br/>
                    <span style={{ color: '#8C7B6E' }}>{e.datetime.split(' ')[1]?.split('+')[0]}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrackCard({ result, index }: { result: TrackingResult; index: number }) {
  const [open, setOpen] = useState(index === 0)
  if (result.error) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-5 text-center opacity-60"
        style={{ borderColor: '#C5BAB0' }}>
        <p className="font-mono text-sm" style={{ color: '#8C7B6E' }}>{result.barcode}</p>
        <p className="text-xs mt-1" style={{ color: '#C5BAB0' }}>ไม่พบข้อมูล</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl overflow-hidden border-2 animate-fade-up"
      style={{ borderColor: '#D8D0C5', animationDelay: `${index * 100}ms`, opacity: 0, background: '#F5F1EB' }}>
      {/* Header */}
      <button className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-vela-cream-dark"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3 min-w-0">
          <StatusPill status={result.status} status_th={result.status_th} />
          <span className="font-mono text-sm truncate" style={{ color: '#8C7B6E' }}>{result.barcode}</span>
        </div>
        <span className="flex-shrink-0 text-vela-muted text-xs font-mono">{open ? '▲' : '▼'}</span>
      </button>

      {/* Latest location */}
      {result.latest_event?.location && (
        <div className="px-5 pb-2">
          <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
            ตำแหน่งล่าสุด: {result.latest_event.location}
          </p>
        </div>
      )}

      {/* Timeline */}
      {open && result.events?.length > 0 && (
        <div className="px-5 pb-4 border-t-2" style={{ borderColor: '#E0D9CE' }}>
          <Timeline events={result.events} />
        </div>
      )}
    </div>
  )
}

export default function TrackingPage() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TrackingResult[]>([])
  const [error,   setError]   = useState('')
  const [tried,   setTried]   = useState(false)

  const parseInput = (raw: string) =>
    raw.split(/[\n,\s]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => /^[A-Z]{2}\d{6,}TH$/i.test(s))

  const handleTrack = async () => {
    const barcodes = parseInput(input)
    if (!barcodes.length) { setError('กรุณาใส่เลข tracking ในรูปแบบ JMxxxxxxxxTH'); return }
    setError(''); setLoading(true); setResults([]); setTried(true)
    try {
      const res  = await fetch(`${API}/track/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodes }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setError('เชื่อมต่อไม่ได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const hasResults = results.length > 0
  const delivered  = results.filter(r => r.status === 'delivered').length

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-xl mx-auto px-5 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block animate-float mb-4">
            <VelaBunny size={56} />
          </div>

          <h1 className="text-6xl font-black uppercase leading-none mb-1"
            style={{ fontFamily: 'var(--font-display)', color: '#D64B2A', letterSpacing: '-0.02em' }}>
            VeLA
          </h1>
          <p className="text-xs tracking-[0.25em] uppercase font-mono mb-1" style={{ color: '#8C7B6E' }}>
            Cold Brew Coffee
          </p>
          <p className="text-sm mt-3" style={{ color: '#8C7B6E', fontFamily: 'var(--font-body)' }}>
            ติดตามสถานะพัสดุของคุณ
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-3xl p-5 mb-4 border-2"
          style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#8C7B6E' }}>
            เลข Tracking (1 เลขต่อ 1 บรรทัด)
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleTrack())}
            placeholder={'JM123456789TH\nJM987654321TH'}
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm font-mono resize-none transition-all
              focus:outline-none border-2"
            style={{
              background: '#EDE8DF', color: '#3D1F0F',
              borderColor: '#D8D0C5', fontFamily: 'var(--font-mono)',
            }}
            onFocus={e => e.target.style.borderColor = '#D64B2A'}
            onBlur={e => e.target.style.borderColor = '#D8D0C5'}
          />
          {error && <p className="text-xs mt-2 font-mono" style={{ color: '#D64B2A' }}>{error}</p>}

          <button onClick={handleTrack} disabled={loading}
            className="mt-3 w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
              disabled:opacity-50 active:scale-95"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              background: loading ? '#C5BAB0' : '#D64B2A',
              color: '#EDE8DF',
              letterSpacing: '0.15em',
            }}>
            {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}
          </button>
        </div>

        {/* Summary bar */}
        {hasResults && !loading && (
          <div className="flex items-center justify-between px-4 py-2 rounded-xl mb-4 animate-fade-in"
            style={{ background: '#F5F1EB', border: '2px solid #D8D0C5' }}>
            <span className="text-xs font-mono" style={{ color: '#8C7B6E' }}>
              {results.length} รายการ
            </span>
            <span className="text-xs font-mono" style={{ color: '#1A6B3C' }}>
              จัดส่งแล้ว {delivered}/{results.length}
            </span>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl animate-pulse"
                style={{ background: '#E0D9CE', animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.map((r, i) => (
          <div key={r.barcode} className="mb-3">
            <TrackCard result={r} index={i} />
          </div>
        ))}

        {/* Empty state */}
        {tried && !loading && results.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <VelaBunny size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm" style={{ color: '#8C7B6E' }}>ไม่พบข้อมูลพัสดุ</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>
            VeLA Cold Brew Coffee © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  )
}
