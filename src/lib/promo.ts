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

// ── ส่วนลดลูกค้า VIP: % ต่อคน คิดจาก "ราคาตั้ง" (original) แทนส่วนลด 30% ปกติ (ไม่ลดซ้ำ) ──
// vipTotal = ราคาตั้งรวม × (1 - vip%)  → ราคาที่ VIP จ่ายจริง
export function vipTotalFromOriginal(origSubtotal: number, pct: number): number {
  if (!origSubtotal || origSubtotal <= 0 || !pct || pct <= 0) return origSubtotal
  return Math.round(origSubtotal * (1 - pct / 100))
}

// เลือกส่วนลดที่ทำให้ "จ่ายน้อยที่สุด" ระหว่างโปรลูกค้าใหม่ (คิดจากราคาปกติ) กับ VIP (คิดจากราคาตั้ง) — ไม่ซ้อน
// คืน: kind, amount=ยอดที่ลด, total=ยอดจ่ายจริง, base=ยอดตั้งต้นที่ใช้โชว์
export function bestDiscount(
  subtotalDisc: number, origSubtotal: number, firstOrderEligible: boolean, vipPct: number,
): { kind: 'first' | 'vip' | 'none'; amount: number; total: number; base: number } {
  const fo = firstOrderEligible ? firstOrderDiscountAmount(subtotalDisc) : 0
  const vipTotal = (vipPct > 0 && origSubtotal > 0) ? vipTotalFromOriginal(origSubtotal, vipPct) : subtotalDisc
  const vipDisc  = Math.max(0, subtotalDisc - vipTotal)
  if (fo > 0 && fo >= vipDisc) return { kind: 'first', amount: fo, total: subtotalDisc - fo, base: subtotalDisc }
  if (vipDisc > 0)             return { kind: 'vip', amount: origSubtotal - vipTotal, total: vipTotal, base: origSubtotal }
  return { kind: 'none', amount: 0, total: subtotalDisc, base: subtotalDisc }
}
