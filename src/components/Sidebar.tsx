'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
        <rect x="11" y="1.5" width="5.5" height="5.5" rx="1" />
        <rect x="1.5" y="11" width="5.5" height="5.5" rx="1" />
        <rect x="11" y="11" width="5.5" height="5.5" rx="1" />
      </svg>
    ),
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.5 6.5L9 3l6.5 3.5v7L9 17l-6.5-3.5v-7z" />
        <path d="M2.5 6.5L9 10l6.5-3.5" />
        <path d="M9 10v7" />
      </svg>
    ),
  },
  {
    href: '/intake',
    label: 'Intake',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="7" />
        <path d="M9 5.5v7M5.5 9h7" />
      </svg>
    ),
  },
  {
    href: '/actions',
    label: 'Actions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M10 1.5L3.5 10H8.5L7.5 16.5L14.5 8H9.5L10 1.5z" />
      </svg>
    ),
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 1.5h7l4 4V15a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 2.5 15V3A1.5 1.5 0 0 1 4 1.5z" />
        <path d="M11 1.5V5.5h4" />
        <path d="M5.5 10h7M5.5 13h4" />
      </svg>
    ),
  },
]

const OPS_ITEMS = [
  {
    href: '/station',
    label: 'Station',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="14" height="10" rx="1.5" />
        <path d="M6 16h6M9 13v3" />
      </svg>
    ),
  },
  {
    href: '/coordinator',
    label: 'Coordinator',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="6.5" />
        <path d="M9 5v4l2.5 2.5" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { totalMealsSaved, recommendations, resetDemo } = useStore()
  const pendingCount = recommendations.filter(r => !r.executed).length

  const dollarValue = Math.round(totalMealsSaved * 1.2 * 1.93).toLocaleString()

  return (
    <aside className="w-60 bg-nav border-r border-edge h-screen fixed left-0 top-0 flex flex-col z-10" style={{ boxShadow: '1px 0 3px rgba(0,0,0,0.04)' }}>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1.5 4.5v7L8 15l6.5-3.5v-7L8 1z" stroke="#6366F1" strokeWidth="1.5" />
              <path d="M1.5 4.5L8 8l6.5-3.5" stroke="#6366F1" strokeWidth="1.2" />
              <path d="M8 8v7" stroke="#6366F1" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <h1 className="text-heading text-sm font-semibold tracking-wide">FBIS</h1>
            <p className="text-muted text-[10px] leading-tight">Food Bank Intel System</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-edge mx-4" />

      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
                active
                  ? 'bg-indigo/10 text-indigo font-medium'
                  : 'text-body hover:text-heading hover:bg-surface'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/actions' && pendingCount > 0 && (
                <span className="ml-auto text-[10px] font-mono bg-critical/15 text-critical px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4 pb-1 px-3">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted font-semibold">Operations</p>
        </div>

        {OPS_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
                active
                  ? 'bg-indigo/10 text-indigo font-medium'
                  : 'text-body hover:text-heading hover:bg-surface'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-2">
        <div className="p-4 rounded-xl bg-surface border border-accent/20 animate-glow">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-2">Meals Saved</p>
          <p className="text-accent text-2xl font-bold font-mono tabular-nums leading-none">
            {totalMealsSaved.toLocaleString()}
          </p>
          <p className="text-muted text-[11px] font-mono mt-1.5">
            ${dollarValue} value
          </p>
        </div>
      </div>

      <div className="px-3 pb-4 pt-1">
        <button
          onClick={() => resetDemo()}
          className="w-full text-[11px] text-muted hover:text-heading transition-colors cursor-pointer py-1"
        >
          Reset Demo
        </button>
      </div>
    </aside>
  )
}
