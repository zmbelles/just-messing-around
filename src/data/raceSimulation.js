import { rollCrashIntensity, getCrashDamage, CRASH_INTENSITY_LABELS } from './raceRules'
import { computeSetupStrength, setupSkillBonus } from './trackSetups'

const RACE_SESSIONS = new Set(['Heat 1', 'Heat 2', 'Final', 'Heat', 'Feature'])

const TRACK = {
  'route66':          { baseLap: 77.2,  miles: 1.20, raceLaps: 10 },
  'norway':           { baseLap: 64.5,  miles: 0.85, raceLaps:  7 },
  'ignite-challenge': { baseLap: 65.8,  miles: 0.90, raceLaps:  7 },
}

function cfg(championship) {
  return TRACK[championship.id] ?? TRACK['norway']
}

function lapTime(championship, skill, noiseAmp = 0.6) {
  const { baseLap } = cfg(championship)
  const factor = (100 - Math.max(30, Math.min(99, skill))) / 1500
  return baseLap * (1 + factor) + (Math.random() * noiseAmp * 2 - noiseAmp)
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec - m * 60
  return `${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`
}

function mph(championship, lapSec) {
  const { miles } = cfg(championship)
  return parseFloat(((miles * 3600) / lapSec).toFixed(3))
}

export function simulateSession(session, standings, gameState) {
  const { manufacturer, championship, experience, kart, nextRace, raceWeekend } = gameState
  const isRace = RACE_SESSIONS.has(session.name)
  const track  = cfg(championship)
  // Player skill grows with experience. Starts at 42 (raw rookie) and gains
  // ~1.4 skill per XP point, capping at 82.
  // - XP 0  → skill 42 (well below the field; finishes ~30s in Route 66)
  // - XP 10 → skill 56 (low 20s in Route 66)
  // - XP 20 → skill 70 (consistent top-20 in Route 66, after ~2 Norway seasons)
  // - XP 28+→ skill 82 cap (top contender)
  const xp          = Math.max(0, experience ?? 0)
  const baseSkill   = Math.min(82, 42 + xp * 1.4)
  const strength    = computeSetupStrength(kart, nextRace?.track, raceWeekend?.weather, championship, manufacturer)
  const setupBonus  = setupSkillBonus(strength, championship)
  // Engine power: stock LO206 = 100. Above-stock engines (Dmitri, etc.) confer
  // a per-power-point skill bonus; durability dampens the gain as the engine wears.
  // Capped so a great engine can't fully compensate for inexperience.
  const enginePwr   = kart?.equippedEngine?.power      ?? 100
  const engineDur   = kart?.equippedEngine?.durability ?? 100
  const engineBonus = Math.min(6, Math.max(0, (enginePwr - 100)) * 0.20 * (engineDur / 100))

  // Tire penalty: when tires drop below 80% durability, they start affecting lap times
  const tireDur = kart?.equippedTires?.durability ?? 100
  const tirePenalty = tireDur > 0 && tireDur < 80 ? (80 - tireDur) * 0.3 : 0

  // Kart bonuses scale with experience: a great kart helps a lot once you can
  // drive it, but won't carry a rookie into the top-20.
  // - XP 0  → 30% kart effectiveness
  // - XP 20 → 100% (full benefit by the 2-season XP target)
  const kartBonusScale = Math.min(1, 0.3 + xp * 0.035)
  const playerSkill = baseSkill + (setupBonus + engineBonus) * kartBonusScale - tirePenalty

  // Big day-factor swings so finishes vary session to session
  // Club races have less jitter since it's easier; harder championships need more variation
  const skillJitter = isRace ? (championship.id === 'norway' ? 6 : 10) : 5
  const lapNoise    = isRace ? 1.2 : 0.8

  const drivers = standings.map(d => {
    const base = d.isPlayer ? playerSkill : (d.skill ?? 60)
    const eff  = base + (Math.random() * skillJitter * 2 - skillJitter)
    return {
      ...d,
      eff,
      lt:           lapTime(championship, eff, lapNoise),
      crashed:      false,
      incidentDrop: 0,   // bumped down due to non-DNF incident
      penaltyDrop:  0,   // contact / pushback penalty
    }
  })

  // ── Practice / Quali — pure lap-time sort, no incidents ───────
  if (!isRace) {
    const sorted = [...drivers].sort((a, b) => a.lt - b.lt)
    const best   = sorted[0].lt
    return {
      results: sorted.map((d, i) => ({
        pos: i + 1, kart: d.kart, name: d.name, skill: d.skill, isPlayer: d.isPlayer,
        dnf: false,
        diff:      i === 0 ? 0 : parseFloat((d.lt - best).toFixed(3)),
        laps:      Math.max(3, Math.floor(Math.random() * 4) + 5),
        bestLap:   fmtTime(d.lt),
        bestLapNo: Math.floor(Math.random() * 5) + 2,
        bestSpeed: mph(championship, d.lt),
      })),
      playerCrash: null,
    }
  }

  // ── Race session ──────────────────────────────────────────────
  // 1) Crashes (DNF) — chain to neighbours
  const grid = [...drivers].sort((a, b) => a.pos - b.pos)
  grid.forEach((d, idx) => {
    if (d.crashed) return
    const chance = d.isPlayer ? 0.05 : 0.0325
    if (Math.random() < chance) {
      d.crashed = true
      if (idx > 0 && !grid[idx - 1].crashed && Math.random() < 0.15)
        grid[idx - 1].crashed = true
      if (idx < grid.length - 1 && !grid[idx + 1].crashed && Math.random() < 0.15)
        grid[idx + 1].crashed = true
    }
  })

  // 2) Player crash details
  let playerCrash = null
  const playerRow = grid.find(d => d.isPlayer)
  if (playerRow?.crashed) {
    const intensityIndex = rollCrashIntensity(manufacturer)
    const { parts, frameBent } = getCrashDamage(intensityIndex, manufacturer, championship)
    playerCrash = {
      intensityIndex,
      intensityLabel: CRASH_INTENSITY_LABELS[intensityIndex],
      parts,
      frameBent,
    }
  }

  // 3) Non-DNF incidents — bumped down 1–20 places, ~5% per driver
  drivers.forEach(d => {
    if (d.crashed) return
    if (Math.random() < 0.05) {
      d.incidentDrop = Math.floor(Math.random() * 20) + 1
    }
  })

  // 4) Penalties — at least 3 random non-crashed drivers
  //    get bumped 2–6 places, or DSQ for tech violations
  const eligible      = drivers.filter(d => !d.crashed)
  const penaltyCount  = 3 + Math.floor(Math.random() * 3)   // 3–5
  const penaltyTargets = new Set()
  const normalReasons = ['Pushback +2', 'Pushback +4', 'Contact', 'Under weight']
  const dsqReasons = ['Failed tech (DSQ)', 'Unsportsmanlike conduct (DSQ)']
  while (penaltyTargets.size < Math.min(penaltyCount, eligible.length)) {
    penaltyTargets.add(eligible[Math.floor(Math.random() * eligible.length)])
  }
  penaltyTargets.forEach(d => {
    // 20% chance of DSQ, 80% chance of regular penalty
    if (Math.random() < 0.2) {
      d.penaltyReason = dsqReasons[Math.floor(Math.random() * dsqReasons.length)]
      d.isDSQ = true
      d.crashed = true  // Treat DSQ as DNF
    } else {
      d.penaltyDrop = Math.floor(Math.random() * 5) + 2     // 2–6
      d.penaltyReason = normalReasons[Math.floor(Math.random() * normalReasons.length)]
    }
  })

  // 5) Finishing order — score = eff − drop_weights
  //    Each "place dropped" ≈ 1 score point so it shifts ordering
  const finished = drivers.filter(d => !d.crashed).map(d => ({
    ...d,
    score: d.eff - d.incidentDrop - d.penaltyDrop,
  })).sort((a, b) => b.score - a.score)

  const dnf    = drivers.filter(d => d.crashed)
  const sorted = [...finished, ...dnf]

  let cumGap = 0
  const results = sorted.map((d, i) => {
    if (d.crashed) {
      return {
        pos: i + 1, kart: d.kart, name: d.name, skill: d.skill, isPlayer: d.isPlayer,
        dnf: true, diff: null,
        laps:      Math.max(1, Math.floor(track.raceLaps * (0.2 + Math.random() * 0.4))),
        bestLap:   fmtTime(d.lt),
        bestLapNo: 1,
        bestSpeed: mph(championship, d.lt),
        incident:  null,
        penalty:   d.isDSQ ? { reason: d.penaltyReason, isDSQ: true } : null,
      }
    }
    if (i > 0) cumGap = parseFloat((cumGap + 0.3 + Math.random() * 0.7).toFixed(3))
    return {
      pos: i + 1, kart: d.kart, name: d.name, skill: d.skill, isPlayer: d.isPlayer,
      dnf: false,
      diff:      i === 0 ? 0 : cumGap,
      laps:      track.raceLaps,
      bestLap:   fmtTime(d.lt),
      bestLapNo: Math.floor(Math.random() * (track.raceLaps - 1)) + 2,
      bestSpeed: mph(championship, d.lt),
      incident:  d.incidentDrop > 0 ? d.incidentDrop : null,
      penalty:   d.penaltyDrop  > 0 ? { places: d.penaltyDrop, reason: d.penaltyReason } : null,
    }
  })

  return { results, playerCrash }
}
