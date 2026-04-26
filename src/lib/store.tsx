'use client'

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  Lot,
  RiskLot,
  Recommendation,
  InventoryStats,
  HerStats,
  RiskLevel,
  DistributionItem,
  LocationEquity,
  DOLLAR_PER_LB,
  LBS_PER_MEAL,
  DEFAULT_HER_RATING,
} from './types'
import { INITIAL_LOTS, LOCATION_DEMAND } from './data'
import { generateRecommendations } from './recommendations'

const STORAGE_KEY = 'fbis-demo-state'

type State = {
  lots: Lot[]
  executedActionIds: Set<string>
  totalMealsSaved: number
  distributionCount: number
  nextLotSeq: number
}

type Action =
  | { type: 'ADD_LOT'; lot: Lot }
  | { type: 'EXECUTE_ACTION'; id: string; lotId: string; mealsSaved: number }
  | { type: 'COMPLETE_DISTRIBUTION'; items: DistributionItem[] }
  | { type: 'HYDRATE'; state: State }
  | { type: 'RESET' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_LOT':
      return {
        ...state,
        lots: [action.lot, ...state.lots],
        nextLotSeq: state.nextLotSeq + 1,
      }
    case 'EXECUTE_ACTION': {
      const next = new Set(state.executedActionIds)
      next.add(action.id)
      return {
        ...state,
        lots: state.lots.filter(l => l.lotId !== action.lotId),
        executedActionIds: next,
        totalMealsSaved: state.totalMealsSaved + action.mealsSaved,
      }
    }
    case 'COMPLETE_DISTRIBUTION': {
      const totalWeight = action.items.reduce((s, i) => s + i.quantity, 0)
      const mealsSaved = Math.floor(totalWeight / LBS_PER_MEAL)
      const updatedLots = state.lots.map(lot => {
        const item = action.items.find(i => i.lotId === lot.lotId)
        if (!item) return lot
        return { ...lot, quantity: Math.max(0, lot.quantity - item.quantity) }
      })
      return {
        ...state,
        lots: updatedLots.filter(l => l.quantity > 0),
        totalMealsSaved: state.totalMealsSaved + mealsSaved,
        distributionCount: state.distributionCount + 1,
      }
    }
    case 'HYDRATE':
      return action.state
    case 'RESET':
      return makeInitialState()
  }
}

function makeInitialState(): State {
  return {
    lots: INITIAL_LOTS,
    executedActionIds: new Set<string>(),
    totalMealsSaved: 0,
    distributionCount: 0,
    nextLotSeq: INITIAL_LOTS.length + 1,
  }
}

function migrateLot(lot: Lot): Lot {
  if (!lot.herRating) {
    return { ...lot, herRating: DEFAULT_HER_RATING[lot.category] ?? 'yellow' }
  }
  return lot
}

function loadState(): State | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      ...parsed,
      lots: (parsed.lots ?? []).map(migrateLot),
      executedActionIds: new Set(parsed.executedActionIds),
    }
  } catch {
    return null
  }
}

function saveState(state: State) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        executedActionIds: Array.from(state.executedActionIds),
      }),
    )
  } catch {}
}

function getDaysToExpire(expirationDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(expirationDate)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getRiskLevel(days: number): RiskLevel {
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  return 'safe'
}

function enrichLot(lot: Lot): RiskLot {
  const daysToExpire = getDaysToExpire(lot.expirationDate)
  return { ...lot, daysToExpire, riskLevel: getRiskLevel(daysToExpire) }
}

type StoreContext = {
  lots: Lot[]
  riskLots: RiskLot[]
  recommendations: Recommendation[]
  stats: InventoryStats
  herStats: HerStats
  equity: LocationEquity[]
  totalMealsSaved: number
  distributionCount: number
  nextLotSeq: number
  addLot: (lot: Lot) => void
  executeAction: (id: string, lotId: string, mealsSaved: number) => void
  completeDistribution: (items: DistributionItem[]) => void
  resetDemo: () => void
}

const Ctx = createContext<StoreContext | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = loadState()
    if (saved) dispatch({ type: 'HYDRATE', state: saved })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) saveState(state)
  }, [state, hydrated])

  const value = useMemo<StoreContext>(() => {
    const riskLots = state.lots
      .map(enrichLot)
      .sort((a, b) => a.daysToExpire - b.daysToExpire)

    const allRecs = generateRecommendations(riskLots)
    const recommendations = allRecs.map(r => ({
      ...r,
      executed: state.executedActionIds.has(r.id),
    }))

    const totalWeight = state.lots.reduce((s, l) => s + l.quantity, 0)
    const criticalLots = riskLots.filter(l => l.riskLevel === 'critical')
    const atRiskLots = riskLots.filter(l => l.riskLevel !== 'safe')
    const criticalWeight = criticalLots.reduce((s, l) => s + l.quantity, 0)
    const atRiskWeight = atRiskLots.reduce((s, l) => s + l.quantity, 0)
    const mealsPotential = Math.floor(totalWeight / LBS_PER_MEAL)

    const stats: InventoryStats = {
      totalWeight,
      atRiskWeight,
      criticalWeight,
      mealsPotential,
      dollarValueAtRisk: Math.round(atRiskWeight * DOLLAR_PER_LB),
      wastePercent:
        totalWeight > 0
          ? Math.round((criticalWeight / totalWeight) * 1000) / 10
          : 0,
      lotCount: state.lots.length,
    }

    const greenLbs = state.lots.filter(l => l.herRating === 'green').reduce((s, l) => s + l.quantity, 0)
    const yellowLbs = state.lots.filter(l => l.herRating === 'yellow').reduce((s, l) => s + l.quantity, 0)
    const redLbs = state.lots.filter(l => l.herRating === 'red').reduce((s, l) => s + l.quantity, 0)
    const herStats: HerStats = {
      greenLbs,
      yellowLbs,
      redLbs,
      greenPct: totalWeight > 0 ? Math.round((greenLbs / totalWeight) * 100) : 0,
      yellowPct: totalWeight > 0 ? Math.round((yellowLbs / totalWeight) * 100) : 0,
      redPct: totalWeight > 0 ? Math.round((redLbs / totalWeight) * 100) : 0,
    }

    const equity: LocationEquity[] = LOCATION_DEMAND.map(ld => {
      const inventoryLbs = riskLots
        .filter(l => l.location === ld.location)
        .reduce((s, l) => s + l.quantity, 0)
      const supplyRatio =
        ld.weeklyDemandLbs > 0 ? inventoryLbs / ld.weeklyDemandLbs : 0
      return {
        location: ld.location,
        inventoryLbs,
        weeklyDemandLbs: ld.weeklyDemandLbs,
        supplyRatio: Math.round(supplyRatio * 100) / 100,
        gapLbs: inventoryLbs - ld.weeklyDemandLbs,
        populationServed: ld.populationServed,
      }
    })

    return {
      lots: state.lots,
      riskLots,
      recommendations,
      stats,
      herStats,
      equity,
      totalMealsSaved: state.totalMealsSaved,
      distributionCount: state.distributionCount,
      nextLotSeq: state.nextLotSeq,
      addLot: (lot: Lot) => dispatch({ type: 'ADD_LOT', lot }),
      executeAction: (id: string, lotId: string, mealsSaved: number) =>
        dispatch({ type: 'EXECUTE_ACTION', id, lotId, mealsSaved }),
      completeDistribution: (items: DistributionItem[]) =>
        dispatch({ type: 'COMPLETE_DISTRIBUTION', items }),
      resetDemo: () => dispatch({ type: 'RESET' }),
    }
  }, [state])

  return <Ctx value={value}>{children}</Ctx>
}

export function useStore(): StoreContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
