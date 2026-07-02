'use client'
import { useState, useEffect, useRef } from 'react'

export interface AddressData {
  id?:          number
  name:         string
  phone:        string
  full_address: string
  subdistrict:  string
  district:     string
  province:     string
  zip:          string
  is_default:   boolean
}

interface Props {
  initial?:    Partial<AddressData>
  onSave:      (data: AddressData) => void
  onChange?:   (data: AddressData) => void
  onCancel?:   () => void
  loading?:    boolean
  hideButton?: boolean
}

// ดึงข้อมูลจาก library โดยตรง
type ThaiAddr = { d: string; a: string; p: string; z: string }
let DB: ThaiAddr[] = []
async function getDB(): Promise<ThaiAddr[]> {
  if (DB.length) return DB
  try {
    const mod = await import('thai-address-autocomplete-react')
    // @ts-ignore
    const raw = mod.DB || mod.default?.DB || []
    DB = raw
  } catch {}
  return DB
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-all"
const inputStyle = { background: '#F5F1EB', borderColor: '#D8D0C5', color: '#3D1F0F' }
const labelStyle: React.CSSProperties = { fontSize: 12, color: '#8C7B6E', marginBottom: 4, display: 'block' }

function AutocompleteInput({
  label, value, onChange, field,
}: {
  label: string
  value: string
  onChange: (val: string, full?: ThaiAddr) => void
  field: 'd' | 'a' | 'p' | 'z'
}) {
  const [suggestions, setSuggestions] = useState<ThaiAddr[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleInput = async (v: string) => {
    onChange(v)
    if (v.length < 2) { setSuggestions([]); setOpen(false); return }
    const db = await getDB()
    const lower = v.toLowerCase()
    const matches = db.filter(r => r[field]?.toLowerCase().startsWith(lower)).slice(0, 8)
    setSuggestions(matches)
    setOpen(matches.length > 0)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={inputCls}
        style={inputStyle}
      />
      {open && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#F5F1EB', border: '2px solid #E0D9CE', borderRadius: 12,
          marginTop: 4, padding: '4px 0', maxHeight: 200, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', listStyle: 'none',
        }}>
          {suggestions.map((s, i) => (
            <li key={i}
              onMouseDown={() => { onChange(s[field], s); setOpen(false) }}
              style={{
                padding: '8px 14px', fontSize: 13, color: '#3D1F0F',
                cursor: 'pointer', listStyle: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EDE8DF')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {s.d} › {s.a} › {s.p} ({s.z})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AddressForm({ initial, onSave, onChange, onCancel, loading, hideButton }: Props) {
  const [form, setForm] = useState<AddressData>({
    name:         initial?.name         || '',
    phone:        initial?.phone        || '',
    full_address: initial?.full_address || '',
    subdistrict:  initial?.subdistrict  || '',
    district:     initial?.district     || '',
    province:     initial?.province     || '',
    zip:          initial?.zip          || '',
    is_default:   initial?.is_default   ?? false,
    id:           initial?.id,
  })
  const [error, setError] = useState('')

  const update = (patch: Partial<AddressData>) => {
    const next = { ...form, ...patch }
    setForm(next)
    onChange?.(next)
  }

  const handleSelect = (full: ThaiAddr) => {
    update({ subdistrict: full.d, district: full.a, province: full.p, zip: full.z })
  }

  const handleSubmit = () => {
    if (!form.name.trim())         { setError('กรุณาใส่ชื่อผู้รับ'); return }
    if (!form.phone.trim())        { setError('กรุณาใส่เบอร์โทร'); return }
    if (!form.full_address.trim()) { setError('กรุณาใส่บ้านเลขที่/ซอย/ถนน'); return }
    if (!form.subdistrict.trim())  { setError('กรุณาระบุตำบล/แขวง'); return }
    if (!form.province.trim())     { setError('กรุณาระบุจังหวัด'); return }
    setError('')
    onSave(form)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ชื่อ + เบอร์ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>ชื่อผู้รับ *</label>
          <input value={form.name}
            onChange={e => update({ name: e.target.value })}
            className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>เบอร์โทร *</label>
          <input value={form.phone}
            onChange={e => update({ phone: e.target.value })}
            type="tel" inputMode="numeric"
            className={inputCls} style={inputStyle} />
        </div>
      </div>

      {/* บ้านเลขที่ */}
      <div>
        <label style={labelStyle}>บ้านเลขที่ / หมู่ / ซอย / ถนน *</label>
        <input value={form.full_address}
          onChange={e => update({ full_address: e.target.value })}
          className={inputCls} style={inputStyle} />
      </div>

      {/* ตำบล */}
      <AutocompleteInput
        label="ตำบล / แขวง *"
        value={form.subdistrict}
        field="d"
        onChange={(v, full) => full ? handleSelect(full) : update({ subdistrict: v })}
      />

      {/* อำเภอ */}
      <AutocompleteInput
        label="อำเภอ / เขต"
        value={form.district}
        field="a"
        onChange={(v, full) => full ? handleSelect(full) : update({ district: v })}
      />

      {/* จังหวัด + รหัสไปรษณีย์ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <AutocompleteInput
          label="จังหวัด *"
          value={form.province}
          field="p"
          onChange={(v, full) => full ? handleSelect(full) : update({ province: v })}
        />
        <AutocompleteInput
          label="รหัสไปรษณีย์"
          value={form.zip}
          field="z"
          onChange={(v, full) => full ? handleSelect(full) : update({ zip: v })}
        />
      </div>

      {/* ที่อยู่หลัก */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={form.is_default}
          onChange={e => update({ is_default: e.target.checked })} />
        <span style={{ fontSize: 13, color: '#8C7B6E' }}>ตั้งเป็นที่อยู่หลัก</span>
      </label>

      {error && <p style={{ color: '#D64B2A', fontSize: 12, fontFamily: 'monospace' }}>{error}</p>}

      {!hideButton && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={handleSubmit} disabled={loading}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: loading ? '#E0D9CE' : '#D64B2A',
              color: '#EDE8DF', fontWeight: 900, fontSize: 13,
              fontFamily: 'var(--font-display)', textTransform: 'uppercase',
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? 'กำลังบันทึก...' : '✓ บันทึกที่อยู่'}
          </button>
          {onCancel && (
            <button onClick={onCancel}
              style={{
                padding: '12px 16px', borderRadius: 12,
                border: '2px solid #D8D0C5', background: 'transparent',
                color: '#8C7B6E', cursor: 'pointer', fontSize: 13,
              }}>
              ยกเลิก
            </button>
          )}
        </div>
      )}
    </div>
  )
}
