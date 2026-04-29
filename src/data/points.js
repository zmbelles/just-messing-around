// Points awarded per finishing position.
//
// Heat:    100, 94, 89, 85, 82, 80, then -1 per place.  No field bonus.
// Feature: 200, 175, 155, 140, then -10 per place to 0.  +1 per entrant (all positions).

const HEAT_TOP    = [100, 94, 89, 85, 82, 80]
const FEATURE_TOP = [200, 175, 155, 140]

export function heatPoints(pos) {
  if (pos <= HEAT_TOP.length) return HEAT_TOP[pos - 1]
  return Math.max(0, HEAT_TOP[HEAT_TOP.length - 1] - (pos - HEAT_TOP.length))
}

export function featurePoints(pos, fieldSize) {
  let base
  if (pos <= FEATURE_TOP.length) {
    base = FEATURE_TOP[pos - 1]
  } else {
    base = Math.max(0, FEATURE_TOP[FEATURE_TOP.length - 1] - (pos - FEATURE_TOP.length) * 10)
  }
  return base + fieldSize
}

const HEAT_NAMES    = new Set(['Heat', 'Heat 1', 'Heat 2'])
const FEATURE_NAMES = new Set(['Final', 'Feature'])

export function isHeatSession(name)    { return HEAT_NAMES.has(name) }
export function isFeatureSession(name) { return FEATURE_NAMES.has(name) }

// Compute the per-driver point award for a single scoring session.
// Returns { [kart-key]: points }. DNFs earn 0.
export function computeSessionPoints(results, sessionName) {
  const isHeat    = isHeatSession(sessionName)
  const isFeature = isFeatureSession(sessionName)
  if (!isHeat && !isFeature) return {}
  const fieldSize = results.length
  const out = {}
  for (const r of results) {
    if (r.dnf) { out[String(r.kart)] = 0; continue }
    out[String(r.kart)] = isHeat ? heatPoints(r.pos) : featurePoints(r.pos, fieldSize)
  }
  return out
}

// Returns updated championshipPoints array, sorted by points desc.
// DNF drivers still appear in results with a position — they earn 0 by convention.
export function awardSessionPoints(championshipPoints, results, sessionName) {
  const awards = computeSessionPoints(results, sessionName)
  if (Object.keys(awards).length === 0) return championshipPoints

  const updated = championshipPoints.map(row => {
    const pts = awards[String(row.kart)]
    if (pts == null) return row
    return { ...row, points: row.points + pts }
  })

  updated.sort((a, b) => b.points - a.points)
  return updated.map((r, i) => ({ ...r, pos: i + 1 }))
}
