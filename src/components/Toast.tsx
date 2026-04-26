'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastItem = {
  id: number
  message: string
  detail?: string
}

type ShowToast = (message: string, detail?: string) => void

const ToastCtx = createContext<ShowToast>(() => {})

export function useToast(): ShowToast {
  return useContext(ToastCtx)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show: ShowToast = useCallback((message, detail) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, detail }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastCtx value={show}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="animate-toast-in pointer-events-auto bg-panel rounded-xl border border-edge shadow-lg px-5 py-4 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-safe" />
              <div>
                <p className="text-heading text-sm font-medium">{t.message}</p>
                {t.detail && <p className="text-muted text-xs mt-0.5">{t.detail}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx>
  )
}
