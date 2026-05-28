'use client'
import { useState, useRef, useCallback } from 'react'
import { useAdminAuth } from '@/components/useAdminAuth'
import AdminNav from '@/components/AdminNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type ImportResult = {
  success: boolean
  filename: string
  message: string
  imported: {
    orders: number
    shipping: number
    tracking_added: number
    tracking_list: string[]
    accounting?: number
    daily_summary?: number
  }
}

export default function UploadPage() {
  const ready    = useAdminAuth()
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState<ImportResult | null>(null)
  const [error,     setError]     = useState('')
  const [fileName,  setFileName]  = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError('รองรับเฉพาะไฟล์ .xlsx หรือ .xls เท่านั้น')
      return
    }
    setFileName(file.name)
    setError('')
    setResult(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch(`${API}/admin/import`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'เกิดข้อผิดพลาด')
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'เชื่อมต่อไม่ได้ กรุณาลองใหม่')
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  if (!ready) return null

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-xl mx-auto px-5 py-10">
        <AdminNav />

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          className="relative rounded-3xl border-4 border-dashed p-12 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragging ? '#D64B2A' : '#D8D0C5',
            background: dragging ? '#F5D5CC' : '#F5F1EB',
          }}>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />

          {uploading ? (
            <div>
              <div className="w-10 h-10 border-4 rounded-full mx-auto mb-4 animate-spin"
                style={{ borderColor: '#D8D0C5', borderTopColor: '#D64B2A' }} />
              <p className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                กำลัง Import...
              </p>
              <p className="text-xs font-mono mt-1" style={{ color: '#8C7B6E' }}>{fileName}</p>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4">📂</div>
              <p className="font-black text-xl uppercase mb-2"
                style={{ fontFamily: 'var(--font-display)', color: dragging ? '#D64B2A' : '#3D1F0F' }}>
                {dragging ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวาง'}
              </p>
              <p className="text-sm mb-1" style={{ color: '#8C7B6E' }}>หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>รองรับ .xlsx, .xls</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-2xl border-2"
            style={{ background: '#F5D5CC', borderColor: '#D64B2A50' }}>
            <p className="text-sm font-medium" style={{ color: '#D64B2A' }}>⚠ {error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-3xl border-2 overflow-hidden"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <div className="px-5 py-4 border-b-2" style={{ borderColor: '#E0D9CE', background: '#C5E8D5' }}>
              <p className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)', color: '#1A6B3C' }}>
                ✓ Import สำเร็จ
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#1A6B3C' }}>{result.filename}</p>
            </div>
            <div className="grid grid-cols-5 divide-x-2" style={{ borderColor: '#E0D9CE' }}>
              {[
                { label: 'Orders',      value: result.imported.orders },
                { label: 'Shipping',    value: result.imported.shipping },
                { label: 'Tracking',    value: result.imported.tracking_added },
                { label: 'Accounting',  value: result.imported.accounting || 0 },
                { label: 'Daily Sum',   value: result.imported.daily_summary || 0 },
              ].map(s => (
                <div key={s.label} className="px-4 py-4 text-center">
                  <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>{s.value}</p>
                  <p className="text-xs font-mono mt-1" style={{ color: '#8C7B6E' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {result.imported.tracking_list.length > 0 && (
              <div className="px-5 py-4 border-t-2" style={{ borderColor: '#E0D9CE' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#8C7B6E' }}>
                  Tracking ที่เพิ่มเข้าระบบ
                </p>
                {result.imported.tracking_list.map(t => (
                  <p key={t} className="text-xs font-mono" style={{ color: '#3D1F0F' }}>→ {t}</p>
                ))}
              </div>
            )}
            <div className="px-5 py-4 border-t-2 flex gap-2" style={{ borderColor: '#E0D9CE' }}>
              <button onClick={() => { setResult(null); setFileName('') }}
                className="flex-1 py-2.5 rounded-xl border-2 text-xs font-mono uppercase tracking-wider"
                style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                อัพโหลดไฟล์ใหม่
              </button>
            </div>
          </div>
        )}

        {!result && !uploading && (
          <div className="mt-6 px-5 py-4 rounded-2xl border-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#C5BAB0' }}>วิธีใช้</p>
            {[
              'ไฟล์ Excel ต้องมี sheet "Orders" และ "Shipping"',
              'Tracking POST SABUY จะถูกเพิ่มเข้าระบบตรวจสอบ',
              'ข้อมูลที่มีอยู่แล้วจะอัพเดทให้อัตโนมัติ',
            ].map((t, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="font-mono text-xs flex-shrink-0" style={{ color: '#D64B2A' }}>{i + 1}.</span>
                <p className="text-xs" style={{ color: '#8C7B6E' }}>{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
