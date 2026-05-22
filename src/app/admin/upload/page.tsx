'use client'
import { useState, useRef, useCallback } from 'react'
import VelaBunny from '@/components/VelaBunny'
import Link from 'next/link'

const API  = process.env.NEXT_PUBLIC_API_URL  || 'https://vela-tracking.onrender.com'
const PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'vela2024'

type ImportResult = {
  success: boolean
  filename: string
  message: string
  imported: {
    orders: number
    shipping: number
    tracking_added: number
    tracking_list: string[]
  }
}

export default function UploadPage() {
  const [authed,    setAuthed]    = useState(false)
  const [pass,      setPass]      = useState('')
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState<ImportResult | null>(null)
  const [error,     setError]     = useState('')
  const [fileName,  setFileName]  = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const login = () => {
    if (pass === PASS) setAuthed(true)
    else alert('รหัสผ่านไม่ถูกต้อง')
  }

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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  if (!authed) return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: '#EDE8DF' }}>
      <div className="w-full max-w-xs text-center">
        <VelaBunny size={48} className="mx-auto mb-4" />
        <h1 className="text-4xl font-black uppercase mb-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          VeLA Admin
        </h1>
        <p className="text-xs font-mono mb-6" style={{ color: '#8C7B6E' }}>Import ข้อมูล</p>
        <input type="password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="รหัสผ่าน"
          className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono mb-3 focus:outline-none"
          style={{ background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }}
        />
        <button onClick={login}
          className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-display)', fontSize: '16px', background: '#D64B2A', color: '#EDE8DF' }}>
          เข้าสู่ระบบ
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelaBunny size={36} />
            <div>
              <h1 className="text-3xl font-black uppercase leading-none"
                style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>Import</h1>
              <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>อัพโหลดไฟล์ Excel รายวัน</p>
            </div>
          </div>
          <Link href="/admin"
            className="px-4 py-2 rounded-xl border-2 text-xs font-mono transition-all"
            style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
            ← Admin
          </Link>
        </div>

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
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileChange} />

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

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-2xl border-2"
            style={{ background: '#F5D5CC', borderColor: '#D64B2A50' }}>
            <p className="text-sm font-medium" style={{ color: '#D64B2A' }}>⚠ {error}</p>
          </div>
        )}

        {/* Success result */}
        {result && (
          <div className="mt-4 rounded-3xl border-2 overflow-hidden"
            style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>

            {/* Success header */}
            <div className="px-5 py-4 border-b-2" style={{ borderColor: '#E0D9CE', background: '#C5E8D5' }}>
              <p className="font-black text-lg uppercase" style={{ fontFamily: 'var(--font-display)', color: '#1A6B3C' }}>
                ✓ Import สำเร็จ
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#1A6B3C' }}>{result.filename}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x-2" style={{ borderColor: '#E0D9CE' }}>
              {[
                { label: 'Orders',   value: result.imported.orders },
                { label: 'Shipping', value: result.imported.shipping },
                { label: 'Tracking', value: result.imported.tracking_added },
              ].map(s => (
                <div key={s.label} className="px-4 py-4 text-center">
                  <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                    {s.value}
                  </p>
                  <p className="text-xs font-mono mt-1" style={{ color: '#8C7B6E' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tracking list */}
            {result.imported.tracking_list.length > 0 && (
              <div className="px-5 py-4 border-t-2" style={{ borderColor: '#E0D9CE' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#8C7B6E' }}>
                  Tracking ที่เพิ่มเข้าระบบ
                </p>
                <div className="space-y-1">
                  {result.imported.tracking_list.map(t => (
                    <p key={t} className="text-xs font-mono" style={{ color: '#3D1F0F' }}>→ {t}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="px-5 py-4 border-t-2 flex gap-2" style={{ borderColor: '#E0D9CE' }}>
              <button onClick={() => { setResult(null); setFileName('') }}
                className="flex-1 py-2.5 rounded-xl border-2 text-xs font-mono uppercase tracking-wider transition-all"
                style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                อัพโหลดไฟล์ใหม่
              </button>
              <Link href="/admin"
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all"
                style={{ fontFamily: 'var(--font-display)', fontSize: '13px', background: '#D64B2A', color: '#EDE8DF' }}>
                ดูสถานะพัสดุ
              </Link>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!result && !uploading && (
          <div className="mt-6 px-5 py-4 rounded-2xl border-2" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#C5BAB0' }}>วิธีใช้</p>
            {[
              'ไฟล์ Excel ต้องมี sheet "Orders" และ "Shipping"',
              'Orders ใหม่จะถูกเพิ่มเข้า database อัตโนมัติ',
              'Tracking POST SABUY จะถูกเพิ่มเข้าระบบตรวจสอบ',
              'ข้อมูลที่มีอยู่แล้วจะไม่ถูกทับ (upsert)',
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
