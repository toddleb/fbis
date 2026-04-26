'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

const FULL_SCREEN_ROUTES = ['/', '/station', '/coordinator']

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (FULL_SCREEN_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        className="fixed top-5 left-4 z-20 lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-panel border border-edge shadow-sm cursor-pointer"
        onClick={() => setMobileOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 5h12M3 9h12M3 13h12" />
        </svg>
      </button>

      <main className="lg:ml-60 min-h-screen px-6 lg:px-8 pb-6 lg:pb-8 pt-[72px] lg:pt-8">
        {children}
      </main>
    </>
  )
}
