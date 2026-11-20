// OpenAI / ChatGPT Ads Pixel (oaiq) — helper ฝั่ง client
// ยิง event เข้า Web Pixel + อ่าน click id (__oppref/__obref) ส่งไป backend
// ทุกฟังก์ชันกัน error เงียบทั้งหมด — tracking ห้ามทำให้ flow การขายพัง

type OaiqData = Record<string, unknown>
type OaiqOpts = Record<string, unknown>

/** ยิง event ผ่าน global oaiq (ถ้า SDK ยังไม่โหลด stub ใน layout จะ queue ไว้ให้) */
export function oaiqTrack(event: string, data?: OaiqData, opts?: OaiqOpts): void {
  try {
    const w = window as unknown as { oaiq?: (...args: unknown[]) => void }
    if (typeof w.oaiq !== 'function') return
    if (opts) w.oaiq('measure', event, data || {}, opts)
    else      w.oaiq('measure', event, data || {})
  } catch { /* เงียบ */ }
}

/** ฿ (บาท) → สตางค์ (integer) ตามสเปก OpenAI Ads (฿230 = 23000) */
export function satang(baht: number): number {
  return Math.round((Number(baht) || 0) * 100)
}

/** อ่าน cookie — ใช้ดึง click id __oppref/__obref ที่ Pixel ตั้งไว้ */
function readCookie(name: string): string {
  try {
    const esc = name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')
    const m = document.cookie.match(new RegExp('(?:^|; )' + esc + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : ''
  } catch { return '' }
}
export function getOppref(): string { return readCookie('__oppref') }
export function getObref(): string  { return readCookie('__obref') }

/** cart items → contents [{id, name, content_type, quantity}] */
export function toContents(items: { sku: string; name: string; qty: number }[]): OaiqData[] {
  try {
    return (items || []).map(i => ({
      id: i.sku, name: i.name, content_type: 'product', quantity: i.qty,
    }))
  } catch { return [] }
}

/** ยิง order_created ครั้งเดียวต่อ order (กันยิงซ้ำตอน re-render/เปิดหน้าซ้ำ)
 *  event_id = order_<orderId> → dedup กับ Conversions API ฝั่ง server */
export function oaiqOrderCreatedOnce(
  orderId: string, amountBaht: number, contents?: OaiqData[],
): void {
  try {
    if (!orderId) return
    const key = 'vela_oai_oc_' + orderId
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    const data: OaiqData = { type: 'contents', amount: satang(amountBaht), currency: 'THB' }
    if (contents && contents.length) data.contents = contents
    oaiqTrack('order_created', data, { event_id: `order_${orderId}` })
  } catch { /* เงียบ */ }
}
