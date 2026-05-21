import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeLA Cold Brew — ติดตามพัสดุ',
  description: 'ติดตามสถานะการจัดส่ง VeLA Cold Brew Coffee',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
