import type { Metadata } from 'next'
import Script from 'next/script'
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
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GMGH6GDS9N"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GMGH6GDS9N');
        `}</Script>

        {/* Facebook Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          if (!window.__velaPixelInit) {
            window.__velaPixelInit = true;
            fbq('init', '1799362394566251');
            fbq('track', 'PageView');
          }
        `}</Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=1799362394566251&ev=PageView&noscript=1"
          />
        </noscript>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
