'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type LeaderboardEntry = {
  rank: number
  customer: string
  phone_masked: string
  points: number
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function formatThaiMonth(monthStr: string) {
  // monthStr มาจาก backend เป็นรูปแบบ "YYYY-MM"
  const [year, month] = monthStr.split('-').map(Number)
  if (!year || !month) return monthStr
  return `${MONTH_NAMES_TH[month - 1]} ${year + 543}`
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [month,   setMonth]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch(`${API}/leaderboard?limit=10`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.results || [])
        setMonth(data.month || '')
      })
      .catch(() => setError('เชื่อมต่อไม่ได้ กรุณาลองใหม่'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main style={{ background: '#EDE8DF', minHeight: '100vh' }}>

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

      <div className="max-w-lg mx-auto px-5 py-10">

        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-4xl font-black uppercase leading-none mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
            VeLA Ranking
          </h1>
          <p className="text-sm font-mono" style={{ color: '#8C7B6E' }}>
            {month ? `ประจำเดือน ${formatThaiMonth(month)}` : 'จัดอันดับนักดื่มประจำเดือน'}
          </p>
        </div>

        {/* How it works */}
        <div className="rounded-2xl border-2 px-5 py-4 mb-6" style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#854F0B' }}>
            💡 ทุก 100ml ที่ดื่ม = 1 point — รวมยอดจากทุกช่องทาง (Shopee + เว็บ) ตามเบอร์โทรเดียวกัน
            อันดับรีเซ็ตใหม่ทุกเดือน
          </p>
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 rounded-full mx-auto mb-4 animate-spin"
              style={{ borderColor: '#E0D9CE', borderTopColor: '#D64B2A' }} />
            <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <VelaBunny size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm" style={{ color: '#8C7B6E' }}>{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <VelaBunny size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm mb-1" style={{ color: '#8C7B6E' }}>ยังไม่มีใครติดอันดับเดือนนี้</p>
            <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>สั่งซื้อตอนนี้เพื่อเป็นคนแรก!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => {
              const isTop3 = entry.rank <= 3
              return (
                <div key={entry.rank}
                  className="rounded-2xl border-2 px-4 py-3 flex items-center gap-3"
                  style={{
                    background: isTop3 ? '#F5E6C0' : '#F5F1EB',
                    borderColor: isTop3 ? '#D4890A40' : '#E0D9CE',
                  }}>

                  {/* Rank */}
                  <div className="w-9 text-center flex-shrink-0">
                    {MEDAL[entry.rank]
                      ? <span className="text-2xl">{MEDAL[entry.rank]}</span>
                      : <span className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#C5BAB0' }}>
                          {entry.rank}
                        </span>
                    }
                  </div>

                  {/* Customer info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#3D1F0F' }}>
                      {entry.customer || 'ลูกค้า VeLA'}
                    </p>
                    <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{entry.phone_masked}</p>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-xl leading-none"
                      style={{ fontFamily: 'var(--font-display)', color: isTop3 ? '#D64B2A' : '#3D1F0F' }}>
                      {entry.points}
                    </p>
                    <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>point</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 rounded-2xl border-2 px-5 py-4 text-center"
          style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
          <p className="text-xs mb-3" style={{ color: '#8C7B6E' }}>
            ดื่มเยอะ ติดอันดับสูง อาจมีเซอร์ไพรส์พิเศษรอคุณอยู่ 🐰
          </p>
          <Link href="/"
            className="inline-block px-6 py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95"
            style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
            สั่งซื้อเลย
          </Link>
        </div>
      </div>
    </main>
  )
}
