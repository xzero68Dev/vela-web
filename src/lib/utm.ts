// UTM tracking helper — เก็บ UTM parameters จาก URL ตอนลูกค้าเข้าเว็บ
// แล้วแนบไปกับ order ตอน checkout เพื่อรู้ว่าออเดอร์มาจากแคมเปญ/โฆษณาไหน
//
// โมเดล attribution: last-touch — ถ้า URL มี utm ใหม่จะทับค่าเดิม
// (ปรับเป็น first-touch ได้โดยไม่ทับถ้ามีค่าอยู่แล้ว — ดู comment ใน captureUtm)

export type Utm = {
  utm_source?:   string
  utm_medium?:   string
  utm_campaign?: string
  utm_content?:  string
  utm_term?:     string
  referrer?:     string
  landing_page?: string
  ref_code?:     string   // referral — โค้ดผู้แนะนำจาก ?ref=
}

const KEY = 'vela_utm'
const REF_KEY = 'vela_ref'                 // เก็บ ref_code แยก (อายุ 30 วัน)
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

// จับ ?ref= → เก็บ localStorage อายุ 30 วัน (last-click wins) + ยิงนับคลิก
// referral ห้ามทำให้ flow ขายพัง — ครอบ try/catch เงียบทั้งหมด
function captureRef(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const raw = (params.get('ref') || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)
    if (!raw || raw.length < 4) return
    const existing = getRefCode()
    localStorage.setItem(REF_KEY, JSON.stringify({ code: raw, exp: Date.now() + REF_TTL_MS }))
    // นับคลิกครั้งแรกที่เห็นโค้ดนี้ (กันนับซ้ำทุก reload ด้วยธงต่อ session)
    if (existing !== raw && !sessionStorage.getItem('vela_ref_tracked_' + raw)) {
      sessionStorage.setItem('vela_ref_tracked_' + raw, '1')
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://vela-tracking.onrender.com'
      fetch(`${API}/referral/track?code=${encodeURIComponent(raw)}`, { method: 'POST' }).catch(() => {})
    }
  } catch { /* เงียบ */ }
}

// อ่าน ref_code ที่ยังไม่หมดอายุ
export function getRefCode(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem(REF_KEY)
    if (!raw) return ''
    const o = JSON.parse(raw)
    if (o && o.code && (!o.exp || o.exp > Date.now())) return String(o.code)
    localStorage.removeItem(REF_KEY)
    return ''
  } catch { return '' }
}

// เรียกตอนโหลดหน้า (ทุกหน้า ผ่าน AuthContext) — ถ้า URL มี utm ให้เก็บลง localStorage
export function captureUtm(): void {
  if (typeof window === 'undefined') return
  captureRef()   // จับ ref ทุกครั้งด้วย (แยกจาก utm)
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Utm = {}
    let has = false
    for (const k of UTM_KEYS) {
      const v = params.get(k)
      if (v) { found[k] = v.slice(0, 200); has = true }
    }
    if (!has) return

    // first-touch: ถ้าอยากเก็บครั้งแรกไว้ไม่ให้ทับ ให้ uncomment 1 บรรทัดนี้
    // if (localStorage.getItem(KEY)) return

    found.referrer     = (document.referrer || '').slice(0, 300)
    found.landing_page = (window.location.pathname + window.location.search).slice(0, 300)
    localStorage.setItem(KEY, JSON.stringify(found))
  } catch {
    // เงียบไว้ — tracking ห้ามทำให้ flow หลักพัง
  }
}

// อ่านค่า UTM ที่เก็บไว้ — ใช้ตอน checkout แนบไปกับ order (รวม ref_code ให้ด้วย)
export function getUtm(): Utm {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    const utm = raw ? (JSON.parse(raw) as Utm) : {}
    const ref = getRefCode()
    if (ref) utm.ref_code = ref
    return utm
  } catch {
    try { const ref = getRefCode(); return ref ? { ref_code: ref } : {} } catch { return {} }
  }
}
