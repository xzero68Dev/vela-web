/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ADMIN_PASS: process.env.NEXT_PUBLIC_ADMIN_PASS,
  },
  // กัน 404 จากลิงก์เก่า/พิมพ์ผิดที่ใช้ /products (พหูพจน์) → เด้งเข้า /product (เอกพจน์)
  async redirects() {
    return [
      { source: '/products/:path*', destination: '/product/:path*', permanent: true },
    ]
  },
}
module.exports = nextConfig
