'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { TabletFrame } from '@/components/TabletFrame'
import { LOCATIONS } from '@/lib/data'
import { HER_COLORS } from '@/lib/types'

export default function CoordinatorPage() {
  const { riskLots, stats, recommendations, executeAction, totalMealsSaved, distributionCount, herStats } = useStore()

  const criticalLots = riskLots.filter(l => l.riskLevel === 'critical')
  const warningLots = riskLots.filter(l => l.riskLevel === 'warning')
  const pendingRecs = recommendations.filter(r => !r.executed)

  const locationBreakdown = LOCATIONS.map(loc => {
    const lots = riskLots.filter(l => l.location === loc)
    const weight = lots.reduce((s, l) => s + l.quantity, 0)
    const critical = lots.filter(l => l.riskLevel === 'critical').length
    return { location: loc, lotCount: lots.length, weight, critical }
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <TabletFrame className="w-full max-w-[1400px]">
        <div className="h-full flex flex-col" style={{ fontSize: 13, color: '#1e293b' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xs hover:underline" style={{ color: '#64748b' }}>&larr; Back</Link>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6366F1' }} />
              <span className="font-semibold text-sm" style={{ color: '#0f172a' }}>Coordinator Console</span>
              <span className="text-xs" style={{ color: '#94a3b8' }}>Central Warehouse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} />
              <span className="text-xs" style={{ color: '#94a3b8' }}>All stations online</span>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-6 gap-px" style={{ background: '#e2e8f0' }}>
            {[
              { label: 'Total Inventory', value: `${stats.totalWeight.toLocaleString()} lbs`, color: '#4f46e5' },
              { label: 'At Risk', value: `${stats.atRiskWeight.toLocaleString()} lbs`, color: '#D97706' },
              { label: 'Critical', value: `${stats.criticalWeight.toLocaleString()} lbs`, color: '#DC2626' },
              { label: 'Value at Risk', value: `$${stats.dollarValueAtRisk.toLocaleString()}`, color: '#9333ea' },
              { label: 'Distributions', value: distributionCount.toString(), color: '#16A34A' },
              { label: 'Meals Saved', value: totalMealsSaved.toLocaleString(), color: '#ea580c' },
            ].map(kpi => (
              <div key={kpi.label} className="px-4 py-3" style={{ background: '#ffffff' }}>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>{kpi.label}</p>
                <p className="text-lg font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* HER summary */}
          <div className="flex items-center gap-4 px-5 py-1.5 text-[10px]" style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
            <span className="uppercase tracking-wider font-semibold" style={{ color: '#94a3b8' }}>HER:</span>
            <span style={{ color: HER_COLORS.green.text }}>{herStats.greenPct}% green</span>
            <span style={{ color: '#cbd5e1' }}>&middot;</span>
            <span style={{ color: HER_COLORS.yellow.text }}>{herStats.yellowPct}% yellow</span>
            <span style={{ color: '#cbd5e1' }}>&middot;</span>
            <span style={{ color: HER_COLORS.red.text }}>{herStats.redPct}% red</span>
          </div>

          {/* Main content area */}
          <div className="flex flex-1 min-h-0">
            {/* LEFT — Locations + Alerts (45%) */}
            <div className="w-[45%] flex flex-col" style={{ borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Location Overview</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {locationBreakdown.map(loc => (
                  <div key={loc.location} className="p-3 rounded-lg" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: '#0f172a' }}>{loc.location}</span>
                      {loc.critical > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                          {loc.critical} critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px]" style={{ color: '#94a3b8' }}>
                      <span>{loc.lotCount} lots</span>
                      <span>{loc.weight.toLocaleString()} lbs</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stats.totalWeight > 0 ? (loc.weight / stats.totalWeight) * 100 : 0}%`,
                            background: loc.critical > 0 ? '#DC2626' : '#6366F1',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert feed */}
              <div style={{ borderTop: '1px solid #e2e8f0' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                    Alerts <span className="font-mono" style={{ color: '#DC2626' }}>{criticalLots.length + warningLots.length}</span>
                  </h2>
                </div>
                <div className="overflow-y-auto max-h-[200px] p-4 space-y-2">
                  {criticalLots.map(lot => (
                    <div key={lot.lotId} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#DC2626' }} />
                      <span style={{ color: '#0f172a' }}>{lot.itemName}</span>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: HER_COLORS[lot.herRating].text }} title={`HER: ${lot.herRating}`} />
                      <span style={{ color: '#94a3b8' }}>{lot.location}</span>
                      <span className="ml-auto font-mono" style={{ color: '#DC2626' }}>{lot.daysToExpire}d</span>
                    </div>
                  ))}
                  {warningLots.map(lot => (
                    <div key={lot.lotId} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#D97706' }} />
                      <span style={{ color: '#0f172a' }}>{lot.itemName}</span>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: HER_COLORS[lot.herRating].text }} title={`HER: ${lot.herRating}`} />
                      <span style={{ color: '#94a3b8' }}>{lot.location}</span>
                      <span className="ml-auto font-mono" style={{ color: '#D97706' }}>{lot.daysToExpire}d</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Pending Actions (55%) */}
            <div className="w-[55%] flex flex-col" style={{ background: '#ffffff' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Pending Actions <span className="font-mono" style={{ color: '#4f46e5' }}>{pendingRecs.length}</span>
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {pendingRecs.map(rec => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg transition-colors"
                    style={{
                      background: rec.urgency === 'critical' ? '#FEF2F2' : '#FFFBEB',
                      border: `1px solid ${rec.urgency === 'critical' ? '#FECACA' : '#FDE68A'}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1.5 min-h-[32px] rounded-full shrink-0"
                        style={{ background: rec.urgency === 'critical' ? '#DC2626' : '#D97706' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs mb-1" style={{ color: '#0f172a' }}>{rec.action}</p>
                        <p className="text-[10px]" style={{ color: '#64748b' }}>{rec.detail}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px]">
                          <span style={{ color: '#64748b' }}>
                            Impact: <span className="font-mono font-medium" style={{ color: '#ea580c' }}>{rec.impactMeals.toLocaleString()} meals</span>
                            <span style={{ color: '#94a3b8' }}> &middot; </span>
                            <span className="font-mono font-medium" style={{ color: '#9333ea' }}>${rec.impactDollars.toLocaleString()}</span>
                          </span>
                          <span style={{ color: '#64748b' }}>
                            Target: <span style={{ color: '#4f46e5' }}>{rec.targetLocation}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className="text-[9px] uppercase font-semibold tracking-wider px-2 py-1 rounded"
                          style={{
                            color: rec.urgency === 'critical' ? '#DC2626' : '#D97706',
                            background: rec.urgency === 'critical' ? '#FEE2E2' : '#FEF3C7',
                          }}
                        >
                          {rec.urgency}
                        </span>
                        <button
                          onClick={() => executeAction(rec.id, rec.lotId, rec.impactMeals)}
                          className="text-[10px] font-medium px-3 py-1 rounded cursor-pointer transition-colors"
                          style={{ background: '#4f46e5', color: '#ffffff' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRecs.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs" style={{ color: '#94a3b8' }}>
                    All actions executed
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-5 py-2 text-[10px]" style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', color: '#94a3b8' }}>
            <span>Waste risk: <span className="font-mono font-medium" style={{ color: '#D97706' }}>{stats.wastePercent}%</span></span>
            <span>{stats.lotCount} lots across {LOCATIONS.length} locations</span>
            <span>FEFO mode active</span>
          </div>
        </div>
      </TabletFrame>
    </div>
  )
}
