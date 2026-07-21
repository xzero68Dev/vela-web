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
}

const KEY = 'vela_utm'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

// เรียกตอนโหลดหน้า (ทุกหน้า ผ่าน AuthContext) — ถ้า URL มี utm ให้เก็บลง localStorage
export function captureUtm(): void {
  if (typeof window === 'undefined') return
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

// อ่านค่า UTM ที่เก็บไว้ — ใช้ตอน checkout แนบไปกับ order
export function getUtm(): Utm {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Utm) : {}
  } catch {
    return {}
  }
}
