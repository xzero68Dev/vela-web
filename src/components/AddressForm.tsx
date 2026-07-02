'use client'
import { useState, useEffect } from 'react'
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

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 12,
  border: '2px solid #D8D0C5', background: '#F5F1EB',
  color: '#3D1F0F', fontSize: 14, fontFamily: 'inherit', outline: 'none',
}

const labelStyle = { fontSize: 12, color: '#8C7B6E', marginBottom: 4, display: 'block' }

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

  const acStyle: React.CSSProperties = {
    ...inputStyle as any,
    // override styles injected by thai-address-autocomplete-react
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ชื่อ + เบอร์ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>ชื่อผู้รับ *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ชื่อ-นามสกุล" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>เบอร์โทร *</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="0812345678" type="tel" inputMode="numeric" style={inputStyle} />
        </div>
      </div>

      {/* บ้านเลขที่ */}
      <div>
        <label style={labelStyle}>บ้านเลขที่ / หมู่ / ซอย / ถนน *</label>
        <input value={form.full_address}
          onChange={e => setForm(f => ({ ...f, full_address: e.target.value }))}
          placeholder="เช่น 123 ซ.สุขุมวิท 10 ถ.สุขุมวิท" style={inputStyle} />
      </div>

      {/* ตำบล autocomplete */}
      <div>
        <label style={labelStyle}>ตำบล / แขวง *</label>
        <div className="thai-address-wrapper">
          <InputThaiAddress.District
            value={form.subdistrict}
            onChange={(v: string) => setForm(f => ({ ...f, subdistrict: v }))}
            onSelect={handleSelect}
            placeholder="พิมพ์ชื่อตำบล/แขวง"
          />
        </div>
      </div>

      {/* อำเภอ */}
      <div>
        <label style={labelStyle}>อำเภอ / เขต *</label>
        <div className="thai-address-wrapper">
          <InputThaiAddress.Amphoe
            value={form.district}
            onChange={(v: string) => setForm(f => ({ ...f, district: v }))}
            onSelect={handleSelect}
            placeholder="พิมพ์ชื่ออำเภอ/เขต"
          />
        </div>
      </div>

      {/* จังหวัด + รหัสไปรษณีย์ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>จังหวัด *</label>
          <div className="thai-address-wrapper">
            <InputThaiAddress.Province
              value={form.province}
              onChange={(v: string) => setForm(f => ({ ...f, province: v }))}
              onSelect={handleSelect}
              placeholder="จังหวัด"
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>รหัสไปรษณีย์</label>
          <div className="thai-address-wrapper">
            <InputThaiAddress.Zipcode
              value={form.zip}
              onChange={(v: string) => setForm(f => ({ ...f, zip: v }))}
              onSelect={handleSelect}
              placeholder="รหัสไปรษณีย์"
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

      {error && <p style={{ color: '#D64B2A', fontSize: 12, fontFamily: 'monospace' }}>{error}</p>}

      {/* ปุ่ม */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#D64B2A', color: '#EDE8DF', fontWeight: 900,
            fontSize: 13, fontFamily: 'var(--font-display)', textTransform: 'uppercase',
            opacity: loading ? 0.5 : 1,
          }}>
          {loading ? 'กำลังบันทึก...' : '✓ บันทึกที่อยู่'}
        </button>
        {onCancel && (
          <button onClick={onCancel}
            style={{
              padding: '12px 16px', borderRadius: 12, border: '2px solid #D8D0C5',
              background: 'transparent', color: '#8C7B6E', cursor: 'pointer', fontSize: 13,
            }}>
            ยกเลิก
          </button>
        )}
      </div>

      <style>{`
        .thai-address-wrapper input {
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
        .thai-address-wrapper ul {
          border-radius: 12px !important;
          border: 2px solid #E0D9CE !important;
          background: #F5F1EB !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
          z-index: 50 !important;
        }
        .thai-address-wrapper li {
          padding: 8px 14px !important;
          font-size: 13px !important;
          color: #3D1F0F !important;
          cursor: pointer !important;
        }
        .thai-address-wrapper li:hover {
          background: #EDE8DF !important;
        }
      `}</style>
    </div>
  )
}
