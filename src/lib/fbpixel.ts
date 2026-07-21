// Facebook Pixel helper — เรียก fbq('track', ...) แบบปลอดภัย (client-side เท่านั้น)
// Pixel ถูก init ไว้แล้วใน src/app/layout.tsx (ID 1799362394566251)
// ใช้ helper นี้กับทุก standard event เพื่อความ consistent: AddToCart, ViewContent, InitiateCheckout, Purchase

type FbqParams = Record<string, unknown>

export function fbTrack(event: string, params?: FbqParams): void {
  if (typeof window === 'undefined') return
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
  if (typeof fbq !== 'function') return
  try {
    fbq('track', event, params || {})
  } catch {
    // เงียบไว้ — tracking ห้ามทำให้ flow หลักพัง
  }
}
