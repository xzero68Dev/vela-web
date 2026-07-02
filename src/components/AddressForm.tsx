'use client'
import { useState } from 'react'
import { CreateInput, Address } from 'thai-address-autocomplete-react'

const InputThaiAddress = CreateInput()

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
  initial?:  Partial<AddressData>
  onSave:    (data: AddressData) => void
  onCancel?: () => void
  loading?:  boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 12,
  border: '2px solid #D8D0C5', background: '#F5F1EB',
  color: '#3D1F0F', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: '#8C7B6E', marginBottom: 4, display: 'block'
}

export default function AddressForm({ initial, onSave, onCancel, loading }: Props) {
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

  const handleSelect = (addr: Address) => {
    setForm(f => ({
      ...f,
      subdistrict: addr.district  || '',
      district:    addr.amphoe    || '',
      province:    addr.province  || '',
      zip:         addr.zipcode   || '',
    }))
  }

  const handleSubmit = () => {
    if (!form.name.trim())         { setError('กรุณาใส่ชื่อผู้รับ'); return }
    if (!form.phone.trim())        { setError('กรุณาใส่เบอร์โทร'); return }
    if (!form.full_address.trim()) { setError('กรุณาใส่บ้านเลขที่/ซอย/ถนน'); return }
    if (!form.subdistrict.trim())  { setError('กรุณาเลือกตำบล/แขวง'); return }
    if (!form.province.trim())     { setError('กรุณาเลือกจังหวัด'); return }
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
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>เบอร์โทร *</label>
          <input value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            type="tel" inputMode="numeric" style={inputStyle} />
        </div>
      </div>

      {/* บ้านเลขที่ */}
      <div>
        <label style={labelStyle}>บ้านเลขที่ / หมู่ / ซอย / ถนน *</label>
        <input value={form.full_address}
          onChange={e => setForm(f => ({ ...f, full_address: e.target.value }))}
          style={inputStyle} />
      </div>

      {/* ตำบล */}
      <div>
        <label style={labelStyle}>ตำบล / แขวง *</label>
        <div className="thai-addr">
          <InputThaiAddress.District
            value={form.subdistrict}
            onChange={(v: string) => setForm(f => ({ ...f, subdistrict: v }))}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* อำเภอ */}
      <div>
        <label style={labelStyle}>อำเภอ / เขต</label>
        <div className="thai-addr">
          <InputThaiAddress.Amphoe
            value={form.district}
            onChange={(v: string) => setForm(f => ({ ...f, district: v }))}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* จังหวัด + รหัสไปรษณีย์ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>จังหวัด *</label>
          <div className="thai-addr">
            <InputThaiAddress.Province
              value={form.province}
              onChange={(v: string) => setForm(f => ({ ...f, province: v }))}
              onSelect={handleSelect}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>รหัสไปรษณีย์</label>
          <div className="thai-addr">
            <InputThaiAddress.Zipcode
              value={form.zip}
              onChange={(v: string) => setForm(f => ({ ...f, zip: v }))}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      {/* ที่อยู่หลัก */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={form.is_default}
          onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} />
        <span style={{ fontSize: 13, color: '#8C7B6E' }}>ตั้งเป็นที่อยู่หลัก</span>
      </label>

      {error && (
        <p style={{ color: '#D64B2A', fontSize: 12, fontFamily: 'monospace' }}>{error}</p>
      )}

      {/* ปุ่ม */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{
            flex: 1, padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: loading ? '#E0D9CE' : '#D64B2A',
            color: '#EDE8DF', fontWeight: 900, fontSize: 13,
            fontFamily: 'var(--font-display)', textTransform: 'uppercase',
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

      <style>{`
        .thai-addr input {
          width: 100% !important;
          padding: 10px 14px !important;
          border-radius: 12px !important;
          border: 2px solid #D8D0C5 !important;
          background: #F5F1EB !important;
          color: #3D1F0F !important;
          font-size: 14px !important;
          font-family: inherit !important;
          outline: none !important;
          box-sizing: border-box !important;
        }
        .thai-addr ul {
          border-radius: 12px !important;
          border: 2px solid #E0D9CE !important;
          background: #F5F1EB !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
          z-index: 50 !important;
          list-style: none !important;
          margin: 4px 0 0 !important;
          padding: 4px 0 !important;
        }
        .thai-addr li {
          padding: 8px 14px !important;
          font-size: 13px !important;
          color: #3D1F0F !important;
          cursor: pointer !important;
        }
        .thai-addr li:hover {
          background: #EDE8DF !important;
        }
      `}</style>
    </div>
  )
}
