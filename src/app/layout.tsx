import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://velacoldbrew.com'),
  title: {
    default: 'VeLA Cold Brew Coffee | กาแฟสกัดเย็น ภูเก็ต',
    template: '%s | VeLA Cold Brew Coffee',
  },
  description: 'กาแฟสกัดเย็นคุณภาพสูงจากภูเก็ต สกัดเย็น 24 ชั่วโมง หอม เข้มข้น ไม่ขม สั่งออนไลน์ส่งถึงบ้าน',
  keywords: ['cold brew', 'กาแฟสกัดเย็น', 'ภูเก็ต', 'VeLA', 'กาแฟ', 'สั่งออนไลน์'],
  authors: [{ name: 'VeLA Cold Brew Coffee' }],
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://velacoldbrew.com',
    siteName: 'VeLA Cold Brew Coffee',
    title: 'VeLA Cold Brew Coffee | กาแฟสกัดเย็น ภูเก็ต',
    description: 'กาแฟสกัดเย็นคุณภาพสูงจากภูเก็ต สกัดเย็น 24 ชั่วโมง หอม เข้มข้น ไม่ขม สั่งออนไลน์ส่งถึงบ้าน',
    images: [{ url: '/logo.png', width: 800, height: 600, alt: 'VeLA Cold Brew Coffee' }],
  },
  twitter: {
    card: 'summary',
    title: 'VeLA Cold Brew Coffee | กาแฟสกัดเย็น ภูเก็ต',
    description: 'กาแฟสกัดเย็นคุณภาพสูงจากภูเก็ต สกัดเย็น 24 ชั่วโมง หอม เข้มข้น ไม่ขม',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
