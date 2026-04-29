// Optimal kart setup per track + weather. Each setup defines:
//   frontTeeth, rearTeeth         — sprocket tooth counts
//   frontTrackWidth, rearTrackWidth (cm)
//   rideHeight                    — front shim count / ride-height notches
//
// Norway / Club uses #35 chain (low-tooth front). Route 66 + Ignite use #219.
// Wet setups: lower front teeth (longer gear), wider track, taller ride height.

const TRACK_SETUPS = {
  'Norway Motorsports Park': {
    dry: { frontTeeth: 14, rearTeeth: 74, frontTrackWidth: 44.0, rearTrackWidth: 53.0, rideHeight: 4 },
    wet: { frontTeeth: 13, rearTeeth: 78, frontTrackWidth: 46.5, rearTrackWidth: 55.5, rideHeight: 6 },
  },
  '61 Kartway': {
    dry: { frontTeeth: 12, rearTeeth: 84, frontTrackWidth: 45.0, rearTrackWidth: 55.0, rideHeight: 5 },
    wet: { frontTeeth: 11, rearTeeth: 88, frontTrackWidth: 47.0, rearTrackWidth: 57.0, rideHeight: 7 },
  },
  'Kart Circuit Autobahn': {
    dry: { frontTeeth: 12, rearTeeth: 82, frontTrackWidth: 46.0, rearTrackWidth: 57.0, rideHeight: 6 },
    wet: { frontTeeth: 11, rearTeeth: 86, frontTrackWidth: 48.0, rearTrackWidth: 59.0, rideHeight: 8 },
  },
  'Mid-State Kart Club': {
    dry: { frontTeeth: 12, rearTeeth: 85, frontTrackWidth: 44.5, rearTrackWidth: 54.5, rideHeight: 5 },
    wet: { frontTeeth: 11, rearTeeth: 89, frontTrackWidth: 46.5, rearTrackWidth: 56.5, rideHeight: 7 },
  },
  'Gateway Kartplex': {
    dry: { frontTeeth: 13, rearTeeth: 80, frontTrackWidth: 44.0, rearTrackWidth: 53.5, rideHeight: 4 },
    wet: { frontTeeth: 12, rearTeeth: 84, frontTrackWidth: 46.0, rearTrackWidth: 55.5, rideHeight: 6 },
  },
  'New Castle Motorsports Park': {
    dry: { frontTeeth: 12, rearTeeth: 88, frontTrackWidth: 46.5, rearTrackWidth: 57.0, rideHeight: 6 },
    wet: { frontTeeth: 11, rearTeeth: 92, frontTrackWidth: 48.5, rearTrackWidth: 59.0, rideHeight: 8 },
  },
  'Mill-Rite Raceway': {
    dry: { frontTeeth: 13, rearTeeth: 80, frontTrackWidth: 44.5, rearTrackWidth: 54.0, rideHeight: 5 },
    wet: { frontTeeth: 12, rearTeeth: 84, frontTrackWidth: 46.5, rearTrackWidth: 56.0, rideHeight: 7 },
  },
  'Briggs and Stratton Motorplex': {
    dry: { frontTeeth: 12, rearTeeth: 86, frontTrackWidth: 45.0, rearTrackWidth: 55.5, rideHeight: 5 },
    wet: { frontTeeth: 11, rearTeeth: 90, frontTrackWidth: 47.0, rearTrackWidth: 57.5, rideHeight: 7 },
  },
}

// Tolerance ranges (per parameter) and their weights toward total strength.
// A diff of 0 → full credit; diff ≥ range → 0 credit. Linear in between.
const PARAM_RANGES = {
  frontTeeth:      { range: 4,   weight: 18 },
  rearTeeth:       { range: 8,   weight: 24 },
  frontTrackWidth: { range: 3.0, weight: 16 },
  rearTrackWidth:  { range: 3.5, weight: 20 },
  rideHeight:      { range: 3,   weight: 22 },
}

function teethFromPartsKey(partsKey) {
  if (!partsKey) return null
  const m = String(partsKey).match(/_(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}

function getOptimal(trackName, weather) {
  const entry = TRACK_SETUPS[trackName]
  if (!entry) return null
  const isWet = weather === 'rain' || weather === 'wet'
  return isWet ? entry.wet : entry.dry
}

function readCurrent(kart) {
  return {
    frontTeeth:      kart?.equippedFrontSprocket?.teeth
      ?? teethFromPartsKey(kart?.equippedFrontSprocket?.partsKey),
    rearTeeth:       kart?.equippedRearSprocket?.teeth
      ?? teethFromPartsKey(kart?.equippedRearSprocket?.partsKey),
    frontTrackWidth: kart?.setup?.frontTrackWidth ?? null,
    rearTrackWidth:  kart?.setup?.rearTrackWidth  ?? null,
    rideHeight:      kart?.setup?.rideHeight ?? kart?.setup?.frontShims ?? null,
  }
}

// Returns 0–100. Missing parameters contribute 0 (i.e. cost full weight).
export function computeSetupStrength(kart, trackName, weather, championship, manufacturer) {
  const optimal = getOptimal(trackName, weather)
  if (!optimal) return 0
  const current = readCurrent(kart)

  let total = 0
  for (const key in PARAM_RANGES) {
    const { range, weight } = PARAM_RANGES[key]
    const cur = current[key]
    if (cur == null) continue
    const diff  = Math.abs(cur - optimal[key])
    const score = Math.max(0, 1 - diff / range)
    total += score * weight
  }

  // Ignite (Margay) penalty: harder to dial in at Route 66
  if (manufacturer?.id === 'margay' && championship?.id === 'route66') {
    total *= 0.85  // 15% penalty at Route 66
    total = Math.min(75, total)  // Cap at 75
  }
  return Math.round(total)
}

// Skill bonus added to the player's effective skill in the race sim.
// Major advantage at the easy/forgiving Club series; minor at 66/Ignite.
export function setupSkillBonus(strength, championship) {
  const norm = Math.max(0, Math.min(100, strength)) / 100
  const multiplier = championship?.id === 'norway' ? 12 : 4
  return norm * multiplier
}

// Stable fingerprint of the current setup — used to detect "untested" changes.
export function setupFingerprint(kart, weather) {
  const c = readCurrent(kart)
  return [
    c.frontTeeth ?? '-',
    c.rearTeeth  ?? '-',
    (c.frontTrackWidth ?? '-').toString(),
    (c.rearTrackWidth  ?? '-').toString(),
    c.rideHeight ?? '-',
    weather ?? '-',
  ].join('|')
}

export { TRACK_SETUPS }
