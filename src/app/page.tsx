'use client'

import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(79,70,229,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 text-center animate-fade-up">
        <div
          className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(79,70,229,0.15)' }}
        >
          <svg width="40" height="40" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L1.5 4.5v7L8 15l6.5-3.5v-7L8 1z" stroke="#818CF8" strokeWidth="1.2" />
            <path d="M1.5 4.5L8 8l6.5-3.5" stroke="#818CF8" strokeWidth="1" />
            <path d="M8 8v7" stroke="#818CF8" strokeWidth="1" />
          </svg>
        </div>

        <h1
          className="text-3xl font-semibold tracking-[0.15em]"
          style={{ color: '#f1f5f9' }}
        >
          FBIS
        </h1>
        <p className="text-lg mt-2" style={{ color: '#94a3b8' }}>
          Food Bank Intel System
        </p>

        <div
          className="h-px w-16 mx-auto my-8"
          style={{ background: 'rgba(79,70,229,0.4)' }}
        />

        <p className="text-sm font-medium" style={{ color: '#64748b' }}>
          Flagstaff Family Food Center
        </p>

        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap px-4">
          {['AI-Powered', 'FEFO Compliant', 'HER Nutrition', 'Real-time Risk'].map(tag => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full"
              style={{
                color: '#818CF8',
                background: 'rgba(79,70,229,0.1)',
                border: '1px solid rgba(79,70,229,0.2)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-12 px-8 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer"
          style={{ background: '#4f46e5', color: '#ffffff' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
          onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
        >
          Launch Dashboard →
        </button>
      </div>

      <p
        className="absolute bottom-6 text-[11px]"
        style={{ color: '#475569' }}
      >
        Real-time food allocation intelligence for waste elimination
      </p>
    </div>
  )
}
