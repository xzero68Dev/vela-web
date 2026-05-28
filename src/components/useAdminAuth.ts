'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from './auth'

export function useAdminAuth() {
  const router  = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/admin/login')
    } else {
      setReady(true)
    }
  }, [router])

  return ready
}
