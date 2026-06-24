'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API    = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

const STATUS_COLOR: Record<string, string> = {
  accepted: '#8C7B6E', in_transit: '#8B5E00', out_for_delivery: '#1A5C8F',
  delivered: '#1A6B3C', returned: '#D64B2A', problem: '#D64B2A', pending: '#C5BAB0',
}

function PhoneLoginForm() {
  const { setUser } = useAuth()
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const [phone,  setPhone]  = useState('')
  const [name,   setName]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 9) { setError('กรุณาใส่เบอร์โทรให้ถูกต้อง'); return }
    if (!name.trim()) { setError('กรุณาใส่ชื่อ'); return }
    setLoading(true); setError('')
    try {
      // เช็คว่ามีลูกค้าเบอร์นี้อยู่แล้วไหม
      const res = await fetch(`${SB_URL}/rest/v1/customers?phone=eq.${cleanPhone}`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      const existing = await res.json()
      let customer = existing?.[0] || null

      if (!customer) {
        // สร้างใหม่
        const createRes = await fetch(`${SB_URL}/rest/v1/customers`, {
          method: 'POST',
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ phone: cleanPhone, display_name: name.trim() }),
        })
        const created = await createRes.json()
        customer = Array.isArray(created) ? created[0] : created
      }

      if (customer) {
        localStorage.setItem('vela_user', JSON.stringify(customer))
        setUser(customer)
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="ชื่อ-นามสกุล"
        className="w-full px-4 py-3 rounded-2xl border-2 text-sm"
        style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
      <input value={phone} onChange={e => setPhone(e.target.value)}
        placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
        type="tel" inputMode="numeric"
        className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono"
        style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
      {error && <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
        style={{ fontFamily: 'var(--font-display)', background: '#3D1F0F', color: '#EDE8DF' }}>
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วยเบอร์โทร'}
      </button>
    </div>
  )
}

function SlipUploadInline({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  const handleUpload = async (e: { target: HTMLInputElement }) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const ext  = file.name.split('.').pop()
      const path = `${orderId}-${Date.now()}.${ext}`
      const upRes = await fetch(`${SB_URL}/storage/v1/object/slips/${path}`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': file.type },
        body: file,
      })
      if (!upRes.ok) throw new Error('อัปโหลดไม่สำเร็จ')
      const slip_url = `${SB_URL}/storage/v1/object/public/slips/${path}`
      await fetch(`${SB_URL}/rest/v1/orders?order_id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ slip_url }),
      })
      onDone()
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally { setUploading(false) }
  }

  return (
    <div className="mt-2">
      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 cursor-pointer text-xs font-mono transition-all active:scale-95"
        style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        {uploading ? 'กำลังอัปโหลด...' : '📎 แนบสลิปการโอน'}
      </label>
      {error && <p className="text-xs mt-1 font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
    </div>
  )
}

export default function AccountPage() {
  const { user, logout, updateProfile } = useAuth()
  const [orders,    setOrders]    = useState<any[]>([])
  const [shipments, setShipments] = useState<Record<string, any>>({})
  const [loading,   setLoading]   = useState(false)
  const [tab,       setTab]       = useState<'orders' | 'profile'>('orders')
  const [myRank,    setMyRank]    = useState<{ rank: number; points: number } | null>(null)
  const [rankMonth, setRankMonth] = useState('')

  // Form state
  const [form, setForm] = useState({ phone: '', name: '', address: '', province: '', zip: '', notify_channel: 'sms' })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // sync form กับ user
  useEffect(() => {
    if (user) {
      setForm({
        phone:    user.phone    || '',
        name:     user.name     || user.display_name || '',
        address:  user.address  || '',
        province: user.province || '',
        zip:      user.zip      || '',
        notify_channel: (user as any).notify_channel || 'sms',
      })
    }
  }, [user?.line_user_id])

  // โหลด orders
  const fetchOrders = useCallback(async () => {
    if (!user?.phone) return
    setLoading(true)
    fetch(`${SB_URL}/rest/v1/orders?phone=eq.${user.phone}&order=order_date.desc&limit=20`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      .then(r => r.json())
      .then(async (data: any[]) => {
        setOrders(Array.isArray(data) ? data : [])
        if (!data?.length) return
        // ดึง tracking
        const res = await fetch(`${SB_URL}/rest/v1/shipping?order_id=in.(${data.map(o => o.order_id).join(',')})&select=order_id,tracking`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
        const shipping = await res.json()
        if (!Array.isArray(shipping) || !shipping.length) return
        const trackings = shipping.map((s: any) => s.tracking).filter(Boolean)
        if (!trackings.length) return
        const trackRes = await fetch(`${API}/track/bulk`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes: trackings })
        })
        const trackData = await trackRes.json()
        const map: Record<string, any> = {}
        shipping.forEach((s: any) => {
          const t = trackData.results?.find((r: any) => r.barcode === s.tracking)
          if (t) map[s.order_id] = { ...t, tracking: s.tracking }
          else if (s.tracking) map[s.order_id] = { tracking: s.tracking }
        })
        setShipments(map)
      })
      .finally(() => setLoading(false))
  }, [user?.phone])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // โหลด rank ส่วนตัวประจำเดือนนี้
  useEffect(() => {
    if (!user?.phone) return
    fetch(`${API}/leaderboard?limit=0&phone=${user.phone}`)
      .then(r => r.json())
      .then(data => {
        setMyRank(data.me || null)
        setRankMonth(data.month || '')
      })
      .catch(() => {})
  }, [user?.phone])

  const handleSave = async () => {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: '#EDE8DF' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <VelaBunny size={56} className="mx-auto mb-4 opacity-30" />
          <h1 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>บัญชีของฉัน</h1>
          <p className="text-sm" style={{ color: '#8C7B6E' }}>เข้าสู่ระบบเพื่อดูประวัติสั่งซื้อ</p>
        </div>

        {/* LINE login */}
        <LineLoginButton />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#D8D0C5' }} />
          <span className="text-xs font-mono" style={{ color: '#C5BAB0' }}>หรือ</span>
          <div className="flex-1 h-px" style={{ background: '#D8D0C5' }} />
        </div>

        {/* Phone login */}
        <PhoneLoginForm />

        <div className="mt-6 text-center">
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
          <button onClick={logout} className="text-xs font-mono px-3 py-1.5 rounded-xl border-2" style={{ color: '#C5BAB0', borderColor: '#D8D0C5' }}>ออกจากระบบ</button>
        </div>

        {/* Profile card */}
        <div className="rounded-3xl border-2 p-5 mb-5 flex items-center gap-4" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
          {user.picture_url
            ? <img src={user.picture_url} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2" style={{ borderColor: '#D64B2A' }} />
            : <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#D64B2A20' }}><VelaBunny size={28} /></div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-black text-lg leading-none" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>{user.display_name}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#8C7B6E' }}>LINE Member ✓</p>
            {user.phone
              ? <p className="text-sm font-mono mt-1" style={{ color: '#3D1F0F' }}>{user.phone}</p>
              : <button onClick={() => setTab('profile')} className="text-xs mt-1" style={{ color: '#D64B2A' }}>+ ใส่เบอร์โทร</button>
            }
          </div>
        </div>

        {/* Personal rank card */}
        {myRank && (
          <Link href="/leaderboard"
            className="block rounded-2xl border-2 px-5 py-3 mb-5 flex items-center justify-between transition-all hover:shadow-sm active:scale-[0.99]"
            style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
            <div>
              <p className="text-xs font-mono" style={{ color: '#854F0B' }}>
                🏆 อันดับของคุณเดือนนี้
              </p>
              <p className="font-black text-lg leading-none mt-0.5" style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>
                อันดับ #{myRank.rank}
              </p>
            </div>
            <div className="text-right">
              <p className="font-black text-2xl leading-none" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                {myRank.points}
              </p>
              <p className="text-xs font-mono" style={{ color: '#854F0B' }}>point</p>
            </div>
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(['orders', 'profile'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl border-2 text-xs font-mono uppercase tracking-wider transition-all"
              style={tab === t
                ? { background: '#D64B2A', color: '#EDE8DF', borderColor: '#D64B2A' }
                : { background: 'transparent', color: '#8C7B6E', borderColor: '#D8D0C5' }}>
              {t === 'orders' ? `ประวัติสั่งซื้อ ${orders.length > 0 ? `(${orders.length})` : ''}` : 'ข้อมูลส่วนตัว'}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          !user.phone ? (
            <div className="rounded-2xl border-2 px-5 py-10 text-center" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
              <p className="text-sm mb-3" style={{ color: '#8C7B6E' }}>ใส่เบอร์โทรเพื่อดูประวัติสั่งซื้อ</p>
              <button onClick={() => setTab('profile')} className="px-5 py-2 rounded-xl font-black uppercase text-xs"
                style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>ใส่เบอร์โทร</button>
            </div>
          ) : loading ? (
            <div className="text-center py-10 text-xs font-mono" style={{ color: '#C5BAB0' }}>กำลังโหลด...</div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border-2 px-5 py-10 text-center" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
              <VelaBunny size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm mb-4" style={{ color: '#C5BAB0' }}>ยังไม่มีประวัติสั่งซื้อ</p>
              <Link href="/" className="inline-block px-5 py-2 rounded-xl font-black uppercase text-xs"
                style={{ fontFamily: 'var(--font-display)', background: '#D64B2A', color: '#EDE8DF' }}>เริ่มช้อปปิ้ง</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => {
                const ship = shipments[o.order_id]
                return (
                  <div key={o.order_id} className="rounded-2xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
                    <div className="px-5 py-3 border-b-2 flex items-center justify-between" style={{ borderColor: '#E0D9CE' }}>
                      <div>
                        <p className="text-xs font-mono font-bold" style={{ color: '#3D1F0F' }}>{o.order_id}</p>
                        <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>{o.order_date} · {o.channel || 'web'}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-mono"
                        style={{
                          background: o.status === 'ชำระแล้ว' || o.status === 'จัดส่งแล้ว' ? '#1A6B3C20'
                                    : o.status === 'รอชำระเงิน' ? '#F5E6C0'
                                    : '#E0D9CE',
                          color:      o.status === 'ชำระแล้ว' || o.status === 'จัดส่งแล้ว' ? '#1A6B3C'
                                    : o.status === 'รอชำระเงิน' ? '#854F0B'
                                    : '#8C7B6E'
                        }}>
                        {o.status}
                      </span>
                    </div>
                    <div className="px-5 py-3">
                      <p className="text-sm" style={{ color: '#3D1F0F' }}>{o.sku}</p>
                      {ship && (
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[ship.status] || '#8C7B6E' }} />
                          <span className="text-xs font-mono" style={{ color: STATUS_COLOR[ship.status] || '#8C7B6E' }}>
                            {ship.status_th || ship.status}
                          </span>
                          {ship.latest_location && (
                            <span className="text-xs font-mono" style={{ color: '#C5BAB0' }}>· {ship.latest_location}</span>
                          )}
                          {ship.tracking && (
                            <Link href={`/track/${ship.tracking}`}
                              className="text-xs font-mono px-2 py-0.5 rounded-lg border transition-all active:scale-95"
                              style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
                              ดูสถานะ →
                            </Link>
                          )}
                        </div>
                      )}

                      {/* สลิปที่อัปโหลดแล้ว */}
                      {o.slip_url && (
                        <div className="mt-2">
                          <a href={o.slip_url} target="_blank" rel="noopener noreferrer">
                            <img src={o.slip_url} alt="slip" className="h-16 w-auto rounded-xl border-2 object-cover"
                              style={{ borderColor: '#E0D9CE' }} />
                          </a>
                          <p className="text-xs font-mono mt-1" style={{ color: '#1A6B3C' }}>✓ ส่งสลิปแล้ว</p>
                        </div>
                      )}

                      {/* ปุ่มอัปโหลดสลิป — เฉพาะ order รอชำระและยังไม่มีสลิป */}
                      {o.status === 'รอชำระเงิน' && !o.slip_url && (
                        <SlipUploadInline orderId={o.order_id} onDone={() => fetchOrders()} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="rounded-2xl border-2 p-5" style={{ background: '#F5F1EB', borderColor: '#D8D0C5' }}>
            <h3 className="font-black text-sm uppercase mb-4" style={{ fontFamily: 'var(--font-display)', color: '#3D1F0F' }}>ข้อมูลส่วนตัว</h3>
            <div className="space-y-3">
              {[
                { key: 'name',     label: 'ชื่อ-นามสกุล',  placeholder: 'สมชาย ใจดี',      type: 'text' },
                { key: 'phone',    label: 'เบอร์โทรศัพท์', placeholder: '0812345678',       type: 'tel'  },
                { key: 'address',  label: 'ที่อยู่',        placeholder: 'บ้านเลขที่ ถนน ซอย', type: 'text' },
                { key: 'province', label: 'จังหวัด',        placeholder: 'กรุงเทพมหานคร',    type: 'text' },
                { key: 'zip',      label: 'รหัสไปรษณีย์',  placeholder: '10100',            type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-all"
                    style={{ background: '#EDE8DF', borderColor: '#D8D0C5', color: '#3D1F0F' }} />
                </div>
              ))}
              {/* ช่องทางแจ้งเตือน */}
              <div>
                <label className="block text-xs font-mono mb-2" style={{ color: '#8C7B6E' }}>ช่องทางแจ้งเตือนสถานะพัสดุ</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'sms',  label: 'SMS',         icon: '📱', desc: 'รับ SMS' },
                    { value: 'line', label: 'LINE',        icon: '💬', desc: 'รับผ่าน LINE' },
                    { value: 'none', label: 'ไม่รับ',      icon: '🔕', desc: 'เช็คเอง' },
                  ].map(opt => (
                    <button key={opt.value}
                      onClick={() => setForm(prev => ({ ...prev, notify_channel: opt.value }))}
                      className="py-3 px-2 rounded-xl border-2 text-center transition-all"
                      style={form.notify_channel === opt.value
                        ? { background: '#D64B2A', borderColor: '#D64B2A', color: '#EDE8DF' }
                        : { background: '#EDE8DF', borderColor: '#D8D0C5', color: '#8C7B6E' }}>
                      <div className="text-lg mb-0.5">{opt.icon}</div>
                      <div className="text-xs font-black uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '11px' }}>{opt.label}</div>
                      <div className="text-xs opacity-70" style={{ fontSize: '10px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {form.notify_channel === 'line' && !user?.phone && (
                  <p className="text-xs mt-1 font-mono" style={{ color: '#D64B2A' }}>⚠ ต้องใส่เบอร์โทรด้วย</p>
                )}
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 rounded-xl font-black uppercase text-sm mt-2 transition-all active:scale-95 disabled:opacity-50"
                style={{ fontFamily: 'var(--font-display)', background: saved ? '#1A6B3C' : '#D64B2A', color: '#EDE8DF' }}>
                {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : 'บันทึกข้อมูล'}
              </button>
              <p className="text-xs font-mono text-center" style={{ color: '#C5BAB0' }}>
                ข้อมูลจะถูกนำไปใช้ตอนสั่งซื้อโดยอัตโนมัติ
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
