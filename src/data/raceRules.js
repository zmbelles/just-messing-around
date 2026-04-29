// ─────────────────────────────────────────────────────────────
//  Race Rules — failure odds, crash odds, event triggers,
//  event distributions, and crash damage logic.
//
//  All functions accept (manufacturer, championship) objects
//  from gameState so callers don't have to pre-compute flags.
// ─────────────────────────────────────────────────────────────

// ── Failure odds ──────────────────────────────────────────────
// Returns probability (0-1) of a mechanical failure per session.
export function getFailureOdds(manufacturer, championship) {
  const isIgnite = manufacturer.id === 'margay'
  const is66     = championship.id === 'route66'
  if (isIgnite && is66) return 0.0875
  return 0.0135
}

// ── Crash odds ────────────────────────────────────────────────
// Returns probability (0-1) of a crash for a given grid position.
// gridPosition is 1-based (1 = pole). totalDrivers is field size.
// Crashes only occur in Heat and Feature/Final sessions.
export function getCrashOdds(manufacturer, championship, gridPosition, totalDrivers) {
  const isIgnite = manufacturer.id === 'margay'
  const is66     = championship.id === 'route66'

  if (isIgnite && is66) {
    // Positions better than 35th → use standard scale
    if (gridPosition < 35) return standardCrashOdds(gridPosition, totalDrivers)
    // Positions 35 and worse → 10–55% sliding scale
    const worst    = totalDrivers
    const range    = worst - 35
    const t        = range > 0 ? (gridPosition - 35) / range : 1
    return 0.10 + (0.55 - 0.10) * Math.min(1, Math.max(0, t))
  }

  return standardCrashOdds(gridPosition, totalDrivers)
}

function standardCrashOdds(gridPosition, totalDrivers) {
  // 3.5% at front, 35% at back
  const t = totalDrivers > 1 ? (gridPosition - 1) / (totalDrivers - 1) : 0
  return 0.035 + (0.35 - 0.035) * t
}

// ── Event triggering ──────────────────────────────────────────
// Returns true if a random event MUST fire this session.
// eventsTriggered = number of events that have already fired this weekend.
export function mustTriggerEvent(sessionIndex, totalSessions, eventsTriggered, championship) {
  const is66       = championship.id === 'route66'
  const remaining  = totalSessions - sessionIndex  // sessions left including this one

  if (is66) {
    // Route 66 needs at least 2 events; force the last 2 sessions if short
    if (remaining <= 2 && eventsTriggered < 2 - (2 - remaining)) return true
  } else {
    // Others need at least 1 event; force the last session if none yet
    if (remaining <= 1 && eventsTriggered < 1) return true
  }
  return false
}

// 30% per-session event chance (independent of crash roll).
export function rollEventChance() {
  return Math.random() < 0.30
}

// 5% per-session crash chance (only applies to Heat/Final sessions).
export function rollCrashChance() {
  return Math.random() < 0.05
}

// ── Event distribution ────────────────────────────────────────
// Returns {good, neutral, bad} weights summing to 100 based on
// the manufacturer's difficulty tier (Easy/Medium/Hard/Impossible).
export function getEventDistribution(manufacturer) {
  switch (manufacturer.difficulty) {
    case 'Easy':       return { good: 50, neutral: 40, bad: 10 }
    case 'Medium':     return { good: 45, neutral: 35, bad: 20 }
    case 'Hard':       return { good: 40, neutral: 30, bad: 30 }
    case 'Impossible': return { good: 30, neutral: 30, bad: 40 }
    default:           return { good: 45, neutral: 35, bad: 20 }
  }
}

// Picks 'good' | 'neutral' | 'bad' based on manufacturer distribution.
export function rollEventTier(manufacturer) {
  const dist  = getEventDistribution(manufacturer)
  const roll  = Math.random() * 100
  if (roll < dist.good)               return 'good'
  if (roll < dist.good + dist.neutral) return 'neutral'
  return 'bad'
}

// ── Crash damage ─────────────────────────────────────────────
// Returns a crash intensity 0–1.
// Harder manufacturers are weighted toward higher intensity.
export function rollCrashIntensity(manufacturer) {
  const weights = intensityWeights(manufacturer.difficulty)
  return weightedRandom(weights)
}

function intensityWeights(difficulty) {
  switch (difficulty) {
    // [mild, moderate, heavy, severe, catastrophic]
    case 'Easy':       return [0.45, 0.30, 0.15, 0.07, 0.03]
    case 'Medium':     return [0.30, 0.30, 0.20, 0.13, 0.07]
    case 'Hard':       return [0.20, 0.25, 0.25, 0.18, 0.12]
    case 'Impossible': return [0.10, 0.18, 0.25, 0.25, 0.22]
    default:           return [0.30, 0.30, 0.20, 0.13, 0.07]
  }
}

// Intensity labels for display
export const CRASH_INTENSITY_LABELS = ['Mild', 'Moderate', 'Heavy', 'Severe', 'Catastrophic']

// Returns the intensity index (0=Mild … 4=Catastrophic) as a weighted roll.
function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

// ── Crash damage parts ────────────────────────────────────────
// Each tier can damage 1–N parts. Returns an array of partsKey strings.
// intensityIndex: 0=mild … 4=catastrophic
export function getCrashDamage(intensityIndex, manufacturer, championship) {
  const is66 = championship.id === 'route66'
  const chainType = is66 ? 'chain219' : 'chain35'

  // At catastrophic intensity, frame is destroyed if Margay in 66 or any hard+ chassis
  const frameBend =
    intensityIndex === 4 &&
    (manufacturer.id === 'margay' || manufacturer.difficulty === 'Hard' || manufacturer.difficulty === 'Impossible')

  let pools = DAMAGE_POOLS_BY_INTENSITY[intensityIndex].map(part =>
    part === 'chain35' || part === 'chain219' ? chainType : part
  )
  // Remove duplicate chains if both were in the pool
  pools = [...new Set(pools)]

  const count = damageCounts[intensityIndex]
  const parts = pickRandom(pools, count)

  if (frameBend && !parts.includes('frame')) parts.push('frame')
  return { parts, frameBent: frameBend }
}

// Parts that can be damaged per intensity level (subset of all breakable parts)
const DAMAGE_POOLS_BY_INTENSITY = [
  // Mild (0): cosmetic / minor
  ['frontBumper', 'rearBumper', 'sidePodLeft', 'sidePodRight', 'bumperClips'],
  // Moderate (1): bodywork + chain/sprocket risk
  ['frontBumper', 'rearBumper', 'sidePodLeft', 'sidePodRight', 'fairing', 'chain35', 'chain219', 'wheel'],
  // Heavy (2): structural + mechanical
  ['sidePodLeft', 'sidePodRight', 'fairing', 'wheel', 'spindleArmLeft', 'spindleArmRight', 'axle', 'chain35', 'chain219'],
  // Severe (3): all major parts including engine and tires
  ['wheel', 'axle', 'spindleArmLeft', 'spindleArmRight', 'tiresEquipped', 'engineEquipped', 'frame', 'fairing'],
  // Catastrophic (4): everything
  ['wheel', 'axle', 'spindleArmLeft', 'spindleArmRight', 'tiresEquipped', 'engineEquipped', 'frame'],
]

const damageCounts = [1, 2, 2, 3, 3]

function pickRandom(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
