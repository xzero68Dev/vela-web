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
