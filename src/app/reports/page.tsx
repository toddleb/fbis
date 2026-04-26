'use client'

import { useStore } from '@/lib/store'
import { Category, CATEGORY_LABELS, HER_LABELS, HER_COLORS, HerRating, LBS_PER_MEAL, DOLLAR_PER_LB } from '@/lib/types'

export default function ReportsPage() {
  const { lots, stats, herStats, equity, totalMealsSaved, distributionCount } = useStore()

  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const generatedAt = now.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // --- Category breakdown ---
  const categoryMap = new Map<Category, { lots: number; weight: number }>()
  for (const lot of lots) {
    const entry = categoryMap.get(lot.category) ?? { lots: 0, weight: 0 }
    entry.lots += 1
    entry.weight += lot.quantity
    categoryMap.set(lot.category, entry)
  }
  const totalCategoryWeight = lots.reduce((s, l) => s + l.quantity, 0)
  const categoryRows = Array.from(categoryMap.entries())
    .map(([cat, data]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      lots: data.lots,
      weight: data.weight,
      meals: Math.floor(data.weight / LBS_PER_MEAL),
      pct: totalCategoryWeight > 0 ? Math.round((data.weight / totalCategoryWeight) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.weight - a.weight)

  // --- KPIs ---
  const totalDistributedLbs = Math.round(totalMealsSaved * LBS_PER_MEAL)
  const dollarValue = Math.round(totalMealsSaved * LBS_PER_MEAL * DOLLAR_PER_LB)

  // --- Equity (filtered) ---
  const filteredEquity = equity.filter(e => e.populationServed > 0)

  // --- HER rows ---
  const herRows: { rating: HerRating; label: string; lbs: number; pct: number }[] = [
    { rating: 'green', label: HER_LABELS.green, lbs: herStats.greenLbs, pct: herStats.greenPct },
    { rating: 'yellow', label: HER_LABELS.yellow, lbs: herStats.yellowLbs, pct: herStats.yellowPct },
    { rating: 'red', label: HER_LABELS.red, lbs: herStats.redLbs, pct: herStats.redPct },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading text-xl font-semibold">TEFAP Compliance Report</h1>
          <p className="text-muted text-sm mt-0.5">{monthYear}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="text-[13px] font-medium text-indigo bg-indigo/10 hover:bg-indigo/20 px-4 py-2 rounded-lg transition-colors cursor-pointer print:hidden flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="8" width="8" height="4.5" rx="0.5" />
            <path d="M3 10H1.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H11" />
            <path d="M3 4V1.5h8V4" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Distributed',
            value: `${totalMealsSaved.toLocaleString()} meals`,
            sub: `${totalDistributedLbs.toLocaleString()} lbs`,
            accent: 'text-accent',
            border: 'border-t-accent',
          },
          {
            label: 'Dollar Value',
            value: `$${dollarValue.toLocaleString()}`,
            sub: `at $${DOLLAR_PER_LB}/lb`,
            accent: 'text-indigo',
            border: 'border-t-indigo',
          },
          {
            label: 'Distributions Completed',
            value: distributionCount.toLocaleString(),
            sub: 'total events',
            accent: 'text-indigo',
            border: 'border-t-indigo',
          },
          {
            label: 'Inventory On Hand',
            value: `${stats.totalWeight.toLocaleString()} lbs`,
            sub: `${stats.lotCount} lots`,
            accent: 'text-heading',
            border: 'border-t-edge',
          },
        ].map((kpi, i) => (
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

      {/* Category Breakdown */}
      <div className="animate-fade-up mb-8" style={{ animationDelay: '200ms' }}>
        <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="text-heading text-sm font-medium">Category Breakdown</h2>
            <p className="text-muted text-[11px] mt-0.5">Current inventory grouped by food category</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-edge bg-surface/50">
                  <th className="text-left px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Category</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Lots</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Weight (lbs)</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Meals Equiv.</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map(row => (
                  <tr key={row.category} className="border-b border-edge/30 last:border-b-0 hover:bg-panel-hover/30 transition-colors">
                    <td className="px-5 py-3 text-heading font-medium">{row.label}</td>
                    <td className="px-5 py-3 text-body text-right font-mono">{row.lots}</td>
                    <td className="px-5 py-3 text-body text-right font-mono">{row.weight.toLocaleString()}</td>
                    <td className="px-5 py-3 text-body text-right font-mono">{row.meals.toLocaleString()}</td>
                    <td className="px-5 py-3 text-body text-right font-mono">{row.pct}%</td>
                  </tr>
                ))}
                {categoryRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted">No inventory data</td>
                  </tr>
                )}
              </tbody>
              {categoryRows.length > 0 && (
                <tfoot>
                  <tr className="border-t border-edge bg-surface/30">
                    <td className="px-5 py-3 text-heading font-semibold">Total</td>
                    <td className="px-5 py-3 text-heading text-right font-mono font-semibold">{stats.lotCount}</td>
                    <td className="px-5 py-3 text-heading text-right font-mono font-semibold">{totalCategoryWeight.toLocaleString()}</td>
                    <td className="px-5 py-3 text-heading text-right font-mono font-semibold">{Math.floor(totalCategoryWeight / LBS_PER_MEAL).toLocaleString()}</td>
                    <td className="px-5 py-3 text-heading text-right font-mono font-semibold">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* HER Nutrition Quality */}
      <div className="animate-fade-up mb-8" style={{ animationDelay: '300ms' }}>
        <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="text-heading text-sm font-medium">HER Nutrition Quality</h2>
            <p className="text-muted text-[11px] mt-0.5">Healthy Eating Research food rating distribution</p>
          </div>

          <div className="p-5 space-y-4">
            {herRows.map(row => {
              const colors = HER_COLORS[row.rating]
              return (
                <div key={row.rating}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: colors.text }}
                      />
                      <span className="text-heading text-[13px] font-medium">
                        {row.rating.charAt(0).toUpperCase() + row.rating.slice(1)}
                      </span>
                      <span className="text-muted text-[11px]">({row.label})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-body text-xs font-mono">{row.lbs.toLocaleString()} lbs</span>
                      <span className="text-heading text-xs font-mono font-semibold min-w-[40px] text-right">{row.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-edge/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${row.pct}%`, backgroundColor: colors.text }}
                    />
                  </div>
                </div>
              )
            })}

            <div className="pt-3 mt-3 border-t border-edge">
              <p className="text-heading text-[13px]">
                Nutrition Quality Score:{' '}
                <span className="font-semibold font-mono" style={{ color: HER_COLORS.green.text }}>
                  {herStats.greenPct}% green
                </span>
                <span className="text-muted text-[11px] ml-2">(higher is better)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Distribution */}
      <div className="animate-fade-up mb-8" style={{ animationDelay: '400ms' }}>
        <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="text-heading text-sm font-medium">Location Distribution</h2>
            <p className="text-muted text-[11px] mt-0.5">Supply and demand across service areas</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-edge bg-surface/50">
                  <th className="text-left px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Location</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Inventory (lbs)</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Weekly Demand</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Supply Ratio</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Gap (lbs)</th>
                  <th className="text-right px-5 py-3 text-muted text-[10px] uppercase tracking-[0.12em] font-semibold">Pop. Served</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquity.map(loc => {
                  const ratioColor =
                    loc.supplyRatio < 0.7
                      ? 'text-critical'
                      : loc.supplyRatio < 1.0
                        ? 'text-warn'
                        : 'text-safe'
                  return (
                    <tr key={loc.location} className="border-b border-edge/30 last:border-b-0 hover:bg-panel-hover/30 transition-colors">
                      <td className="px-5 py-3 text-heading font-medium">{loc.location}</td>
                      <td className="px-5 py-3 text-body text-right font-mono">{loc.inventoryLbs.toLocaleString()}</td>
                      <td className="px-5 py-3 text-body text-right font-mono">{loc.weeklyDemandLbs.toLocaleString()}</td>
                      <td className={`px-5 py-3 text-right font-mono font-semibold ${ratioColor}`}>{loc.supplyRatio.toFixed(2)}x</td>
                      <td className="px-5 py-3 text-body text-right font-mono">{loc.gapLbs >= 0 ? '+' : ''}{loc.gapLbs.toLocaleString()}</td>
                      <td className="px-5 py-3 text-body text-right font-mono">{loc.populationServed.toLocaleString()}</td>
                    </tr>
                  )
                })}
                {filteredEquity.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">No location data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="animate-fade-up" style={{ animationDelay: '500ms' }}>
        <div className="bg-surface rounded-xl border border-edge p-5 text-center space-y-1">
          <p className="text-muted text-[11px]">Generated: {generatedAt}</p>
          <p className="text-heading text-[13px] font-medium">Flagstaff Family Food Center — FBIS Report</p>
          <p className="text-muted text-[11px]">Meals calculated at {LBS_PER_MEAL} lbs per meal (Feeding America standard)</p>
        </div>
      </div>
    </div>
  )
}
