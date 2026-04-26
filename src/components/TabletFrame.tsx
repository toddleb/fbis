'use client'

interface TabletFrameProps {
  children: React.ReactNode
  className?: string
}

export function TabletFrame({ children, className = '' }: TabletFrameProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className="relative"
        style={{
          width: '100%',
          maxWidth: 1366,
          aspectRatio: '4 / 3',
          borderRadius: 24,
          background: '#d4d2cd',
          padding: '12px 16px 16px 16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <div
          className="absolute top-[4px] left-1/2 -translate-x-1/2 z-10"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#b8b6b1',
            border: '1px solid #a0a09b',
          }}
        />

        <div className="flex items-center justify-between px-6 py-1 text-[9px] font-medium text-[#666]">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M6 9a1 1 0 100-2 1 1 0 000 2z" fill="#666" />
              <path d="M3.5 6.5a3.5 3.5 0 015 0" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M1.5 4.5a6 6 0 019 0" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div className="flex items-center gap-0.5">
              <div style={{ width: 20, height: 9, borderRadius: 2, border: '1px solid #999', padding: 1 }}>
                <div style={{ width: '80%', height: '100%', borderRadius: 1, background: '#22c55e' }} />
              </div>
              <div style={{ width: 2, height: 4, borderRadius: '0 1px 1px 0', background: '#999' }} />
            </div>
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 12,
            height: 'calc(100% - 36px)',
            background: '#f8f9fb',
          }}
        >
          {children}
        </div>

        <div
          className="absolute bottom-[6px] left-1/2 -translate-x-1/2"
          style={{ width: 100, height: 4, borderRadius: 2, background: '#b0ada8' }}
        />
      </div>
    </div>
  )
}
