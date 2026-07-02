'use client'
import { useState } from 'react'
import AddressForm, { AddressData } from './AddressForm'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface Props {
  addresses:   AddressData[]
  selectedId?: number
  phone?:      string
  customerId?: number
  onSelect?:   (addr: AddressData) => void
  onRefresh:   () => void
  mode?:       'manage' | 'select'  // manage=หน้า account, select=หน้า checkout
}

export default function AddressList({ addresses, selectedId, phone, customerId, onSelect, onRefresh, mode = 'manage' }: Props) {
  const [editing,  setEditing]  = useState<AddressData | null>(null)
  const [adding,   setAdding]   = useState(false)
  const [saving,   setSaving]   = useState(false)

  const formatAddr = (a: AddressData) =>
    [a.full_address, a.subdistrict, a.district, a.province, a.zip].filter(Boolean).join(' ')

  const saveAddress = async (data: AddressData) => {
    setSaving(true)
    try {
      if (data.is_default) {
        // ยกเลิก default เดิมก่อน
        await fetch(`${SB_URL}/rest/v1/addresses?phone=eq.${phone}`, {
          method: 'PATCH',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ is_default: false }),
        })
      }

      if (data.id) {
        // แก้ไขที่มีอยู่
        await fetch(`${SB_URL}/rest/v1/addresses?id=eq.${data.id}`, {
          method: 'PATCH',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ ...data, id: undefined }),
        })
      } else {
        // เพิ่มใหม่
        await fetch(`${SB_URL}/rest/v1/addresses`, {
          method: 'POST',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ ...data, phone, customer_id: customerId }),
        })
      }
      setEditing(null)
      setAdding(false)
      onRefresh()
    } catch {
    } finally { setSaving(false) }
  }

  const deleteAddress = async (id: number) => {
    if (!confirm('ลบที่อยู่นี้ออกไหมครับ?')) return
    await fetch(`${SB_URL}/rest/v1/addresses?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    })
    onRefresh()
  }

  if (adding) return (
    <div className="rounded-3xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
      <p className="font-black text-sm uppercase mb-4" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
        เพิ่มที่อยู่ใหม่
      </p>
      <AddressForm onSave={saveAddress} onCancel={() => setAdding(false)} loading={saving} />
    </div>
  )

  if (editing) return (
    <div className="rounded-3xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
      <p className="font-black text-sm uppercase mb-4" style={{ fontFamily: 'var(--font-display)', color: '#1A5C8F' }}>
        แก้ไขที่อยู่
      </p>
      <AddressForm initial={editing} onSave={saveAddress} onCancel={() => setEditing(null)} loading={saving} />
    </div>
  )

  return (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <p className="text-sm text-center py-4 font-mono" style={{ color: '#C5BAB0' }}>
          ยังไม่มีที่อยู่ กดเพิ่มด้านล่างได้เลยครับ
        </p>
      )}

      {addresses.map(a => (
        <div key={a.id}
          onClick={() => onSelect?.(a)}
          className="rounded-2xl border-2 p-4 transition-all"
          style={{
            background: selectedId === a.id ? '#D64B2A10' : '#F5F1EB',
            borderColor: selectedId === a.id ? '#D64B2A' : '#E0D9CE',
            cursor: mode === 'select' ? 'pointer' : 'default',
          }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-sm" style={{ color: '#3D1F0F' }}>{a.name}</p>
                <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{a.phone}</p>
                {a.is_default && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: '#D64B2A20', color: '#D64B2A' }}>หลัก</span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#8C7B6E' }}>
                {formatAddr(a)}
              </p>
            </div>

            {mode === 'manage' && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditing(a)}
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                  แก้
                </button>
                <button onClick={() => deleteAddress(a.id!)}
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{ borderColor: '#D64B2A30', color: '#D64B2A' }}>
                  ลบ
                </button>
              </div>
            )}

            {mode === 'select' && selectedId === a.id && (
              <span className="text-lg">✓</span>
            )}
          </div>
        </div>
      ))}

      <button onClick={() => setAdding(true)}
        className="w-full py-2.5 rounded-2xl border-2 text-sm font-mono transition-all active:scale-95"
        style={{ borderColor: '#D8D0C5', color: '#8C7B6E', background: 'transparent', borderStyle: 'dashed' }}>
        + เพิ่มที่อยู่ใหม่
      </button>
    </div>
  )
}
