'use client'

import { useStore } from '@/lib/store'
import { Recommendation } from '@/lib/types'

export default function ActionsPage() {
  const { recommendations, executeAction, totalMealsSaved } = useStore()

  const pending = recommendations.filter(r => !r.executed)
  const executed = recommendations.filter(r => r.executed)

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading text-xl font-semibold">Actions</h1>
          <p className="text-muted text-sm mt-0.5">AI-powered redistribution recommendations</p>
        </div>
        <div className="flex items-center gap-8">
          <StatBadge label="Pending" value={pending.length} color="text-warn" />
          <StatBadge label="Executed" value={executed.length} color="text-safe" />
          <StatBadge label="Meals Saved" value={totalMealsSaved.toLocaleString()} color="text-accent" />
        </div>
      </div>

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[11px] uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo" />
            </span>
            Pending Recommendations
          </h2>
          <div className="space-y-3">
            {pending.map((rec, i) => (
              <ActionCard key={rec.id} rec={rec} onExecute={executeAction} delay={i} />
            ))}
          </div>
        </section>
      )}

      {executed.length > 0 && (
        <section>
          <h2 className="text-[11px] uppercase tracking-wider text-muted mb-3">Executed</h2>
          <div className="space-y-2">
            {executed.map(rec => (
              <div
                key={rec.id}
                className="bg-panel rounded-xl border border-edge p-5 opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-safe text-sm">✓</span>
                    <p className="text-body text-sm line-through decoration-edge/60">
                      {rec.action}
                    </p>
                  </div>
                  <span className="text-accent/60 text-xs font-mono">
                    ~{rec.impactMeals.toLocaleString()} meals
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recommendations.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-heading text-lg">No recommendations</p>
          <p className="text-muted text-sm mt-1">All inventory is within safe expiration range</p>
        </div>
      )}
    </div>
  )
}

function ActionCard({
  rec,
  onExecute,
  delay,
}: {
  rec: Recommendation
  onExecute: (id: string, lotId: string, meals: number) => void
  delay: number
}) {
  return (
    <div
      className="bg-panel rounded-xl border border-edge hover:border-indigo/30 p-5 transition-all duration-200 animate-fade-up shadow-sm"
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                rec.urgency === 'critical' ? 'bg-critical' : 'bg-warn'
              }`}
            />
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                rec.urgency === 'critical' ? 'text-critical' : 'text-warn'
              }`}
            >
              {rec.urgency}
            </span>
            <span className="text-muted text-xs">·</span>
            <span className="text-muted text-[11px]">→ {rec.targetLocation}</span>
          </div>
          <p className="text-heading text-sm leading-relaxed">{rec.action}</p>
          <p className="text-muted text-xs mt-1.5">{rec.detail}</p>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-accent text-sm font-mono font-semibold whitespace-nowrap">
              ~{rec.impactMeals.toLocaleString()} meals
            </span>
            <p className="text-muted text-[10px] font-mono mt-0.5">
              (${rec.impactDollars.toLocaleString()})
            </p>
          </div>
          <button
            onClick={() => onExecute(rec.id, rec.lotId, rec.impactMeals)}
            className="bg-indigo/10 hover:bg-indigo/20 text-indigo text-[12px] font-medium px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Execute Action
          </button>
        </div>
      </div>
    </div>
  )
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="text-right">
      <p className={`text-lg font-semibold font-mono tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  )
}
