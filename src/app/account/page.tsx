'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API    = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

type Order = {
  order_id: string; order_date: string; ship_date: string
  sku: string; qty: number; status: string; channel: string
}

type Shipment = {
  barcode: string; status: string; status_th: string
  latest_location: string; latest_datetime: string; is_done: boolean
}

const STATUS_COLOR: Record<string, string> = {
  accepted: '#8C7B6E', in_transit: '#8B5E00', out_for_delivery: '#1A5C8F',
  delivered: '#1A6B3C', returned: '#D64B2A', problem: '#D64B2A', pending: '#C5BAB0',
}

export default function AccountPage() {
  const { user, login, logout, savePhone } = useAuth()
  const [orders,    setOrders]    = useState<Order[]>([])
  const [shipments, setShipments] = useState<Record<string, Shipment>>({})
  const [loading,   setLoading]   = useState(false)
  const [editPhone, setEditPhone] = useState(false)
  const [newPhone,  setNewPhone]  = useState('')
  const [editAddr,  setEditAddr]  = useState(false)
  const [address,   setAddress]   = useState({ name: '', addr: '', province: '', zip: '' })
  const [tab,       setTab]       = useState<'orders' | 'profile'>('orders')

  // โหลด address จาก localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vela_address')
      if (saved) setAddress(JSON.parse(saved))
    } catch {}
  }, [])

  // โหลด orders เมื่อมี user + phone
  useEffect(() => {
    if (!user?.phone) return
    setLoading(true)
    fetch(`${SB_URL}/rest/v1/orders?phone=eq.${user.phone}&order=order_date.desc&limit=20`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    })
      .then(r => r.json())
      .then(async (data: Order[]) => {
        setOrders(Array.isArray(data) ? data : [])
        // ดึง shipment สำหรับแต่ละ order
        if (data.length > 0) {
          const orderIds = data.map(o => o.order_id)
          const res = await fetch(`${SB_URL}/rest/v1/shipping?order_id=in.(${orderIds.join(',')})&select=order_id,tracking`,
            { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
          const shippingData = await res.json()
          if (Array.isArray(shippingData) && shippingData.length > 0) {
            const trackings = shippingData.map((s: any) => s.tracking).filter(Boolean)
            if (trackings.length > 0) {
              const trackRes = await fetch(`${API}/track/bulk`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcodes: trackings })
              })
              const trackData = await trackRes.json()
              const map: Record<string, Shipment> = {}
              // map tracking → order_id
              shippingData.forEach((s: any) => {
                const t = trackData.results?.find((r: any) => r.barcode === s.tracking)
                if (t) map[s.order_id] = t
              })
              setShipments(map)
            }
          }
        }
      })
      .finally(() => setLoading(false))
  }, [user?.phone])

  const handleSavePhone = () => {
    if (!newPhone || newPhone.length < 9) return
    const p = newPhone.startsWith('0') ? newPhone : '0' + newPhone
    savePhone(p)
    setEditPhone(false)
    setNewPhone('')
  }

  const handleSaveAddress = () => {
    localStorage.setItem('vela_address', JSON.stringify(address))
    setEditAddr(false)
  }

  // ยังไม่ login
  if (!user) return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: '#EDE8DF' }}>
      <div className="text-center">
        <VelaBunny size={56} className="mx-auto mb-4 opacity-40" />
        <h1 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
          บัญชีของฉัน
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8C7B6E' }}>Login ด้วย LINE เพื่อดูประวัติสั่งซื้อ</p>
        <LineLoginButton />
        <div className="mt-4">
          <Link href="/" className="text-xs font-mono" style={{ color: '#C5BAB0' }}>← กลับหน้าร้าน</Link>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ background: '#EDE8DF' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xs font-mono opacity-60 hover:opacity-100" style={{ color: '#8C7B6E' }}>← ร้านค้า</Link>
          <button onClick={logout} className="text-xs font-mono px-3 py-1.5 rounded-xl border-2" style={{ color: '#C5BAB0', borderColor: '#D8D0C5' }}>
            ออกจากระบบ
          </button>
        </div>

        {/* Profile card */}
        <div className="rounded-3xl border-2 p-5 mb-5 flex items-center gap-4" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          {user.pictureUrl
            ? <img src={user.pictureUrl} alt={user.displayName} className="w-16 h-16 rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: '#D64B2A' }} />
            : <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D64B2A20' }}><VelaBunny size={32} /></div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>{user.displayName}</p>
            <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>LINE Member</p>
            {user.phone
              ? <p className="text-sm font-mono mt-0.5" style={{ color: '#3D1F0F' }}>{user.phone}</p>
              : <button onClick={() => setEditPhone(true)} className="text-xs mt-1 font-mono" style={{ color: '#D64B2A' }}>+ ใส่เบอร์โทร</button>
            }
          </div>
          <button onClick={() => setTab('profile')} className="text-xs font-mono px-3 py-1.5 rounded-xl border-2" style={{ borderColor: '#D8D0C5', color: '#8C7B6E' }}>แก้ไข</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(['orders', 'profile'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl border-2 text-xs font-mono uppercase tracking-wider transition-all"
              style={tab === t
                ? { background: '#D64B2A', color: '#EDE8DF', borderColor: '#D64B2A' }
                : { background: 'transparent', color: '#8C7B6E', borderColor: '#D8D0C5' }}>
              {t === 'orders' ? 'ประวัติสั่งซื้อ' : 'ข้อมูลส่วนตัว'}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            {!user.phone ? (
              <div className="rounded-2xl border-2 px-5 py-8 text-center" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
                <p className="text-sm mb-3" style={{ color: '#8C7B6E' }}>ใส่เบอร์โทรเพื่อดูประวัติสั่งซื้อ</p>
                <button onClick={() => setTab('profile')}
                  className="px-5 py-2 rounded-xl font-black uppercase text-xs"
                  style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                  ใส่เบอร์โทร
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border-2 px-5 py-8 text-center" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
                <VelaBunny size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm" style={{ color: '#C5BAB0' }}>ยังไม่มีประวัติสั่งซื้อ</p>
                <Link href="/" className="mt-3 inline-block text-xs font-black uppercase px-4 py-2 rounded-xl"
                  style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                  เริ่มช้อปปิ้ง
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => {
                  const ship = shipments[o.order_id]
                  return (
                    <div key={o.order_id} className="rounded-2xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
                      <div className="px-5 py-3 flex items-center justify-between border-b-2" style={{ borderColor: '#E0D9CE' }}>
                        <div>
                          <p className="text-xs font-mono font-bold" style={{ color: '#3D1F0F' }}>{o.order_id}</p>
                          <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{o.order_date} · {o.channel}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full font-mono"
                          style={{ background: o.status === 'จัดส่งแล้ว' ? '#1A6B3C20' : '#8C7B6E20', color: o.status === 'จัดส่งแล้ว' ? '#1A6B3C' : '#8C7B6E' }}>
                          {o.status}
                        </span>
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-sm" style={{ color: '#3D1F0F' }}>{o.sku}</p>
                        {ship && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                              style={{ background: (STATUS_COLOR[ship.status] || '#8C7B6E') + '20', color: STATUS_COLOR[ship.status] || '#8C7B6E' }}>
                              {ship.status_th || ship.status}
                            </span>
                            {ship.latest_location && (
                              <span className="text-xs font-mono" style={{ color: '#8C7B6E' }}>{ship.latest_location}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="space-y-4">

            {/* Phone */}
            <div className="rounded-2xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>เบอร์โทรศัพท์</h3>
                <button onClick={() => setEditPhone(!editPhone)} className="text-xs font-mono" style={{ color: '#D64B2A' }}>
                  {editPhone ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              </div>
              {editPhone ? (
                <div className="flex gap-2">
                  <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                    placeholder={user.phone || '0812345678'} maxLength={10}
                    className="flex-1 px-4 py-2 rounded-xl border-2 text-sm font-mono focus:outline-none"
                    style={{ background: '#EDE8DF', borderColor: '#D8D0C5', color: '#3D1F0F' }} />
                  <button onClick={handleSavePhone}
                    className="px-4 py-2 rounded-xl font-black text-xs uppercase"
                    style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>บันทึก</button>
                </div>
              ) : (
                <p className="font-mono text-sm" style={{ color: user.phone ? '#3D1F0F' : '#C5BAB0' }}>
                  {user.phone || 'ยังไม่ได้ใส่เบอร์โทร'}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="rounded-2xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-sm uppercase" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>ที่อยู่จัดส่ง</h3>
                <button onClick={() => setEditAddr(!editAddr)} className="text-xs font-mono" style={{ color: '#D64B2A' }}>
                  {editAddr ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              </div>
              {editAddr ? (
                <div className="space-y-2">
                  {[
                    { key: 'name',     label: 'ชื่อ-นามสกุล',    placeholder: 'สมชาย ใจดี' },
                    { key: 'addr',     label: 'ที่อยู่',          placeholder: 'บ้านเลขที่ ถนน ซอย' },
                    { key: 'province', label: 'จังหวัด',          placeholder: 'กรุงเทพมหานคร' },
                    { key: 'zip',      label: 'รหัสไปรษณีย์',    placeholder: '10100' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>{f.label}</label>
                      <input value={(address as any)[f.key]} onChange={e => setAddress(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-2 rounded-xl border-2 text-sm focus:outline-none"
                        style={{ background: '#EDE8DF', borderColor: '#D8D0C5', color: '#3D1F0F' }} />
                    </div>
                  ))}
                  <button onClick={handleSaveAddress}
                    className="w-full py-2.5 rounded-xl font-black uppercase text-sm mt-2"
                    style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>
                    บันทึกที่อยู่
                  </button>
                </div>
              ) : address.addr ? (
                <div className="text-sm leading-relaxed" style={{ color: '#3D1F0F' }}>
                  <p>{address.name}</p>
                  <p>{address.addr}</p>
                  <p>{address.province} {address.zip}</p>
                </div>
              ) : (
                <p className="text-sm font-mono" style={{ color: '#C5BAB0' }}>ยังไม่ได้บันทึกที่อยู่</p>
              )}
            </div>

            {/* LINE info */}
            <div className="rounded-2xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
              <h3 className="font-black text-sm uppercase mb-3" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>ข้อมูล LINE</h3>
              <div className="flex items-center gap-3">
                {user.pictureUrl && <img src={user.pictureUrl} alt="" className="w-10 h-10 rounded-full" />}
                <div>
                  <p className="text-sm font-medium" style={{ color: '#3D1F0F' }}>{user.displayName}</p>
                  <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>เชื่อมต่อแล้ว ✓</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
