import { RiskLot, Recommendation, DOLLAR_PER_LB, LBS_PER_MEAL } from './types'

const REDISTRIBUTION_TARGETS: Record<string, string> = {
  'Main Warehouse': 'Eastside Community Center',
  'Southside Pantry': 'Doney Park Outreach',
  'Eastside Community Center': 'Southside Pantry',
  'Doney Park Outreach': 'Eastside Community Center',
}

const ACTION_TEMPLATES = {
  critical: [
    'Move {qty} lbs {item} to {target} immediately',
    'Distribute {qty} lbs {item} via mobile route today',
    'Rush {qty} lbs {item} for same-day pantry distribution',
  ],
  warning: [
    'Pre-stage {qty} lbs {item} for next distribution cycle',
    'Allocate {qty} lbs {item} to partner agency requests',
    'Move {qty} lbs {item} to higher-traffic location',
  ],
}

export function generateRecommendations(riskLots: RiskLot[]): Recommendation[] {
  const actionable = riskLots.filter(l => l.riskLevel !== 'safe')

  return actionable
    .sort((a, b) => a.daysToExpire - b.daysToExpire)
    .map((lot, i) => {
      const templates = ACTION_TEMPLATES[lot.riskLevel === 'critical' ? 'critical' : 'warning']
      const target = REDISTRIBUTION_TARGETS[lot.location] ?? 'Eastside Community Center'
      const template = templates[i % templates.length]
      const action = template
        .replace('{qty}', lot.quantity.toLocaleString())
        .replace('{item}', lot.itemName)
        .replace('{target}', target)

      const impactMeals = Math.floor(lot.quantity / LBS_PER_MEAL)
      const impactDollars = Math.round(lot.quantity * DOLLAR_PER_LB)

      return {
        id: `rec-${lot.lotId}`,
        lotId: lot.lotId,
        action,
        detail: `${lot.daysToExpire} day${lot.daysToExpire !== 1 ? 's' : ''} until expiration. Currently at ${lot.location}.`,
        impactMeals,
        impactDollars,
        targetLocation: target,
        urgency: lot.riskLevel,
        executed: false,
      }
    })
}
