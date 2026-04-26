'use client'

import { useState, type FormEvent } from 'react'
import { useStore } from '@/lib/store'
import { Category, Lot, CATEGORY_LABELS, HerRating, HER_LABELS, DEFAULT_HER_RATING } from '@/lib/types'
import { LOCATIONS } from '@/lib/data'

export default function IntakePage() {
  const { addLot, nextLotSeq } = useStore()
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    itemName: '',
    category: 'produce' as Category,
    quantity: '',
    unit: 'lbs',
    expirationDate: '',
    location: LOCATIONS[0] as string,
    source: '',
    herRating: DEFAULT_HER_RATING['produce'] as HerRating,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const lot: Lot = {
      lotId: `LOT-${String(nextLotSeq).padStart(3, '0')}`,
      itemName: form.itemName,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      expirationDate: form.expirationDate,
      receivedDate: new Date().toISOString().split('T')[0],
      location: form.location,
      condition: 'good',
      source: form.source || 'Manual Entry',
      herRating: form.herRating,
    }

    addLot(lot)
    setSuccess(true)
    setForm({
      itemName: '',
      category: 'produce',
      quantity: '',
      unit: 'lbs',
      expirationDate: '',
      location: LOCATIONS[0],
      source: '',
      herRating: DEFAULT_HER_RATING['produce'],
    })

    setTimeout(() => setSuccess(false), 3000)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => {
      const next = { ...f, [key]: e.target.value }
      if (key === 'category') {
        next.herRating = DEFAULT_HER_RATING[e.target.value as Category] ?? 'yellow'
      }
      return next
    })

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-heading text-xl font-semibold">Intake</h1>
        <p className="text-muted text-sm mt-0.5">Log a new donation or incoming lot</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-safe/10 border border-safe/20 animate-fade-up">
          <p className="text-safe text-sm font-medium">Lot created successfully</p>
          <p className="text-safe/70 text-xs mt-0.5">Added to inventory and risk monitoring</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-panel rounded-xl border border-edge p-6 space-y-5 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Item Name <span className="text-critical">*</span>
            </span>
            <input
              type="text"
              required
              value={form.itemName}
              onChange={set('itemName')}
              placeholder="e.g. Fresh Milk (2%)"
              className="input-field"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Category <span className="text-critical">*</span>
            </span>
            <select value={form.category} onChange={set('category')} className="input-field">
              {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Quantity <span className="text-critical">*</span>
            </span>
            <input
              type="number"
              required
              min="1"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder="0"
              className="input-field font-mono"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Unit
            </span>
            <select value={form.unit} onChange={set('unit')} className="input-field">
              <option value="lbs">lbs</option>
              <option value="cases">cases</option>
              <option value="units">units</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Expiration Date <span className="text-critical">*</span>
            </span>
            <input
              type="date"
              required
              value={form.expirationDate}
              onChange={set('expirationDate')}
              className="input-field font-mono"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Storage Location <span className="text-critical">*</span>
            </span>
            <select value={form.location} onChange={set('location')} className="input-field">
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              HER Nutrition Rating
            </span>
            <select value={form.herRating} onChange={set('herRating')} className="input-field">
              {(['green', 'yellow', 'red'] as HerRating[]).map(rating => (
                <option key={rating} value={rating}>
                  {rating.charAt(0).toUpperCase() + rating.slice(1)} ({HER_LABELS[rating]})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted mb-1.5 block">
              Donation Source
            </span>
            <input
              type="text"
              value={form.source}
              onChange={set('source')}
              placeholder="e.g. Fry's Food, Bashas'"
              className="input-field"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-edge/50">
          <button
            type="submit"
            className="bg-indigo hover:bg-indigo/90 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Create Lot
          </button>
        </div>
      </form>
    </div>
  )
}
