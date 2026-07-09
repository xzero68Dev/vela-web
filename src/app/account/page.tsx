'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import VelaBunny from '@/components/VelaBunny'
import LineLoginButton from '@/components/LineLoginButton'
import AddressList from '@/components/AddressList'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const API    = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'

const STATUS_COLOR: Record<string, string> = {
  accepted: '#8C7B6E', in_transit: '#8B5E00', out_for_delivery: '#1A5C8F',
  delivered: '#1A6B3C', returned: '#D64B2A', problem: '#D64B2A', pending: '#C5BAB0',
}

function PhoneLoginForm() {
  const { setUser } = useAuth()
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
  const [step,    setStep]    = useState<'phone' | 'otp'>('phone')
  const [phone,   setPhone]   = useState('')
  const [name,    setName]    = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [timer,   setTimer]   = useState(0)

  // นับถอยหลัง resend
  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const requestOTP = async () => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 9) { setError('กรุณาใส่เบอร์โทรให้ถูกต้อง'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'ส่ง OTP ไม่สำเร็จ')
      setStep('otp')
      setTimer(60)
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) { setError('กรุณาใส่ OTP 6 หลัก'); return }
    setLoading(true); setError('')
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp, name: name || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'OTP ไม่ถูกต้อง')
      localStorage.setItem('vela_user', JSON.stringify(data.customer))
      window.dispatchEvent(new StorageEvent('storage', { key: 'vela_user' }))
      setUser(data.customer)
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  if (step === 'phone') return (
    <div className="space-y-3">
      <input value={phone} onChange={e => setPhone(e.target.value)}
        placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
        type="tel" inputMode="numeric"
        className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono"
        style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="ชื่อ (ถ้าเป็นสมาชิกใหม่)"
        className="w-full px-4 py-3 rounded-2xl border-2 text-sm"
        style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F' }} />
      {error && <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
      <button onClick={requestOTP} disabled={loading}
        className="w-full py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
        style={{ fontFamily: 'var(--font-display)', background: '#3D1F0F', color: '#EDE8DF' }}>
        {loading ? 'กำลังส่ง OTP...' : 'รับรหัส OTP ทาง SMS'}
      </button>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-xs text-center font-mono" style={{ color: '#8C7B6E' }}>
        ส่ง OTP ไปยัง {phone} แล้วครับ
      </p>
      <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
        placeholder="รหัส OTP 6 หลัก"
        type="tel" inputMode="numeric" maxLength={6}
        className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono text-center tracking-widest"
        style={{ borderColor: '#D8D0C5', background: '#F5F1EB', color: '#3D1F0F', fontSize: '22px' }} />
      {error && <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>{error}</p>}
      <button onClick={verifyOTP} disabled={loading}
        className="w-full py-3 rounded-2xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
        style={{ fontFamily: 'var(--font-display)', background: '#3D1F0F', color: '#EDE8DF' }}>
        {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน OTP'}
      </button>
      <div className="flex justify-between items-center">
        <button onClick={() => { setStep('phone'); setOtp(''); setError('') }}
          className="text-xs font-mono" style={{ color: '#C5BAB0' }}>
          ← แก้ไขเบอร์
        </button>
        {timer > 0
          ? <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>ส่งใหม่ได้ใน {timer}s</p>
          : <button onClick={requestOTP} disabled={loading}
              className="text-xs font-mono" style={{ color: '#D64B2A' }}>
              ส่ง OTP ใหม่
            </button>
        }
      </div>
    </div>
  )
}

function SlipUploadInline({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const API    = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [verified,  setVerified]  = useState<'success' | 'pending' | 'error' | null>(null)
  const [reason,    setReason]    = useState('')

  const handleUpload = async (e: { target: HTMLInputElement }) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    setUploading(true); setError(''); setVerified(null)
    try {
      // อัปโหลดรูปไป Supabase Storage
      const ext  = file.name.split('.').pop()
      const path = `${orderId}-${Date.now()}.${ext}`
      const upRes = await fetch(`${SB_URL}/storage/v1/object/slips/${path}`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': file.type },
        body: file,
      })
      if (!upRes.ok) throw new Error('อัปโหลดไม่สำเร็จ')
      const slip_url = `${SB_URL}/storage/v1/object/public/slips/${path}`

      // บันทึก slip_url ลง order
      await fetch(`${SB_URL}/rest/v1/orders?order_id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ slip_url }),
      })

      // เช็คสลิปผ่าน SlipOK
      const verRes = await fetch(`${API}/orders/slip-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, slip_url }),
      })
      const verData = await verRes.json()

      if (verData.verified) {
        setVerified('success')
        setTimeout(() => onDone(), 2000)
      } else {
        const r: string = verData.reason || ''
        if (r.includes('1014') || r.includes('ไม่ได้โอน')) {
          setVerified('error'); setReason('สลิปนี้ไม่ได้โอนเข้าบัญชีร้าน กรุณาตรวจสอบบัญชีปลายทางแล้วอัปโหลดใหม่ครับ')
        } else if (r.includes('1010') || r.includes('ซ้ำ')) {
          setVerified('error'); setReason('สลิปนี้เคยใช้ไปแล้ว กรุณาส่งสลิปใบใหม่ครับ')
        } else if (r.includes('1013') || r.includes('ยอด')) {
          setVerified('error'); setReason('ยอดเงินในสลิปไม่ตรง กรุณาตรวจสอบแล้วอัปโหลดใหม่ครับ')
        } else {
          setVerified('pending'); setReason('ทีมงานจะตรวจสอบและยืนยันภายใน 24 ชั่วโมงครับ')
        }
        onDone()
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally { setUploading(false) }
  }

  // แสดง success state
  if (verified === 'success') return (
    <div className="mt-3 rounded-2xl p-4 text-center" style={{ background: '#C5E8D5', border: '2px solid #1A6B3C' }}>
      <p className="text-2xl mb-1">✅</p>
      <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: '#1A6B3C' }}>
        ยืนยันการชำระเงินสำเร็จ!
      </p>
      <p className="text-xs font-mono mt-1" style={{ color: '#1A6B3C' }}>ระบบตรวจสอบยอดเงินเรียบร้อยแล้วครับ</p>
    </div>
  )

  if (verified === 'error') return (
    <div className="mt-3 rounded-2xl border-2 p-4 text-center" style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
      <p className="text-2xl mb-1">⚠️</p>
      <p className="font-black text-sm mb-1" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>สลิปไม่ถูกต้อง</p>
      <p className="text-xs font-mono mb-3" style={{ color: '#D64B2A' }}>{reason}</p>
      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 cursor-pointer text-xs font-mono"
        style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        {uploading ? '🔄 กำลังตรวจสอบ...' : '📎 อัปโหลดสลิปใหม่'}
      </label>
    </div>
  )

  if (verified === 'pending') return (
    <div className="mt-3 rounded-2xl border-2 p-4 text-center" style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
      <p className="text-2xl mb-1">⏳</p>
      <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>ส่งสลิปแล้ว รอทีมงานตรวจสอบ</p>
      <p className="text-xs font-mono mt-1" style={{ color: '#854F0B' }}>{reason || 'ทีมงานจะยืนยันภายใน 24 ชั่วโมงครับ'}</p>
    </div>
  )

  return (
    <div className="mt-2">
      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 cursor-pointer text-xs font-mono transition-all active:scale-95"
        style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        {uploading ? '🔄 กำลังตรวจสอบ...' : '📎 แนบสลิปการโอน'}
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
  const [myRank,      setMyRank]      = useState<{ rank: number; points: number } | null>(null)
  const [rankMonth,   setRankMonth]   = useState('')
  const [totalPoints, setTotalPoints] = useState<number | null>(null)
  const [addresses, setAddresses] = useState<any[]>([])

  const SB_URL_ACC = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SB_KEY_ACC = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const fetchAddresses = useCallback(async () => {
    if (!user?.phone) return
    const res = await fetch(`${SB_URL_ACC}/rest/v1/addresses?phone=eq.${user.phone}&order=is_default.desc,id.desc`,
      { headers: { apikey: SB_KEY_ACC, Authorization: `Bearer ${SB_KEY_ACC}` } })
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      setAddresses(data)
      return
    }
    // ถ้าไม่มีที่อยู่ — ดึงจาก order ล่าสุดมาสร้างให้อัตโนมัติ
    const ordRes = await fetch(
      `${SB_URL_ACC}/rest/v1/orders?phone=eq.${user.phone}&order=created_at.desc&limit=1&select=customer,phone,full_address,province,zip`,
      { headers: { apikey: SB_KEY_ACC, Authorization: `Bearer ${SB_KEY_ACC}` } })
    const orders = await ordRes.json()
    if (Array.isArray(orders) && orders.length > 0) {
      const o = orders[0]
      if (o.full_address && o.province) {
        await fetch(`${SB_URL_ACC}/rest/v1/addresses`, {
          method: 'POST',
          headers: { apikey: SB_KEY_ACC, Authorization: `Bearer ${SB_KEY_ACC}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            phone:        user.phone,
            name:         o.customer || user.display_name || '',
            full_address: o.full_address,
            province:     o.province,
            zip:          o.zip || '',
            is_default:   true,
          }),
        })
        // โหลดใหม่
        const res2 = await fetch(`${SB_URL_ACC}/rest/v1/addresses?phone=eq.${user.phone}&order=is_default.desc,id.desc`,
          { headers: { apikey: SB_KEY_ACC, Authorization: `Bearer ${SB_KEY_ACC}` } })
        const data2 = await res2.json()
        if (Array.isArray(data2)) setAddresses(data2)
      }
    }
  }, [user?.phone])

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
    fetch(`${SB_URL}/rest/v1/orders?phone=eq.${user.phone}&order=order_date.desc&limit=20&select=order_id,order_date,sku,qty,total,status,province,slip_url,slip_status,paid_at`,
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
  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  // โหลด rank ส่วนตัวประจำเดือนนี้
  useEffect(() => {
    if (!user?.phone) return
    fetch(`${API}/leaderboard?limit=0&phone=${user.phone}`)
      .then(r => r.json())
      .then(data => {
        setMyRank(data.me || null)
        setRankMonth(data.month || '')
        if (typeof data.total_points_all_time === 'number') {
          setTotalPoints(data.total_points_all_time)
        }
      })
      .catch(() => {})
  }, [user?.phone])

  const [nameError, setNameError] = useState('')

  const handleSave = async () => {
    setNameError('')
    const newName = form.name.trim()

    // เช็คชื่อซ้ำก่อน save (ถ้ามีการเปลี่ยนชื่อ)
    if (newName && newName !== (user?.name || '').trim()) {
      const SB_URL_CHK = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const SB_KEY_CHK = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      const res = await fetch(
        `${SB_URL_CHK}/rest/v1/customers?name=eq.${encodeURIComponent(newName)}&select=id`,
        { headers: { apikey: SB_KEY_CHK, Authorization: `Bearer ${SB_KEY_CHK}` } }
      )
      const existing = await res.json()
      if (Array.isArray(existing) && existing.length > 0) {
        setNameError('ชื่อนี้มีคนใช้แล้ว กรุณาตั้งชื่ออื่นครับ')
        return
      }
    }

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
        {(myRank || totalPoints !== null) && (
          <Link href="/leaderboard"
            className="block rounded-2xl border-2 px-5 py-4 mb-5 transition-all hover:shadow-sm active:scale-[0.99]"
            style={{ background: '#F5E6C0', borderColor: '#D4890A30' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono" style={{ color: '#854F0B' }}>
                  🏆 อันดับของคุณเดือนนี้
                </p>
                <p className="font-black text-lg leading-none mt-0.5" style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>
                  {myRank ? `อันดับ #${myRank.rank}` : 'ยังไม่มีอันดับ'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl leading-none" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                  {myRank?.points ?? 0}
                </p>
                <p className="text-xs font-mono" style={{ color: '#854F0B' }}>point เดือนนี้</p>
              </div>
            </div>
            {/* point สะสมทั้งหมด */}
            {totalPoints !== null && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#D4890A30' }}>
                <p className="text-xs font-mono" style={{ color: '#854F0B' }}>⭐ point สะสมทั้งหมด</p>
                <p className="font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: '#854F0B' }}>
                  {totalPoints} point
                </p>
              </div>
            )}
          </Link>
        )}

          {/* Tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
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

                      {/* สถานะสลิป */}
                      {o.slip_status === 'rejected' && o.status === 'รอชำระเงิน' && (
                        <div className="mt-2 rounded-xl px-3 py-2" style={{ background: '#FFF5F3', border: '1px solid #D64B2A' }}>
                          <p className="text-xs font-mono" style={{ color: '#D64B2A' }}>
                            ⚠️ สลิปไม่ถูกต้อง กรุณาอัปโหลดสลิปใหม่ครับ
                          </p>
                        </div>
                      )}
                      {o.slip_status === 'pending' && o.status === 'รอชำระเงิน' && (
                        <div className="mt-2 rounded-xl px-3 py-2" style={{ background: '#F5E6C0' }}>
                          <p className="text-xs font-mono" style={{ color: '#854F0B' }}>
                            ⏳ สลิปอยู่ระหว่างตรวจสอบ
                          </p>
                        </div>
                      )}

                      {/* สลิปที่อัปโหลดแล้ว */}
                      {o.slip_url && o.status !== 'รอชำระเงิน' && (
                        <div className="mt-2">
                          <a href={o.slip_url} target="_blank" rel="noopener noreferrer">
                            <img src={o.slip_url} alt="slip" className="h-16 w-auto rounded-xl border-2 object-cover"
                              style={{ borderColor: '#E0D9CE' }} />
                          </a>
                          <p className="text-xs font-mono mt-1" style={{ color: '#1A6B3C' }}>✓ ส่งสลิปแล้ว</p>
                        </div>
                      )}

                      {/* ปุ่มอัปโหลดสลิป — order รอชำระ (มีหรือไม่มีสลิปก็อัปโหลดใหม่ได้) */}
                      {o.status === 'รอชำระเงิน' && (
                        <div className="mt-3 space-y-3">
                          {/* แสดงสลิปเดิมถ้ามี พร้อมปุ่มอัปโหลดใหม่ */}
                          {o.slip_url && (
                            <div className="flex items-center gap-2">
                              <a href={o.slip_url} target="_blank" rel="noopener noreferrer">
                                <img src={o.slip_url} alt="slip" className="h-12 w-auto rounded-xl border-2 object-cover"
                                  style={{ borderColor: '#E0D9CE' }} />
                              </a>
                              <p className="text-xs font-mono" style={{ color: '#C5BAB0' }}>สลิปที่ส่งแล้ว (กดอัปโหลดใหม่ได้ถ้าผิด)</p>
                            </div>
                          )}
                          {/* QR PromptPay */}
                          <div className="rounded-2xl border-2 p-3 flex flex-col items-center"
                            style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                            <p className="text-xs font-mono mb-2" style={{ color: '#C5BAB0' }}>ชำระผ่าน PromptPay</p>
                            <img src="/promptpay-qr.jpg" alt="PromptPay QR"
                              className="w-36 h-36 object-contain rounded-xl" />
                            <a href="/promptpay-qr.jpg" download="VeLA-PromptPay-QR.jpg"
                              className="text-xs font-mono px-3 py-1.5 rounded-xl border-2 mt-2 transition-all active:scale-95"
                              style={{ borderColor: '#D64B2A', color: '#D64B2A', background: '#FFF5F3' }}>
                              ⬇️ บันทึก QR
                            </a>
                            {o.total > 0 && (
                              <p className="font-black text-lg mt-2" style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
                                ฿{Number(o.total).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <SlipUploadInline orderId={o.order_id} onDone={() => fetchOrders()} />
                        </div>
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
          <div className="space-y-4">

            {/* ที่อยู่หลัก — แสดงอันเดียว */}
            {(() => {
              const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
              return defaultAddr ? (
                <div className="rounded-2xl border-2 p-4" style={{ background: '#FFF5F3', borderColor: '#D64B2A' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ background: '#D64B2A', color: '#EDE8DF' }}>ที่อยู่หลัก</span>
                  </div>
                  <p className="font-black text-sm mb-0.5" style={{ color: '#3D1F0F' }}>{defaultAddr.name}</p>
                  <p className="text-xs font-mono mb-1" style={{ color: '#8C7B6E' }}>{defaultAddr.phone}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#8C7B6E' }}>
                    {[defaultAddr.full_address, defaultAddr.subdistrict, defaultAddr.district, defaultAddr.province, defaultAddr.zip].filter(Boolean).join(' ')}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border-2 p-4 text-center" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
                  <p className="text-sm font-mono" style={{ color: '#C5BAB0' }}>ยังไม่มีที่อยู่จัดส่ง</p>
                </div>
              )
            })()}

            {/* จัดการที่อยู่ทั้งหมด */}
            <div className="rounded-2xl border-2 overflow-hidden" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <div className="px-4 py-3 border-b-2" style={{ borderColor: '#E0D9CE' }}>
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#C5BAB0' }}>
                  ที่อยู่ทั้งหมด ({addresses.length}/3)
                </p>
              </div>
              <div className="p-4">
                <AddressList
                  addresses={addresses}
                  phone={user?.phone || ''}
                  customerId={user?.id}
                  mode="manage"
                  onRefresh={fetchAddresses}
                />
              </div>
            </div>

            {/* ชื่อที่แสดงใน Ranking */}
            <div className="rounded-2xl border-2 p-4" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#C5BAB0' }}>ชื่อที่แสดงใน Ranking 🏆</p>
              <div className="flex gap-2">
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={user?.display_name || 'ชื่อที่แสดงในอันดับ'}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ background: '#EDE8DF', borderColor: '#D8D0C5', color: '#3D1F0F' }}
                />
              </div>
              <p className="text-xs mt-2 font-mono" style={{ color: '#C5BAB0' }}>ชื่อนี้จะแสดงในหน้า Leaderboard เท่านั้น ไม่ใช่ชื่อผู้รับพัสดุ</p>
              {nameError && (
                <p className="text-xs mt-1 font-mono" style={{ color: '#D64B2A' }}>⚠️ {nameError}</p>
              )}
            </div>

            {/* ช่องทางแจ้งเตือน */}
            <div className="rounded-2xl border-2 p-4" style={{ background: '#F5F1EB', borderColor: '#E0D9CE' }}>
              <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#C5BAB0' }}>ช่องทางแจ้งเตือนสถานะพัสดุ</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { value: 'sms',  label: 'SMS',    icon: '📱', desc: 'รับ SMS' },
                  { value: 'line', label: 'LINE',   icon: '💬', desc: 'รับผ่าน LINE' },
                  { value: 'none', label: 'ไม่รับ', icon: '🔕', desc: 'เช็คเอง' },
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
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 rounded-xl font-black uppercase text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ fontFamily: 'var(--font-display)', background: saved ? '#1A6B3C' : '#3D1F0F', color: '#EDE8DF' }}>
                {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
