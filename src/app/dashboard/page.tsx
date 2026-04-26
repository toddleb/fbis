'use client'

import { useStore } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { RiskLot, HER_COLORS, HER_LABELS, HerRating } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const { stats, riskLots, recommendations, executeAction, totalMealsSaved, equity, herStats } = useStore()
  const toast = useToast()

  const criticalLots = riskLots.filter(l => l.riskLevel === 'critical')
  const warningLots = riskLots.filter(l => l.riskLevel === 'warning')
  const pendingRecs = recommendations.filter(r => !r.executed).slice(0, 3)

  const kpis: { label: string; value: string; sub: string; accent: string; border: string }[] = [
    {
      label: 'Total Inventory',
      value: `${stats.totalWeight.toLocaleString()} lbs`,
      sub: `${stats.lotCount} active lots`,
      accent: 'text-indigo',
      border: 'border-t-indigo',
    },
    {
      label: 'At Risk',
      value: `${stats.atRiskWeight.toLocaleString()} lbs`,
      sub: `${stats.totalWeight > 0 ? Math.round((stats.atRiskWeight / stats.totalWeight) * 100) : 0}% of inventory`,
      accent: 'text-warn',
      border: 'border-t-warn',
    },
    {
      label: 'Value at Risk',
      value: `$${stats.dollarValueAtRisk.toLocaleString()}`,
      sub: 'dollar exposure',
      accent: 'text-critical',
      border: 'border-t-critical',
    },
    {
      label: 'Meals Saved',
      value: totalMealsSaved.toLocaleString(),
      sub: 'from waste prevention',
      accent: 'text-accent',
      border: 'border-t-accent',
    },
    {
      label: 'Waste Risk',
      value: `${stats.wastePercent}%`,
      sub: `${stats.criticalWeight.toLocaleString()} lbs critical`,
      accent: 'text-critical',
      border: 'border-t-critical',
    },
  ]

  const filteredEquity = equity.filter(e => e.populationServed > 0)

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading text-xl font-semibold">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">Flagstaff Family Food Center — Inventory risk overview</p>
        </div>
        <p className="text-muted text-xs font-mono">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`animate-fade-up bg-panel rounded-xl border border-edge border-t-2 ${kpi.border} p-5 shadow-sm`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-2">{kpi.label}</p>
            <p className={`text-2xl font-semibold font-mono tabular-nums ${kpi.accent}`}>{kpi.value}</p>
            <p className="text-muted text-[11px] mt-1.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Expiry Risk Panel */}
        <div className="col-span-1 lg:col-span-3 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-edge flex items-center justify-between">
              <h2 className="text-heading text-sm font-medium">Expiry Risk Monitor</h2>
              <Link
                href="/inventory"
                className="text-[11px] text-indigo hover:text-indigo/80 transition-colors"
              >
                View all →
              </Link>
            </div>

            <div>
              {criticalLots.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-critical/5 border-b border-edge/50">
                    <span className="text-[10px] uppercase tracking-widest text-critical font-medium">
                      Critical — ≤3 days ({criticalLots.length})
                    </span>
                  </div>
                  {criticalLots.map(lot => (
                    <RiskRow key={lot.lotId} lot={lot} />
                  ))}
                </>
              )}

              {warningLots.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-warn/5 border-b border-edge/50 border-t border-t-edge/50">
                    <span className="text-[10px] uppercase tracking-widest text-warn font-medium">
                      Warning — 4-7 days ({warningLots.length})
                    </span>
                  </div>
                  {warningLots.map(lot => (
                    <RiskRow key={lot.lotId} lot={lot} />
                  ))}
                </>
              )}

              {criticalLots.length === 0 && warningLots.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-safe text-sm font-medium">All inventory safe</p>
                  <p className="text-muted text-xs mt-1">No lots approaching expiration</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Actions Panel */}
        <div className="col-span-1 lg:col-span-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-edge flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo" />
                </span>
                <h2 className="text-heading text-sm font-medium">AI Recommendations</h2>
              </div>
              <Link
                href="/actions"
                className="text-[11px] text-indigo hover:text-indigo/80 transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="p-3 space-y-2">
              {pendingRecs.map(rec => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg bg-surface border border-edge hover:border-indigo/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        rec.urgency === 'critical' ? 'bg-critical' : 'bg-warn'
                      }`}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-wider font-medium ${
                        rec.urgency === 'critical' ? 'text-critical' : 'text-warn'
                      }`}
                    >
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-heading text-[13px] leading-snug">{rec.action}</p>
                  <p className="text-muted text-[11px] mt-1">{rec.detail}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-edge/50">
                    <div>
                      <span className="text-accent text-xs font-mono font-semibold">
                        ~{rec.impactMeals.toLocaleString()} meals
                      </span>
                      <span className="text-muted text-[10px] font-mono ml-2">
                        (${rec.impactDollars.toLocaleString()})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        executeAction(rec.id, rec.lotId, rec.impactMeals)
                        toast('Action executed', `~${rec.impactMeals.toLocaleString()} meals saved · $${rec.impactDollars.toLocaleString()} value`)
                      }}
                      className="text-[11px] font-medium text-indigo bg-indigo/10 hover:bg-indigo/20 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              ))}

              {pendingRecs.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-safe text-sm font-medium">All clear</p>
                  <p className="text-muted text-xs mt-1">No pending recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HER Nutrition Quality Panel */}
      <div className="animate-fade-up mb-8" style={{ animationDelay: '320ms' }}>
        <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="text-heading text-sm font-medium">HER Nutrition Quality</h2>
            <p className="text-muted text-[11px] mt-0.5">Healthy Eating Research rating breakdown</p>
          </div>
          <div className="p-5 space-y-4">
            {([
              { key: 'green' as HerRating, lbs: herStats.greenLbs, pct: herStats.greenPct },
              { key: 'yellow' as HerRating, lbs: herStats.yellowLbs, pct: herStats.yellowPct },
              { key: 'red' as HerRating, lbs: herStats.redLbs, pct: herStats.redPct },
            ]).map(({ key, lbs, pct }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-heading text-[13px] font-medium capitalize">
                    {key} — {HER_LABELS[key]}: {pct}%
                  </span>
                  <span className="text-muted text-[11px] font-mono">
                    {lbs.toLocaleString()} lbs
                  </span>
                </div>
                <div className="w-full h-3 bg-edge/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: HER_COLORS[key].text,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Equity Section */}
      <div className="animate-fade-up" style={{ animationDelay: '350ms' }}>
        <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="text-heading text-sm font-medium">Supply vs. Demand by Location</h2>
            <p className="text-muted text-[11px] mt-0.5">Mapping the meal gap across service areas</p>
          </div>

          <div className="p-5 space-y-4">
            {filteredEquity.map(loc => {
              const barRatio = Math.min(loc.supplyRatio, 2.0)
              const barPercent = (barRatio / 2.0) * 100
              const barColor =
                loc.supplyRatio < 0.7
                  ? 'bg-critical'
                  : loc.supplyRatio < 1.0
                    ? 'bg-warn'
                    : 'bg-safe'
              const textColor =
                loc.supplyRatio < 0.7
                  ? 'text-critical'
                  : loc.supplyRatio < 1.0
                    ? 'text-warn'
                    : 'text-safe'

              return (
                <div key={loc.location}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-heading text-[13px] font-medium">{loc.location}</span>
                      <span className="text-muted text-[11px] ml-2">
                        {loc.populationServed.toLocaleString()} people served
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-semibold ${textColor}`}>
                        {loc.supplyRatio.toFixed(1)}x
                      </span>
                      <span className="text-muted text-[11px] font-mono">
                        {loc.gapLbs >= 0 ? '+' : ''}{loc.gapLbs.toLocaleString()} lbs
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-edge/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}

            {filteredEquity.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted text-sm">No community locations with demand data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskRow({ lot }: { lot: RiskLot }) {
  return (
    <div className="px-5 py-3 flex items-center gap-4 hover:bg-panel-hover/30 transition-colors border-b border-edge/30 last:border-b-0">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          lot.riskLevel === 'critical' ? 'bg-critical' : 'bg-warn'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-heading text-[13px] truncate">{lot.itemName}</p>
        <p className="text-muted text-[11px]">{lot.location}</p>
      </div>
      <span className="text-body text-xs font-mono">
        {lot.quantity.toLocaleString()} {lot.unit}
      </span>
      <span
        className={`text-xs font-mono font-semibold min-w-[52px] text-right ${
          lot.riskLevel === 'critical' ? 'text-critical' : 'text-warn'
        }`}
      >
        {lot.daysToExpire}d left
      </span>
    </div>
  )
}
