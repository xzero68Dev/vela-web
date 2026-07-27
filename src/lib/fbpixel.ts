// Facebook Pixel helper — เรียก fbq('track', ...) แบบปลอดภัย (client-side เท่านั้น)
// Pixel ถูก init ไว้แล้วใน src/app/layout.tsx (ID 1799362394566251)
// ใช้ helper นี้กับทุก standard event เพื่อความ consistent: AddToCart, ViewContent, InitiateCheckout, Purchase

type FbqParams = Record<string, unknown>

function getFbq(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined') return null
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
  return typeof fbq === 'function' ? fbq : null
}

// standard event (เช่น ViewContent, AddToCart, InitiateCheckout, Purchase)
// eventID: ใส่เพื่อ dedup กับ Conversions API ในอนาคต (Purchase ใช้ order_id)
export function fbTrack(event: string, params?: FbqParams, eventID?: string): void {
  const fbq = getFbq()
  if (!fbq) return
  try {
    if (eventID) fbq('track', event, params || {}, { eventID })
    else         fbq('track', event, params || {})
  } catch {
    // เงียบไว้ — tracking ห้ามทำให้ flow หลักพัง
  }
}

// custom event (เช่น PlaceOrder = กดสั่งแต่ยังไม่จ่าย) — ไม่ใช่ standard event
export function fbTrackCustom(event: string, params?: FbqParams): void {
  const fbq = getFbq()
  if (!fbq) return
  try { fbq('trackCustom', event, params || {}) } catch {}
}

// ยิง Purchase ครั้งเดียวต่อ order (dedup ข้ามหน้า/รีเฟรช) — เรียกเฉพาะเมื่อ "จ่ายสำเร็จแล้ว"
// eventID = order_id เพื่อกันซ้ำ และ dedup กับ CAPI ในอนาคต
const PURCHASE_KEY = 'vela_purchase_fired'
export function firePurchaseOnce(orderId: string, params: FbqParams): boolean {
  if (!orderId || typeof window === 'undefined') return false
  try {
    const fired: string[] = JSON.parse(localStorage.getItem(PURCHASE_KEY) || '[]')
    if (fired.includes(orderId)) return false
    fbTrack('Purchase', params, orderId)
    localStorage.setItem(PURCHASE_KEY, JSON.stringify([...fired, orderId].slice(-100)))
    return true
  } catch { return false }
}

// สถานะที่ถือว่า "จ่ายเงินสำเร็จแล้ว" (ยิง Purchase ได้)
const PAID_STATUSES = ['ชำระแล้ว', 'จัดส่งแล้ว', 'จัดส่งสำเร็จ', 'paid', 'verified']
export function isPaidStatus(status?: string): boolean {
  return !!status && PAID_STATUSES.includes(status.trim())
}
