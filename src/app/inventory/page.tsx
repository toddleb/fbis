'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Category, RiskLevel, CATEGORY_LABELS, HerRating, HER_COLORS, HER_LABELS } from '@/lib/types'

export default function InventoryPage() {
  const { riskLots } = useStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')
  const [herFilter, setHerFilter] = useState<HerRating | 'all'>('all')

  const filtered = riskLots.filter(lot => {
    if (search && !lot.itemName.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && lot.category !== categoryFilter) return false
    if (riskFilter !== 'all' && lot.riskLevel !== riskFilter) return false
    if (herFilter !== 'all' && lot.herRating !== herFilter) return false
    return true
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-heading text-xl font-semibold">Inventory</h1>
        <p className="text-muted text-sm mt-0.5">
          Lot-level tracking · {riskLots.length} active lots
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field !w-64"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
          className="input-field !w-auto"
        >
          <option value="all">All Categories</option>
          {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
          className="input-field !w-auto"
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical (≤3d)</option>
          <option value="warning">Warning (4-7d)</option>
          <option value="safe">Safe (&gt;7d)</option>
        </select>
        <select
          value={herFilter}
          onChange={e => setHerFilter(e.target.value as HerRating | 'all')}
          className="input-field !w-auto"
        >
          <option value="all">All HER Ratings</option>
          <option value="green">Green (Eat Plenty)</option>
          <option value="yellow">Yellow (Eat Some)</option>
          <option value="red">Red (Eat Rarely)</option>
        </select>
        <span className="text-muted text-xs ml-auto font-mono">{filtered.length} lots</span>
      </div>

      {/* Table */}
      <div className="bg-panel rounded-xl border border-edge overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge text-[11px] uppercase tracking-wider text-muted">
                <th className="text-left px-5 py-3.5 font-medium">Lot</th>
                <th className="text-left px-5 py-3.5 font-medium">Item</th>
                <th className="text-left px-5 py-3.5 font-medium">Category</th>
                <th className="text-right px-5 py-3.5 font-medium">Qty</th>
                <th className="text-left px-5 py-3.5 font-medium">Expires</th>
                <th className="text-right px-5 py-3.5 font-medium">Days Left</th>
                <th className="text-left px-5 py-3.5 font-medium">Location</th>
                <th className="text-left px-5 py-3.5 font-medium">Source</th>
                <th className="text-left px-5 py-3.5 font-medium">Received</th>
                <th className="text-center px-5 py-3.5 font-medium">Risk</th>
                <th className="text-center px-5 py-3.5 font-medium">HER</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lot, i) => (
                <tr
                  key={lot.lotId}
                  className="border-b border-edge/30 last:border-b-0 hover:bg-panel-hover/30 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <td className="px-5 py-3 font-mono text-muted text-xs">{lot.lotId}</td>
                  <td className="px-5 py-3 text-heading font-medium">{lot.itemName}</td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-edge/40 text-body capitalize">
                      {lot.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-heading tabular-nums">
                    {lot.quantity}
                    <span className="text-muted ml-1 text-xs">{lot.unit}</span>
                  </td>
                  <td className="px-5 py-3 text-muted font-mono text-xs">
                    {new Date(lot.expirationDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-mono font-semibold tabular-nums ${
                      lot.riskLevel === 'critical'
                        ? 'text-critical'
                        : lot.riskLevel === 'warning'
                          ? 'text-warn'
                          : 'text-safe'
                    }`}
                  >
                    {lot.daysToExpire}d
                  </td>
                  <td className="px-5 py-3 text-muted text-xs">{lot.location}</td>
                  <td className="px-5 py-3 text-muted text-xs">{lot.source}</td>
                  <td className="px-5 py-3 text-muted font-mono text-xs">
                    {new Date(lot.receivedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                        lot.riskLevel === 'critical'
                          ? 'bg-critical/15 text-critical'
                          : lot.riskLevel === 'warning'
                            ? 'bg-warn/15 text-warn'
                            : 'bg-safe/15 text-safe'
                      }`}
                    >
                      {lot.riskLevel === 'critical'
                        ? 'Critical'
                        : lot.riskLevel === 'warning'
                          ? 'Warning'
                          : 'Safe'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className="text-[10px] font-medium px-2 py-1 rounded-full capitalize"
                      style={{
                        color: HER_COLORS[lot.herRating].text,
                        backgroundColor: HER_COLORS[lot.herRating].bg,
                        border: `1px solid ${HER_COLORS[lot.herRating].border}`,
                      }}
                    >
                      {lot.herRating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">No lots match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
