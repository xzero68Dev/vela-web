'use client'
import { useState } from 'react'
import AddressForm, { AddressData } from './AddressForm'
import { authHeaders } from '@/lib/customerAuth'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

interface Props {
  addresses:   AddressData[]
  selectedId?: number
  phone?:      string
  customerId?: number
  onSelect?:   (addr: AddressData) => void
  onRefresh:   () => void
  mode?:       'manage' | 'select'
}

export default function AddressList({ addresses, selectedId, phone, customerId, onSelect, onRefresh, mode = 'manage' }: Props) {
  const [view,    setView]    = useState<'list' | 'add' | 'edit'>('list')
  const [editing, setEditing] = useState<AddressData | null>(null)
  const [saving,  setSaving]  = useState(false)

  const MAX = 3

  const formatAddr = (a: AddressData) =>
    [a.full_address, a.subdistrict, a.district, a.province, a.zip].filter(Boolean).join(' ')

  const saveAddress = async (data: AddressData) => {
    setSaving(true)
    try {
      const res = data.id
        ? await fetch(`${API}/addresses/${data.id}`, {
            method: 'PATCH', headers: authHeaders(JSON_HEADERS),
            body: JSON.stringify({ phone, name: data.name, full_address: data.full_address, subdistrict: data.subdistrict, district: data.district, province: data.province, zip: data.zip, is_default: data.is_default }),
          })
        : await fetch(`${API}/addresses`, {
            method: 'POST', headers: authHeaders(JSON_HEADERS),
            body: JSON.stringify({ ...data, phone, customer_id: customerId }),
          })
      if (!res.ok) {
        const detail = (await res.json().catch(() => ({})))?.detail || 'บันทึกที่อยู่ไม่สำเร็จ กรุณาลองใหม่'
        alert(detail)
        return   // ไม่ปิดฟอร์ม ให้ลูกค้าลองใหม่ได้
      }
      setView('list')
      setEditing(null)
      onRefresh()
    } catch {
      alert('บันทึกที่อยู่ไม่สำเร็จ กรุณาลองใหม่')
    } finally { setSaving(false) }
  }

  const setDefault = async (addr: AddressData) => {
    const res = await fetch(`${API}/addresses/${addr.id}`, {
      method: 'PATCH', headers: authHeaders(JSON_HEADERS),
      body: JSON.stringify({ phone, is_default: true }),
    }).catch(() => null)
    if (!res || !res.ok) { alert('ตั้งที่อยู่หลักไม่สำเร็จ กรุณาลองใหม่'); return }
    onRefresh()
  }

  const deleteAddress = async (id: number) => {
    if (!confirm('ลบที่อยู่นี้ออกไหมครับ?')) return
    const res = await fetch(`${API}/addresses/${id}?phone=${encodeURIComponent(phone || '')}`, { method: 'DELETE', headers: authHeaders() }).catch(() => null)
    if (!res || !res.ok) { alert('ลบที่อยู่ไม่สำเร็จ กรุณาลองใหม่'); return }
    onRefresh()
  }

  // — ADD form —
  if (view === 'add') return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setView('list')} style={{ color: '#8C7B6E', fontSize: 13 }}>← กลับ</button>
        <h3 className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>เพิ่มที่อยู่ใหม่</h3>
      </div>
      <AddressForm
        onSave={saveAddress}
        onCancel={() => setView('list')}
        loading={saving}
      />
    </div>
  )

  // — EDIT form —
  if (view === 'edit' && editing) return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => { setView('list'); setEditing(null) }} style={{ color: '#8C7B6E', fontSize: 13 }}>← กลับ</button>
        <h3 className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>แก้ไขที่อยู่</h3>
      </div>
      <AddressForm
        initial={editing}
        onSave={saveAddress}
        onCancel={() => { setView('list'); setEditing(null) }}
        loading={saving}
      />
    </div>
  )

  // — LIST view —
  return (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm font-mono mb-3" style={{ color: '#C5BAB0' }}>ยังไม่มีที่อยู่จัดส่ง</p>
        </div>
      )}

      {addresses.map(a => (
        <div key={a.id}
          onClick={() => mode === 'select' ? onSelect?.(a) : undefined}
          className="rounded-2xl border-2 p-4 transition-all"
          style={{
            background: selectedId === a.id || (mode === 'manage' && a.is_default) ? '#FFF5F3' : '#F5F1EB',
            borderColor: selectedId === a.id || (mode === 'manage' && a.is_default) ? '#D64B2A' : '#E0D9CE',
            cursor: mode === 'select' ? 'pointer' : 'default',
          }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-black text-sm" style={{ color: '#3D1F0F' }}>{a.name}</p>
                <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{a.phone}</p>
                {a.is_default && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: '#D64B2A', color: '#EDE8DF' }}>ที่อยู่หลัก</span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#8C7B6E' }}>{formatAddr(a)}</p>
            </div>

            {mode === 'manage' && (
              <div className="flex flex-col gap-1 flex-shrink-0 items-end">
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(a); setView('edit') }}
                    className="text-xs px-2.5 py-1 rounded-lg border transition-all active:scale-95"
                    style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                    แก้ไข
                  </button>
                  {!a.is_default && (
                    <button onClick={() => deleteAddress(a.id!)}
                      className="text-xs px-2.5 py-1 rounded-lg border transition-all active:scale-95"
                      style={{ borderColor: '#D64B2A30', color: '#D64B2A' }}>
                      ลบ
                    </button>
                  )}
                </div>
                {!a.is_default && (
                  <button onClick={() => setDefault(a)}
                    className="text-xs px-2.5 py-1 rounded-lg border transition-all active:scale-95"
                    style={{ borderColor: '#1A5C8F40', color: '#1A5C8F', fontSize: 11 }}>
                    ตั้งเป็นหลัก
                  </button>
                )}
              </div>
            )}

            {mode === 'select' && selectedId === a.id && (
              <span style={{ color: '#D64B2A', fontSize: 20 }}>✓</span>
            )}
          </div>
        </div>
      ))}

      {addresses.length < MAX && (
        <button onClick={() => setView('add')}
          className="w-full py-3 rounded-2xl border-2 text-sm font-mono transition-all active:scale-95"
          style={{ borderColor: '#D8D0C5', color: '#8C7B6E', background: 'transparent', borderStyle: 'dashed' }}>
          + เพิ่มที่อยู่ใหม่ ({addresses.length}/{MAX})
        </button>
      )}
    </div>
  )
}
