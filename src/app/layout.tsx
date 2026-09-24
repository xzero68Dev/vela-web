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
  description: 'กาแฟสกัดเย็นเข้มข้น (cold brew concentrate) จากภูเก็ต สกัดเย็น 24 ชั่วโมง หอม เข้มข้น ไม่ขม ชงง่าย สั่งออนไลน์ส่งทั่วไทย',
  keywords: [
    'cold brew', 'cold brew concentrate', 'กาแฟสกัดเย็น', 'กาแฟสกัดเย็นเข้มข้น',
    'หัวเชื้อกาแฟ', 'ภูเก็ต', 'VeLA', 'กาแฟ', 'สั่งออนไลน์', 'ส่งทั่วไทย',
  ],
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
        {/* Schema.org — ข้อมูลร้าน (ช่วย Google เข้าใจว่าเป็นร้านกาแฟสกัดเย็น ภูเก็ต ส่งทั่วไทย) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: 'VeLA Cold Brew Coffee',
            image: 'https://velacoldbrew.com/logo.png',
            url: 'https://velacoldbrew.com',
            telephone: '+66906980460',
            priceRange: '฿฿',
            description: 'กาแฟสกัดเย็นเข้มข้น (cold brew concentrate) จากภูเก็ต สั่งออนไลน์ส่งทั่วไทย',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '143/32 หมู่บ้านสามกองปาร์ค หมู่ 5 ถ.ประชาสามัคคี',
              addressLocality: 'ต.รัษฎา อ.เมืองภูเก็ต',
              addressRegion: 'ภูเก็ต',
              postalCode: '83000',
              addressCountry: 'TH',
            },
            areaServed: { '@type': 'Country', name: 'Thailand' },
            sameAs: ['https://shopee.co.th/velacafe'],
          }) }}
        />

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
