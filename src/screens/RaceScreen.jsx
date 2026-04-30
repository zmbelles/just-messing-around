import { useRef, useEffect, useState } from 'react'
import { getSessions } from '../data/sessions'
import { setupFingerprint } from '../data/trackSetups'
import EventModal    from '../components/EventModal'
import IncidentModal from '../components/IncidentModal'
import { soundManager, SOUNDS } from '../utils/soundManager'
import styles from './RaceScreen.module.css'

const WEATHER_LABEL = { sunny: '☀ Sunny', rain: '🌧 Rain' }

const SESSION_FLAVOR = {
  'Practice 1':          'Laying down laps…',
  'Practice 2':          'Pushing for lap times…',
  'Practice Happy Hour': 'Final practice underway…',
  'Practice Warm-up':    'Warming up for race day…',
  'Quali':               'Qualifying session in progress…',
  'Heat 1':              'Heat race underway…',
  'Heat 2':              'Heat race underway…',
  'Heat':                'Heat race underway…',
  'Final':               'Final race underway…',
  'Feature':             'Feature race underway…',
}

function fmtDiff(diff, dnf) {
  if (dnf)        return 'DNF'
  if (diff === null) return '—'
  if (diff === 0) return '00.000'
  return `+${diff.toFixed(3)}`
}

function fmtLap(lap)   { return lap ?? '—' }
function fmtSpeed(spd) { return spd != null ? `${spd.toFixed(3)} mi/h` : '—' }

export default function RaceScreen({
  gameState,
  onBack,
  onTuneKart,
  onMaintenance,
  onBeginSession,
  onSessionComplete,
  pendingCrash,
  pendingEvent,
  onCrashFix,
  onCrashRetire,
  onEventResolve,
}) {
  const { championship, nextRace, raceWeekend, consumables, kart } = gameState
  const sessions   = getSessions(championship)
  const { sessionIndex, weather, lastResult, standings, maintenance, testedSetup, testedStrength } = raceWeekend
  const { triFlowApplied, chainLubeApplied } = maintenance ?? {}
  const hasTriFlow   = (consumables.triFlow   ?? 0) > 0
  const hasChainLube = (consumables.chainLube ?? 0) > 0
  const session    = sessions[sessionIndex]
  const isFinished = sessionIndex >= sessions.length

  const tiresEquipped     = kart?.equippedTires != null
  const isIgnite          = championship.id === 'ignite-challenge'
  const frontSproEquipped = kart?.equippedFrontSprocket != null
  const rearSproEquipped  = kart?.equippedRearSprocket  != null
  const sprocketsEquipped = isIgnite ? rearSproEquipped : (frontSproEquipped && rearSproEquipped)

  // Setup strength is only "known" once you've run a session on this exact setup.
  // Changing anything reverts the display to "Untested" until you go back out.
  const currentFp        = setupFingerprint(kart, weather)
  const setupKnown       = testedSetup != null && testedSetup === currentFp
  const setupStrength    = setupKnown ? testedStrength : null

  // ── session phase ──────────────────────────────────────────
  const [phase,          setPhase]          = useState('idle')   // 'idle' | 'racing' | 'results'
  const [sessionResults, setSessionResults] = useState(null)     // { results, playerCrash }
  const [raceProgress,   setRaceProgress]   = useState(0)
  const [secondsLeft,    setSecondsLeft]    = useState(10)
  const [waitingForEvent, setWaitingForEvent] = useState(false)

  const RACE_DURATION_MS = 10000

  useEffect(() => {
    if (phase !== 'racing') return
    const start = Date.now()
    setSecondsLeft(RACE_DURATION_MS / 1000)
    const tick  = setInterval(() => {
      const elapsed = Date.now() - start
      const t       = Math.min(1, elapsed / RACE_DURATION_MS)
      // fast → slow: gentle ease-out (≈ 60% by half-time, not 90%)
      const eased   = 1 - Math.pow(1 - t, 1.6)
      setRaceProgress(eased * 100)
      // countdown ticks linearly (10 → 1)
      setSecondsLeft(Math.max(1, Math.ceil((RACE_DURATION_MS - elapsed) / 1000)))
      if (elapsed >= RACE_DURATION_MS) {
        clearInterval(tick)
        setPhase('results')
      }
    }, 50)
    return () => clearInterval(tick)
  }, [phase])

  function handleBeginSessionClick() {
    const result = onBeginSession()   // runs simulation, returns { results, playerCrash } or null if event pending
    if (result) {
      // Race simulation ran, show results
      setSessionResults(result)
      setRaceProgress(0)
      setPhase('racing')
    } else {
      // Event modal is showing; wait for it to be resolved
      setWaitingForEvent(true)
    }
  }

  // When event is resolved (pendingEvent becomes null), automatically start the race
  useEffect(() => {
    if (waitingForEvent && !pendingEvent) {
      setWaitingForEvent(false)
      const result = onBeginSession()   // Now run the simulation
      if (result) {
        setSessionResults(result)
        setRaceProgress(0)
        setPhase('racing')
      }
    }
  }, [pendingEvent, waitingForEvent, onBeginSession])

  function handleContinueFromResults() {
    const { results, playerCrash } = sessionResults
    setSessionResults(null)
    setPhase('idle')
    onSessionComplete(results, playerCrash)
  }

  // ── standings scroll ref ───────────────────────────────────
  const playerRef = useRef(null)
  useEffect(() => {
    playerRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [standings, phase])

  // ── race effect sound ───────────────────────────────────────
  useEffect(() => {
    if (phase === 'racing') {
      soundManager.playEffect(SOUNDS.raceEffect)
    } else {
      soundManager.stopEffect()
    }
  }, [phase])

  const canBeginSession = !isFinished
    && triFlowApplied && chainLubeApplied
    && tiresEquipped  && sprocketsEquipped

  const blockReason = (() => {
    if (isFinished)            return null
    if (!tiresEquipped)        return 'Equip a set of tires before going out.'
    if (!sprocketsEquipped)    return isIgnite ? 'Equip a rear sprocket.' : 'Equip both front and rear sprockets.'
    if (!triFlowApplied || !chainLubeApplied) return 'Apply Tri-Flow and Chain Lube before heading out.'
    return null
  })()

  // ── racing overlay ─────────────────────────────────────────
  if (phase === 'racing' && session) {
    return (
      <div className={styles.racingOverlay}>
        <div className={styles.racingCard}>
          <p className={styles.racingMeta}>
            Session {sessionIndex + 1} of {sessions.length} &nbsp;·&nbsp; {session.day}
          </p>
          <h1 className={styles.racingSessionName}>{session.name}</h1>
          <p className={styles.racingFlavor}>{SESSION_FLAVOR[session.name] ?? 'Session in progress…'}</p>
          <div className={styles.racingProgressTrack}>
            <div className={styles.racingProgressBar} style={{ width: `${raceProgress}%` }} />
          </div>
          <div className={styles.racingFooter}>
            <p className={styles.racingCountdown}>{secondsLeft}s</p>
            <button className={styles.racingSkipBtn} onClick={() => setPhase('results')}>
              Skip ⏭
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── results screen ─────────────────────────────────────────
  if (phase === 'results' && sessionResults) {
    const { results } = sessionResults
    return (
      <div className={styles.resultsScreen}>
        <div className={styles.resultsHeader}>
          <div>
            <p className={styles.resultsMeta}>{session?.day} &nbsp;·&nbsp; Session {sessionIndex + 1} of {sessions.length}</p>
            <h2 className={styles.resultsTitle}>{session?.name} — Results</h2>
          </div>
          <button className={styles.resultsContinueBtn} onClick={handleContinueFromResults}>
            Continue →
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thPos}>Pos</th>
                <th className={styles.thKart}>#</th>
                <th className={styles.thName}>Competitor</th>
                <th className={styles.thNum}>Diff</th>
                <th className={styles.thNum}>Laps</th>
                <th className={styles.thNum}>Best Lap</th>
                <th className={styles.thNum}>Lap No.</th>
                <th className={styles.thNum}>Best Speed</th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => (
                <tr
                  key={`${row.kart}-${row.name}`}
                  ref={row.isPlayer ? playerRef : null}
                  className={`${styles.tr} ${row.isPlayer ? styles.trPlayer : ''} ${row.dnf ? styles.trDnf : ''}`}
                >
                  <td className={styles.tdPos}>{row.dnf ? '—' : row.pos}</td>
                  <td className={styles.tdKart}>{row.kart}</td>
                  <td className={styles.tdName}>{row.name}</td>
                  <td className={styles.tdNum}>{fmtDiff(row.diff, row.dnf)}</td>
                  <td className={styles.tdNum}>{row.laps}</td>
                  <td className={styles.tdNum}>{fmtLap(row.bestLap)}</td>
                  <td className={styles.tdNum}>{row.bestLapNo ?? '—'}</td>
                  <td className={styles.tdNum}>{fmtSpeed(row.bestSpeed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.some(r => r.penalty) && (
          <div className={styles.penaltiesSection}>
            <h3 className={styles.penaltiesTitle}>Penalties & Infractions</h3>
            <div className={styles.penaltiesList}>
              {results.filter(r => r.penalty).map(row => (
                <div key={`${row.kart}-penalty`} className={styles.penaltyRow}>
                  <span className={styles.penaltyKart}>#{row.kart}</span>
                  <span className={styles.penaltyDriver}>{row.name}</span>
                  <span className={styles.penaltyReason}>{row.penalty.reason}</span>
                  <span className={styles.penaltyPlaces}>−{row.penalty.places} place{row.penalty.places !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── normal race hub ────────────────────────────────────────
  return (
    <div className={styles.screen}>

      {/* ── race info bar ── */}
      <div className={`${styles.topBar} ${isFinished ? styles.topBarOver : ''}`}>
        {isFinished
          ? <button className={styles.backBtnHero} onClick={onBack}>Return to Hub →</button>
          : <span className={styles.backBtnLocked}>Race Weekend</span>
        }
        <div className={styles.raceInfo}>
          <span className={styles.infoTrack}>{nextRace.track}</span>
          <span className={styles.sep}>|</span>
          <span className={styles.infoItem}>{isFinished ? 'Weekend Over' : session.day}</span>
          <span className={styles.sep}>|</span>
          <span className={styles.infoItem}>{isFinished ? '—' : session.name}</span>
          <span className={styles.sep}>|</span>
          <span className={styles.infoItem}>{WEATHER_LABEL[weather] ?? weather}</span>
          <span className={styles.sep}>|</span>
          <span className={`${styles.infoItem} ${lastResult ? styles.infoResult : styles.infoResultEmpty}`}>
            {lastResult ? `Last: ${lastResult.label}` : 'No result yet'}
          </span>
        </div>
      </div>

      <div className={styles.grid}>

        {/* Box 1 — Begin next session */}
        <div className={`${styles.card} ${canBeginSession ? styles.cardClickable : ''}`}
          onClick={() => canBeginSession && handleBeginSessionClick()}
          style={{ cursor: canBeginSession ? 'pointer' : 'default' }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Next Session</span>
            {!isFinished && (
              <span className={`${styles.sessionBadge} ${canBeginSession ? styles.sessionBadgeReady : styles.sessionBadgeWait}`}>
                {canBeginSession ? 'READY' : 'MAINTENANCE REQ\'D'}
              </span>
            )}
          </div>
          <p className={styles.sessionName}>{isFinished ? 'No sessions remaining' : session.name}</p>
          {!isFinished && (
            <p className={styles.cardDesc}>
              {canBeginSession
                ? `Session ${sessionIndex + 1} of ${sessions.length} — ${session.day}`
                : blockReason}
            </p>
          )}
        </div>

        {/* Box 2 — Tune Kart */}
        <button
          className={`${styles.card} ${isFinished ? styles.cardDisabled : styles.cardClickable}`}
          disabled={isFinished}
          onClick={isFinished ? undefined : onTuneKart}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Tune Kart</span>
            {setupKnown ? (
              <span className={`${styles.setupBadge} ${
                setupStrength >= 80 ? styles.setupBadgeHigh
                : setupStrength >= 50 ? styles.setupBadgeMid
                : styles.setupBadgeLow
              }`}>
                Setup {setupStrength}
              </span>
            ) : (
              <span className={`${styles.setupBadge} ${styles.setupBadgeUnknown}`}>
                Untested
              </span>
            )}
          </div>
          {setupKnown ? (
            <div className={styles.setupBarTrack}>
              <div
                className={`${styles.setupBarFill} ${
                  setupStrength >= 80 ? styles.setupBarHigh
                  : setupStrength >= 50 ? styles.setupBarMid
                  : styles.setupBarLow
                }`}
                style={{ width: `${setupStrength}%` }}
              />
            </div>
          ) : (
            <div className={`${styles.setupBarTrack} ${styles.setupBarTrackUnknown}`} />
          )}
          <p className={styles.cardDesc}>
            {!tiresEquipped || !sprocketsEquipped
              ? 'Equip tires and sprockets, then dial in your setup.'
              : !setupKnown
                ? 'Run a session on this setup to see how it performs on this track.'
                : 'Sprockets, track width, and ride height — match the track to gain pace.'}
          </p>
        </button>

        {/* Box 3 — Pre-Session Maintenance */}
        <div className={`${styles.card} ${isFinished ? styles.cardDisabled : ''}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Maintenance</span>
            {!isFinished && (triFlowApplied && chainLubeApplied
              ? <span className={styles.maintDone}>✓ Ready</span>
              : <span className={styles.maintNeeded}>Required</span>
            )}
          </div>
          <p className={styles.cardDesc}>Apply lubricants before each session.</p>
          <div className={styles.maintButtons}>
            <button
              className={`${styles.maintBtn} ${triFlowApplied ? styles.maintBtnDone : hasTriFlow ? styles.maintBtnReady : styles.maintBtnOut}`}
              disabled={isFinished || triFlowApplied || !hasTriFlow}
              onClick={() => onMaintenance('triFlow')}
            >
              {triFlowApplied ? '✓ Tri-Flow Applied' : hasTriFlow ? `Apply Tri-Flow (${consumables.triFlow ?? 0})` : 'No Tri-Flow'}
            </button>
            <button
              className={`${styles.maintBtn} ${chainLubeApplied ? styles.maintBtnDone : hasChainLube ? styles.maintBtnReady : styles.maintBtnOut}`}
              disabled={isFinished || chainLubeApplied || !hasChainLube}
              onClick={() => onMaintenance('chainLube')}
            >
              {chainLubeApplied ? '✓ Chain Lube Applied' : hasChainLube ? `Apply Chain Lube (${consumables.chainLube ?? 0})` : 'No Chain Lube'}
            </button>
          </div>
        </div>

        {/* Box 4 — Standings (full width) */}
        <div className={`${styles.card} ${styles.standingsCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Session Standings</span>
            <span className={styles.entryCount}>{standings.length} entries</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thPos}>Pos</th>
                  <th className={styles.thKart}>#</th>
                  <th className={styles.thName}>Competitor</th>
                  <th className={styles.thNum}>Diff</th>
                  <th className={styles.thNum}>Laps</th>
                  <th className={styles.thNum}>Best Lap</th>
                  <th className={styles.thNum}>Lap No.</th>
                  <th className={styles.thNum}>Best Speed</th>
                </tr>
              </thead>
              <tbody>
                {standings.map(row => (
                  <tr
                    key={`${row.kart}-${row.name}`}
                    ref={row.isPlayer ? playerRef : null}
                    className={`${styles.tr} ${row.isPlayer ? styles.trPlayer : ''} ${row.dnf ? styles.trDnf : ''}`}
                  >
                    <td className={styles.tdPos}>{row.dnf ? '—' : row.pos}</td>
                    <td className={styles.tdKart}>{row.kart}</td>
                    <td className={styles.tdName}>{row.name}</td>
                    <td className={styles.tdNum}>{fmtDiff(row.diff, row.dnf)}</td>
                    <td className={styles.tdNum}>{row.laps}</td>
                    <td className={styles.tdNum}>{fmtLap(row.bestLap)}</td>
                    <td className={styles.tdNum}>{row.bestLapNo ?? '—'}</td>
                    <td className={styles.tdNum}>{fmtSpeed(row.bestSpeed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Post-session modals — crash first, then event */}
      {pendingCrash && (
        <IncidentModal
          crash={pendingCrash}
          gameState={gameState}
          onFix={onCrashFix}
          onRetire={onCrashRetire}
        />
      )}
      {!pendingCrash && pendingEvent && (
        <EventModal
          event={pendingEvent}
          gameState={gameState}
          onResolve={onEventResolve}
        />
      )}
    </div>
  )
}
