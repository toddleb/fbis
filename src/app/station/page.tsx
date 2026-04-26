'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TabletFrame } from '@/components/TabletFrame'
import { useStore } from '@/lib/store'
import { Category, CATEGORY_LABELS, DistributionItem, RiskLevel, HER_COLORS, HerRating } from '@/lib/types'

const CATEGORIES: { label: string; value: Category | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: CATEGORY_LABELS.produce, value: 'produce' },
  { label: CATEGORY_LABELS.dairy, value: 'dairy' },
  { label: CATEGORY_LABELS.protein, value: 'protein' },
  { label: CATEGORY_LABELS.grains, value: 'grains' },
  { label: CATEGORY_LABELS.canned, value: 'canned' },
  { label: CATEGORY_LABELS.frozen, value: 'frozen' },
  { label: CATEGORY_LABELS.bakery, value: 'bakery' },
]

const FAMILY_SIZES = [1, 2, 3, 4, 5, '6+'] as const

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#DC2626',
  warning: '#D97706',
  safe: '#16A34A',
}

const RISK_BG: Record<RiskLevel, string> = {
  critical: '#FEF2F2',
  warning: '#FFFBEB',
  safe: '#F0FDF4',
}

type TicketItem = DistributionItem & { maxQty: number; herRating: HerRating }

type CompletionState = 'idle' | 'processing' | 'done'

export default function StationPage() {
  const { riskLots, completeDistribution, distributionCount, totalMealsSaved } = useStore()
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [familySize, setFamilySize] = useState<number>(3)
  const [ticket, setTicket] = useState<TicketItem[]>([])
  const [completion, setCompletion] = useState<CompletionState>('idle')
  const [lastMeals, setLastMeals] = useState(0)

  const filteredLots = useMemo(() => {
    return riskLots
      .filter(l => categoryFilter === 'all' || l.category === categoryFilter)
      .filter(l => l.quantity > 0)
      .filter(l => !search || l.itemName.toLowerCase().includes(search.toLowerCase()))
  }, [riskLots, categoryFilter, search])

  const ticketWeight = ticket.reduce((s, i) => s + i.quantity, 0)
  const ticketMeals = Math.floor(ticketWeight / 1.2)
  const ticketCategories = new Set(ticket.map(i => i.category))

  const foodGroups: { name: string; categories: Category[]; filled: boolean }[] = [
    { name: 'Produce', categories: ['produce'], filled: ticketCategories.has('produce') },
    { name: 'Protein', categories: ['protein', 'frozen'], filled: ticketCategories.has('protein') || ticketCategories.has('frozen') },
    { name: 'Dairy', categories: ['dairy'], filled: ticketCategories.has('dairy') },
    { name: 'Grains', categories: ['grains', 'bakery'], filled: ticketCategories.has('grains') || ticketCategories.has('bakery') },
    { name: 'Pantry Staples', categories: ['canned'], filled: ticketCategories.has('canned') },
  ]

  function addToTicket(lotId: string, itemName: string, category: Category, riskLevel: RiskLevel, maxQty: number, herRating: HerRating) {
    setTicket(prev => {
      const existing = prev.find(i => i.lotId === lotId)
      if (existing) {
        const increment = Math.min(5, existing.maxQty - existing.quantity)
        if (increment <= 0) return prev
        return prev.map(i => i.lotId === lotId ? { ...i, quantity: i.quantity + increment } : i)
      }
      return [...prev, { lotId, itemName, category, quantity: Math.min(5, maxQty), riskLevel, maxQty, herRating }]
    })
  }

  function updateTicketQty(lotId: string, delta: number) {
    setTicket(prev =>
      prev
        .map(i => {
          if (i.lotId !== lotId) return i
          const next = Math.max(0, Math.min(i.maxQty, i.quantity + delta))
          return { ...i, quantity: next }
        })
        .filter(i => i.quantity > 0)
    )
  }

  function clearTicket() {
    setTicket([])
  }

  function handleComplete() {
    if (ticket.length === 0) return
    setCompletion('processing')
    const meals = ticketMeals
    setTimeout(() => {
      completeDistribution(ticket)
      setLastMeals(meals)
      setCompletion('done')
      setTimeout(() => {
        setTicket([])
        setCompletion('idle')
      }, 3000)
    }, 1200)
  }

  const suggestedCategory = foodGroups.find(g => !g.filled)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <TabletFrame className="w-full max-w-[1400px]">
        <div className="h-full flex flex-col" style={{ fontSize: 13, color: '#1e293b' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xs font-medium mr-1" style={{ color: '#94a3b8' }}>
                &larr; Back
              </Link>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#16A34A' }} />
              <span className="font-semibold text-sm" style={{ color: '#0f172a' }}>Distribution Station 01</span>
              <span className="text-xs" style={{ color: '#94a3b8' }}>Main Warehouse</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
              <span>Distributions: <span className="font-mono" style={{ color: '#0f172a' }}>{distributionCount}</span></span>
              <span>Meals today: <span className="font-mono font-semibold" style={{ color: '#ea580c' }}>{totalMealsSaved.toLocaleString()}</span></span>
            </div>
          </div>

          {/* Completion overlay */}
          {completion !== 'idle' && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.97)' }}>
              {completion === 'processing' ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#e0e7ff', borderTopColor: '#6366F1' }} />
                  <p className="text-lg font-medium" style={{ color: '#0f172a' }}>Processing distribution...</p>
                </div>
              ) : (
                <div className="text-center animate-fade-up">
                  <div className="text-6xl mb-4" style={{ color: '#16A34A' }}>&#10003;</div>
                  <p className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>Family served!</p>
                  <p className="text-xl font-mono" style={{ color: '#ea580c' }}>{lastMeals} meals delivered</p>
                  <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>{ticket.length} items &middot; {ticketWeight.toLocaleString()} lbs</p>
                </div>
              )}
            </div>
          )}

          {/* Main split panel */}
          <div className="flex flex-1 min-h-0">
            {/* LEFT — Inventory Browser (40%) */}
            <div className="w-[40%] flex flex-col" style={{ borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
              {/* Category tabs */}
              <div className="flex gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid #f1f5f9' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
                    style={{
                      background: categoryFilter === cat.value ? '#eef2ff' : 'transparent',
                      color: categoryFilter === cat.value ? '#4f46e5' : '#94a3b8',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#1e293b',
                  }}
                />
              </div>

              {/* Item grid */}
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                <div className="flex items-center gap-1.5 px-1 py-1.5 mb-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#94a3b8" strokeWidth="1.2">
                    <circle cx="6" cy="6" r="5" />
                    <path d="M6 4v2.5M6 8.5v0" strokeLinecap="round" />
                  </svg>
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>Sorted: First Expired, First Out</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredLots.map(lot => (
                    <button
                      key={lot.lotId}
                      onClick={() => addToTicket(lot.lotId, lot.itemName, lot.category, lot.riskLevel, lot.quantity, lot.herRating)}
                      className="text-left p-3 rounded-lg transition-all active:scale-[0.97] min-h-[60px]"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-medium leading-tight" style={{ color: '#0f172a' }}>{lot.itemName}</span>
                        <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: RISK_COLORS[lot.riskLevel] }}
                            title={lot.riskLevel}
                          />
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: HER_COLORS[lot.herRating].text }}
                            title={`HER: ${lot.herRating}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: '#94a3b8' }}>{lot.quantity.toLocaleString()} lbs</span>
                        <span
                          className="text-[10px] font-mono font-medium"
                          style={{ color: RISK_COLORS[lot.riskLevel] }}
                        >
                          {lot.daysToExpire}d
                        </span>
                      </div>
                    </button>
                  ))}
                  {filteredLots.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-xs" style={{ color: '#94a3b8' }}>No items found</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Distribution Ticket (60%) */}
            <div className="w-[60%] flex flex-col" style={{ background: '#ffffff' }}>
              {/* Family size selector */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <span className="text-xs" style={{ color: '#64748b' }}>Family size:</span>
                <div className="flex gap-1">
                  {FAMILY_SIZES.map(size => {
                    const sizeNum = typeof size === 'number' ? size : 6
                    return (
                      <button
                        key={size}
                        onClick={() => setFamilySize(sizeNum)}
                        className="w-9 h-9 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: familySize === sizeNum ? '#6366F1' : '#f1f5f9',
                          color: familySize === sizeNum ? '#ffffff' : '#64748b',
                        }}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                <span className="text-[10px] ml-auto" style={{ color: '#94a3b8' }}>
                  Target: ~{Math.ceil(familySize * 1.2 * 5)} lbs / {familySize * 5} meals
                </span>
              </div>

              {/* Ticket items */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {ticket.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center" style={{ color: '#cbd5e1' }}>
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
                        <rect x="5" y="8" width="30" height="26" rx="3" />
                        <path d="M14 8V5a6 6 0 0112 0v3" />
                      </svg>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>Tap items to add to distribution</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ticket.map(item => (
                      <div
                        key={item.lotId}
                        className="flex items-center gap-3 p-3 rounded-lg animate-fade-up"
                        style={{
                          background: RISK_BG[item.riskLevel],
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div className="flex gap-0.5 shrink-0">
                          <div
                            className="w-1 h-8 rounded-full"
                            style={{ background: HER_COLORS[item.herRating].text }}
                          />
                          <div
                            className="w-1 h-8 rounded-full"
                            style={{ background: RISK_COLORS[item.riskLevel] }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: '#0f172a' }}>{item.itemName}</p>
                          <p className="text-[10px]" style={{ color: '#64748b' }}>{item.category} &middot; {Math.floor(item.quantity / 1.2)} meals</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateTicketQty(item.lotId, -1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
                            style={{ background: '#f1f5f9', color: '#334155' }}
                          >
                            &minus;
                          </button>
                          <span className="w-12 text-center font-mono text-sm font-medium" style={{ color: '#0f172a' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateTicketQty(item.lotId, 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
                            style={{ background: '#f1f5f9', color: '#334155' }}
                          >
                            +
                          </button>
                          <span className="text-[10px] w-10 text-right" style={{ color: '#94a3b8' }}>lbs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutrition balance + AI suggestion */}
              {ticket.length > 0 && (
                <div className="px-4 py-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: '#94a3b8' }}>Balance</span>
                    <div className="flex gap-1 flex-1">
                      {foodGroups.map(g => (
                        <div
                          key={g.name}
                          className="flex-1 h-1.5 rounded-full transition-colors"
                          style={{ background: g.filled ? '#6366F1' : '#e2e8f0' }}
                          title={g.name}
                        />
                      ))}
                    </div>
                    <span className="text-[10px]" style={{ color: '#94a3b8' }}>{foodGroups.filter(g => g.filled).length}/5</span>
                  </div>
                  {(() => {
                    const greenQty = ticket.filter(i => i.herRating === 'green').reduce((s, i) => s + i.quantity, 0)
                    const yellowQty = ticket.filter(i => i.herRating === 'yellow').reduce((s, i) => s + i.quantity, 0)
                    const greenPct = ticketWeight > 0 ? Math.round((greenQty / ticketWeight) * 100) : 0
                    const yellowPct = ticketWeight > 0 ? Math.round((yellowQty / ticketWeight) * 100) : 0
                    return (
                      <div className="flex items-center gap-2 mb-1.5 text-[10px]" style={{ color: '#94a3b8' }}>
                        <span>Nutrition:</span>
                        <span style={{ color: HER_COLORS.green.text }}>{greenPct}% green</span>
                        <span>&middot;</span>
                        <span style={{ color: HER_COLORS.yellow.text }}>{yellowPct}% yellow</span>
                      </div>
                    )
                  })()}
                  {suggestedCategory && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#6366F1" strokeWidth="1.5">
                        <circle cx="7" cy="7" r="5.5" />
                        <path d="M7 5v2.5M7 9.5v0" strokeLinecap="round" />
                      </svg>
                      <span className="text-[10px]" style={{ color: '#4f46e5' }}>Add {suggestedCategory.name.toLowerCase()} for better nutrition balance</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div className="flex items-center gap-6 text-xs">
              <span style={{ color: '#64748b' }}>
                Weight: <span className="font-mono font-medium" style={{ color: '#0f172a' }}>{ticketWeight.toLocaleString()} lbs</span>
              </span>
              <span style={{ color: '#64748b' }}>
                Meals: <span className="font-mono font-semibold" style={{ color: '#ea580c' }}>{ticketMeals}</span>
              </span>
              <span style={{ color: '#64748b' }}>
                Items: <span className="font-mono font-medium" style={{ color: '#0f172a' }}>{ticket.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearTicket}
                disabled={ticket.length === 0}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
                style={{ background: '#f1f5f9', color: '#64748b' }}
              >
                Clear
              </button>
              <button
                onClick={handleComplete}
                disabled={ticket.length === 0}
                className="px-5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: '#16A34A', color: '#ffffff' }}
              >
                Complete Distribution
              </button>
            </div>
          </div>
        </div>
      </TabletFrame>
    </div>
  )
}
