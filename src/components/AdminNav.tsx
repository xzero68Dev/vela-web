'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from './auth'
import VelaBunny from './VelaBunny'

export default function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin',          label: 'สถานะพัสดุ' },
    { href: '/admin/orders',   label: 'Orders' },
    { href: '/admin/accounting', label: 'บัญชี' },
    { href: '/admin/upload',   label: 'Import Excel' },
    { href: '/admin/products', label: 'สินค้า' },
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <VelaBunny size={32} />
        <div>
          <h1 className="text-2xl font-black uppercase leading-none"
            style={{ fontFamily: 'var(--font-display)', color: '#D64B2A' }}>
            VeLA Admin
          </h1>
          <p className="text-xs font-mono" style={{ color: '#8C7B6E' }}>Cold Brew Coffee</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border-2 transition-all"
              style={isActive
                ? { background: '#D64B2A', color: '#EDE8DF', borderColor: '#D64B2A' }
                : { background: 'transparent', color: '#8C7B6E', borderColor: '#D8D0C5' }}>
              {item.label}
            </Link>
          )
        })}
        <button onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border-2 transition-all"
          style={{ borderColor: '#D8D0C5', color: '#C5BAB0' }}>
          Logout
        </button>
      </div>
    </div>
  )
}
