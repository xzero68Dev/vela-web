// โปรลูกค้าใหม่: ลด 50% ของบิล เพดานสูงสุด ฿130
// เงื่อนไข: เฉพาะออเดอร์แรกในระบบเว็บ ผูกกับเบอร์โทร (backend เป็นคนตัดสิน eligibility จริง)
// สูตรนี้ต้องเหมือนกันเป๊ะทั้งฝั่ง frontend (แสดงผล) และ backend (คิดเงินจริง)

export const FIRST_ORDER_PCT = 0.5   // 50%
export const FIRST_ORDER_CAP = 130   // เพดานส่วนลด (บาท)

// คืนยอด "ส่วนลดจริง" (บาท) จาก subtotal ของบิล (ราคาปกติรวมทั้งบิล)
export function firstOrderDiscountAmount(subtotal: number): number {
  if (!subtotal || subtotal <= 0) return 0
  return Math.min(Math.round(subtotal * FIRST_ORDER_PCT), FIRST_ORDER_CAP)
}

// ── ส่วนลดลูกค้า VIP: % ต่อคน เพดานเท่าโปรลูกค้าใหม่ (฿130) ──
export const VIP_CAP = FIRST_ORDER_CAP

export function vipDiscountAmount(subtotal: number, pct: number): number {
  if (!subtotal || subtotal <= 0 || !pct || pct <= 0) return 0
  return Math.min(Math.round(subtotal * pct / 100), VIP_CAP)
}

// เลือกส่วนลดที่มากกว่าระหว่างโปรลูกค้าใหม่กับ VIP (ไม่ซ้อน) — ตรงกับ backend
export function bestDiscount(
  subtotal: number, firstOrderEligible: boolean, vipPct: number,
): { amount: number; kind: 'first' | 'vip' | 'none' } {
  const fo  = firstOrderEligible ? firstOrderDiscountAmount(subtotal) : 0
  const vip = vipDiscountAmount(subtotal, vipPct)
  if (fo === 0 && vip === 0) return { amount: 0, kind: 'none' }
  return fo >= vip ? { amount: fo, kind: 'first' } : { amount: vip, kind: 'vip' }
}
