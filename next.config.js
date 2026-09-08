/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ADMIN_PASS: process.env.NEXT_PUBLIC_ADMIN_PASS,
  },
  // redirect เฉพาะ /products/<sku> ที่ไม่มีจุด (ไม่ใช่ไฟล์รูป) → /product/<sku>
  // ([^./]+) กันไม่ให้ดักไฟล์รูปใน public/products/*.png (ไม่งั้นรูปสินค้าหายหมด)
  async redirects() {
    return [
      { source: '/products/:sku([^./]+)', destination: '/product/:sku', permanent: true },
    ]
  },
}
module.exports = nextConfig
