import { useRef, useEffect } from 'react'
import GameHeader from '../components/GameHeader'
import styles from './HubScreen.module.css'
import { getSessions } from '../data/sessions'
import { fuelRequirement, planRaceConsumables } from '../App'
import { soundManager, SOUNDS } from '../utils/soundManager'

function playHoverSound() {
  soundManager.playEffect(SOUNDS.hoverEffect)
}

const PARTS_REQS = { transponder: 1 }
const TIRE_PART_KEYS = ['tiresHoosierSlick','tiresHoosierRain','tiresMGYellow','tiresMGOrange','tiresMGRed','tiresRain']

const CONSUMABLE_LABELS = {
  oil:          'Oil',
  triFlow:      'Tri-Flow',
  chainLube:    'Chain Lube',
  fuel:         'Fuel',
  nutsAndBolts: 'Nuts & Bolts',
}
const PARTS_LABELS = { transponder: 'Transponder' }

function hasTires(kart) {
  return kart?.equippedTires != null
}

function getConsumableReqs(championship) {
  const n    = getSessions(championship).length
  const fuel = fuelRequirement(championship)
  return { oil: 1, triFlow: n, chainLube: n, fuel }
}

function canRace(consumables, parts, kart, championship) {
  const reqs = getConsumableReqs(championship)
  const consumablesOk = Object.entries(reqs).every(([k, v]) => (consumables[k] ?? 0) >= v)
  const partsOk       = Object.entries(PARTS_REQS).every(([k, v]) => (parts?.[k] ?? 0) >= v)
  const tiresOk       = hasTires(kart)
  const frameOk       = kart?.frame && (kart.frame.durability ?? 100) > 0
  return consumablesOk && partsOk && tiresOk && frameOk
}

function missingItems(consumables, parts, kart, championship) {
  const reqs = getConsumableReqs(championship)
  const missingC = Object.entries(reqs)
    .filter(([k, v]) => (consumables[k] ?? 0) < v)
    .map(([k, v]) => `${v}× ${CONSUMABLE_LABELS[k]}`)
  const missingP = Object.entries(PARTS_REQS)
    .filter(([k, v]) => (parts?.[k] ?? 0) < v)
    .map(([k]) => PARTS_LABELS[k])
  const missingT = !hasTires(kart) ? ['Tires'] : []
  const missingF = !kart?.frame || (kart.frame.durability ?? 100) === 0 ? ['Frame (Broken)'] : []
  return [...missingC, ...missingP, ...missingT, ...missingF]
}

function hasSparePartsToInstall(parts) {
  return Object.values(parts ?? {}).some(qty => qty > 0)
}

const SESSION_SHORT = { 'Heat 1': 'H1', 'Heat 2': 'H2', 'Final': 'F', 'Heat': 'Heat', 'Feature': 'Feat' }

export default function HubScreen({ gameState, onNavigate, onBuyRaceConsumables }) {
  const { consumables, parts, nextRace, championshipPoints = [], kartNumber, championship, raceWeekend, roundHistory = [], kart } = gameState
  const sessionCount = getSessions(championship).length
  const buyPlan      = planRaceConsumables(consumables, championship, sessionCount)
  const canBuyAll    = buyPlan.lines.length > 0 && gameState.cash >= buyPlan.totalCost
  const weekendOver = raceWeekend?.weekendOver ?? false
  const raceReady   = !weekendOver && canRace(consumables, parts, kart, championship) && nextRace.isToday
  const missing     = missingItems(consumables, parts, kart, championship)
  const noHardwareWarn = (consumables.nutsAndBolts ?? 0) === 0 && hasSparePartsToInstall(parts)
  const noMyChron      = (parts?.mychron ?? 0) === 0
  const playerRef      = useRef(null)

  useEffect(() => {
    playerRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [])

  return (
    <div className={styles.screen}>
      <GameHeader gameState={gameState} />

      <div className={styles.grid}>

        {/* Box 1 — Next Race */}
        <button
          className={`${styles.card} ${styles.cardNextRace} ${raceReady ? styles.cardClickable : ''}`}
          disabled={!raceReady}
          onClick={() => raceReady && onNavigate('race')}
          onMouseEnter={raceReady ? playHoverSound : undefined}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Next Race</span>
            {weekendOver && (
              <span className={`${styles.badge} ${styles.badgeOver}`}>WEEKEND OVER</span>
            )}
            {!weekendOver && nextRace.isToday && (
              <span className={`${styles.badge} ${raceReady ? styles.badgeGo : styles.badgeLocked}`}>
                {raceReady ? 'RACE DAY' : 'NOT READY'}
              </span>
            )}
            {!weekendOver && !nextRace.isToday && (
              <span className={styles.badge}>{nextRace.daysUntil}d away</span>
            )}
          </div>

          <div className={styles.nextRaceBody}>
            <div>
              <p className={styles.raceName}>{nextRace.name}</p>
              <p className={styles.raceTrack}>{nextRace.track}</p>
            </div>

            {!raceReady && nextRace.isToday && (
              <div className={styles.missingList}>
                <span className={styles.missingLabel}>Need before racing:</span>
                {missing.map(m => (
                  <span key={m} className={styles.missingItem}>{m}</span>
                ))}
              </div>
            )}

            {noHardwareWarn && (
              <div className={styles.hardwareWarn}>
                <span className={styles.hardwareWarnIcon}>⚠</span>
                <div>
                  <p className={styles.hardwareWarnTitle}>No Spare Hardware</p>
                  <p className={styles.hardwareWarnBody}>You have spare parts but no nuts & bolts — nothing can be installed on-site if something breaks.</p>
                </div>
              </div>
            )}

            {noMyChron && (
              <div className={styles.hardwareWarn}>
                <span className={styles.hardwareWarnIcon}>⏱</span>
                <div>
                  <p className={styles.hardwareWarnTitle}>No MyChron</p>
                  <p className={styles.hardwareWarnBody}>Without a lap timer you're racing blind — you won't be able to read times or adjust your setup.</p>
                </div>
              </div>
            )}

            {raceReady && (
              <span className={styles.raceGoArrow}>Start Race →</span>
            )}
          </div>
        </button>

        {/* Box 2 — Chassis & Parts */}
        <button
          className={`${styles.card} ${styles.cardClickable}`}
          onClick={() => onNavigate('chassis')}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Chassis &amp; Parts</span>
          </div>
          <p className={styles.cardDesc}>Tune your setup, swap components, and prep for the next race.</p>
        </button>

        {/* Box 3 — Store */}
        <button
          className={`${styles.card} ${styles.cardClickable}`}
          onClick={() => onNavigate('store')}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Store</span>
          </div>
          <p className={styles.cardDesc}>Buy consumables, parts, and supplies.</p>
        </button>

        {/* Box 4 — Research (WIP) */}
        <button className={`${styles.card} ${styles.cardWip}`} disabled>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Research</span>
            <span className={styles.wipBadge}>Coming Soon</span>
          </div>
          <p className={styles.cardDesc}>Unlock chassis upgrades and technical advantages.</p>
        </button>

        {/* Box 5 — Driver Development (WIP) */}
        <button className={`${styles.card} ${styles.cardWip}`} disabled>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Driver Development</span>
            <span className={styles.wipBadge}>Coming Soon</span>
          </div>
          <p className={styles.cardDesc}>Train your driver, manage fitness, and build race craft.</p>
        </button>

        {/* Buy Race Consumables — quick top-up for the next weekend */}
        <button
          className={`${styles.card} ${canBuyAll ? styles.cardClickable : styles.cardWip}`}
          disabled={!canBuyAll}
          onClick={canBuyAll ? onBuyRaceConsumables : undefined}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Buy Race Consumables</span>
            {buyPlan.lines.length === 0
              ? <span className={`${styles.badge} ${styles.badgeGo}`}>STOCKED</span>
              : <span className={styles.badge}>${buyPlan.totalCost.toFixed(2)}</span>
            }
          </div>
          <p className={styles.cardDesc}>
            {buyPlan.lines.length === 0
              ? 'You already have enough fuel, oil, and lubes for the next weekend.'
              : `Tops you up to a full weekend: ${buyPlan.lines.map(l => `${l.qty}× ${l.item.name.replace(/ \(.*$/, '')}`).join(', ')}.`}
          </p>
        </button>

        {/* Championship Standings — full width */}
        <div className={`${styles.card} ${styles.cardStandings}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Championship Standings</span>
            <span className={styles.standingsBadge}>{championshipPoints.length} entries</span>
          </div>
          <div className={styles.standingsScroll}>
            <table className={styles.standingsTable}>
              <thead>
                <tr>
                  <th className={styles.sthPos} rowSpan={2}>Pos</th>
                  <th className={styles.sthKart} rowSpan={2}>#</th>
                  <th className={styles.sthName} rowSpan={2}>Competitor</th>
                  {roundHistory.map(rd => (
                    <th
                      key={`r${rd.roundIndex}`}
                      className={styles.sthRoundGroup}
                      colSpan={rd.sessions.length + 1}
                    >
                      R{rd.roundIndex + 1}
                    </th>
                  ))}
                  <th className={styles.sthPts} rowSpan={2}>Total</th>
                </tr>
                <tr>
                  {roundHistory.flatMap(rd => [
                    ...rd.sessions.map(s => (
                      <th key={`r${rd.roundIndex}-${s.name}`} className={styles.sthSub}>
                        {SESSION_SHORT[s.name] ?? s.name}
                      </th>
                    )),
                    <th key={`r${rd.roundIndex}-total`} className={styles.sthSubTotal}>Tot</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {championshipPoints.map(row => (
                  <tr
                    key={`${row.kart}-${row.name}`}
                    ref={row.isPlayer ? playerRef : null}
                    className={`${styles.str} ${row.isPlayer ? styles.strPlayer : ''}`}
                  >
                    <td className={styles.stdPos}>{row.pos}</td>
                    <td className={styles.stdKart}>{row.kart}</td>
                    <td className={styles.stdName}>{row.name}</td>
                    {roundHistory.flatMap(rd => {
                      let roundTotal = 0
                      const sessionCells = rd.sessions.map(s => {
                        const pts = s.points[String(row.kart)] ?? 0
                        roundTotal += pts
                        return (
                          <td key={`r${rd.roundIndex}-${s.name}-${row.kart}`} className={styles.stdSub}>
                            {pts || '—'}
                          </td>
                        )
                      })
                      return [
                        ...sessionCells,
                        <td key={`r${rd.roundIndex}-total-${row.kart}`} className={styles.stdSubTotal}>
                          {roundTotal || '—'}
                        </td>,
                      ]
                    })}
                    <td className={styles.stdPts}>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
