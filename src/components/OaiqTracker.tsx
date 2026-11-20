'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { oaiqTrack } from '@/lib/oaiq'

// ยิง page_viewed ของ ChatGPT Ads Pixel ทุกครั้งที่เปลี่ยนหน้า (รวมโหลดครั้งแรก)
// SPA navigation ไม่ reload หน้า → ต้องยิงเองตาม pathname
export default function OaiqTracker() {
  const pathname = usePathname()
  useEffect(() => {
    oaiqTrack('page_viewed', { type: 'contents' })
  }, [pathname])
  return null
}
