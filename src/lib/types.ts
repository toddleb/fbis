export type Category = 'produce' | 'dairy' | 'protein' | 'grains' | 'canned' | 'frozen' | 'bakery'
export type Condition = 'good' | 'damaged' | 'near-expiry'
export type RiskLevel = 'critical' | 'warning' | 'safe'
export type HerRating = 'green' | 'yellow' | 'red'

export const DOLLAR_PER_LB = 1.93
export const LBS_PER_MEAL = 1.2

export const CATEGORY_LABELS: Record<Category, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  protein: 'Protein',
  grains: 'Grains',
  canned: 'Canned',
  frozen: 'Frozen',
  bakery: 'Bakery',
}

export const HER_LABELS: Record<HerRating, string> = {
  green: 'Eat Plenty',
  yellow: 'Eat Some',
  red: 'Eat Rarely',
}

export const HER_COLORS: Record<HerRating, { text: string; bg: string; border: string }> = {
  green: { text: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  yellow: { text: '#CA8A04', bg: '#FEFCE8', border: '#FDE68A' },
  red: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
}

export const DEFAULT_HER_RATING: Record<Category, HerRating> = {
  produce: 'green',
  dairy: 'yellow',
  protein: 'yellow',
  grains: 'yellow',
  canned: 'yellow',
  frozen: 'yellow',
  bakery: 'yellow',
}

export type Lot = {
  lotId: string
  itemName: string
  category: Category
  quantity: number
  unit: string
  expirationDate: string
  receivedDate: string
  location: string
  condition: Condition
  source: string
  herRating: HerRating
}

export type RiskLot = Lot & {
  daysToExpire: number
  riskLevel: RiskLevel
}

export type Recommendation = {
  id: string
  lotId: string
  action: string
  detail: string
  impactMeals: number
  impactDollars: number
  targetLocation: string
  urgency: RiskLevel
  executed: boolean
}

export type InventoryStats = {
  totalWeight: number
  atRiskWeight: number
  criticalWeight: number
  mealsPotential: number
  dollarValueAtRisk: number
  wastePercent: number
  lotCount: number
}

export type HerStats = {
  greenLbs: number
  yellowLbs: number
  redLbs: number
  greenPct: number
  yellowPct: number
  redPct: number
}

export type LocationEquity = {
  location: string
  inventoryLbs: number
  weeklyDemandLbs: number
  supplyRatio: number
  gapLbs: number
  populationServed: number
}

export type DistributionItem = {
  lotId: string
  itemName: string
  category: Category
  quantity: number
  riskLevel: RiskLevel
}
