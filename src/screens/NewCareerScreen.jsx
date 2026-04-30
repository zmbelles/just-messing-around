import { useState, useEffect, useRef } from 'react'
import styles from './NewCareerScreen.module.css'
import { soundManager, SOUNDS } from '../utils/soundManager'

import birelKart    from '../images/birel-4stroke-removebg.png'
import tonyKart     from '../images/tony-kart-4stroke-removebg.png'
import coyoteKart   from '../images/coyote-4stroke-removebg.png'
import igniteKart   from '../images/ignite-4stroke-removebg.png'

import birelLogo    from '../images/birel-art-logo-removebg-preview.png'
import tonyLogo     from '../images/tony_kart-removebg.png'
import coyoteLogo   from '../images/coyote-logo-removebg.png'
import margayLogo   from '../images/margay-logo-removebg.png'
import lawsonLogo   from '../images/lawson-removebg.png'
import mobil1Logo   from '../images/mobil1.jpg'

import BentAxleBrosLogo from '../components/BentAxleBrosLogo'
import { CHAMPIONSHIPS } from '../data/championships'
import { getCompetitors } from '../data/competitors'

const DIFFICULTY_COLOR = {
  Easy:       '#45e87a',
  Medium:     '#e8b84b',
  Hard:       '#e87a45',
  Impossible: '#e84545',
}

const MANUFACTURERS = [
  { id: 'birel',  name: 'Birel Art', difficulty: 'Easy',       kart: birelKart,  logo: birelLogo,  logoType: 'img' },
  { id: 'tony',   name: 'Tony Kart', difficulty: 'Medium',     kart: tonyKart,   logo: tonyLogo,   logoType: 'img' },
  { id: 'coyote', name: 'Coyote',    difficulty: 'Hard',       kart: coyoteKart, logo: coyoteLogo, logoType: 'img' },
  { id: 'margay', name: 'Margay',    difficulty: 'Impossible', kart: igniteKart, logo: margayLogo, logoType: 'img' },
]

const BASE_SPONSORS = [
  { id: 'bent-axle', name: 'Bent Axle Bros',   payoutAmount: 2500,  payout: '$2,500 / season',  requirement: 'Finish Top 15', logoType: 'svg-bent', tier: 1 },
  { id: 'lawson',    name: 'Lawson Speed Shop', payoutAmount: 5000,  payout: '$5,000 / season',  requirement: 'Finish Top 10', logo: lawsonLogo,  logoType: 'img', tier: 2 },
  { id: 'mobil1',    name: 'Mobil 1',           payoutAmount: 10000, payout: '$10,000 / season', requirement: 'Finish Top 5',  logo: mobil1Logo,  logoType: 'img', tier: 3 },
]

// Step order: 1 Team Name → 2 Driver Name → 3 Championship → 4 Chassis → 5 Number → 6 Sponsor
// When continuing from career, skip team/driver/number steps
export default function NewCareerScreen({ gameState, onComplete, onBack }) {
  const isContinuing = gameState?.continueFromCareer ?? false
  const prevTeamName = gameState?.teamName ?? ''
  const prevDriverName = gameState?.driverName ?? ''
  const prevDriverNumber = gameState?.kartNumber ? gameState.kartNumber - 500 : 42

  const [step,         setStep]         = useState(isContinuing ? 4 : 1)
  const [teamName,     setTeamName]     = useState(prevTeamName)
  const [championship, setChampionship] = useState(null)
  const [driverName,   setDriverName]   = useState(prevDriverName)
  const [driverNumber, setDriverNumber] = useState(prevDriverNumber)
  const [manufacturer, setManufacturer] = useState(null)
  const [sponsor,      setSponsor]      = useState(null)
  const [animating,    setAnimating]    = useState(false)
  const inputRef       = useRef(null)
  const driverInputRef = useRef(null)

  const TOTAL_STEPS = 6

  useEffect(() => {
    if (step === 1) inputRef.current?.focus()
    if (step === 2) driverInputRef.current?.focus()
  }, [step])

  // Numbers already used by competitors in the selected championship
  const takenNumbers = championship
    ? new Set(getCompetitors(championship).map(c => String(c.kart)))
    : new Set()

  function isNumberTaken(n) {
    return takenNumbers.has(String(500 + n))
  }

  // Find next available number in direction +1 or -1, null if none
  function nextAvailable(current, dir) {
    let n = current + dir
    while (n >= 1 && n <= 99) {
      if (!isNumberTaken(n)) return n
      n += dir
    }
    return null
  }

  function sponsors(mfr) {
    const mfrEntry = MANUFACTURERS.find(m => m.id === mfr?.id)
    return [
      ...BASE_SPONSORS,
      {
        id: 'manufacturer',
        name: mfrEntry?.name ?? 'Chassis Manufacturer',
        payoutAmount: 15000,
        payout: '$15,000 / season',
        requirement: 'Win Championship',
        logo: mfrEntry?.logo ?? null,
        logoType: 'img',
        tier: 4,
      },
    ]
  }

  function advance() {
    if (animating) return
    if (step === TOTAL_STEPS && sponsor) {
      onComplete?.({ teamName: teamName.trim(), driverName: driverName.trim(), driverNumber, manufacturer, sponsor, championship })
      return
    }
    setAnimating(true)
    setTimeout(() => {
      // When entering number step, auto-adjust if default number is already taken
      if (step === 5 && championship) {
        const taken = new Set(getCompetitors(championship).map(c => String(c.kart)))
        setDriverNumber(n => {
          if (!taken.has(String(500 + n))) return n
          for (let i = 1; i <= 99; i++) {
            if (!taken.has(String(500 + i))) return i
          }
          return n
        })
      }
      let nextStep = step + 1
      // Skip step 1, 2, and 3 if continuing from career
      if (isContinuing && nextStep <= 3) nextStep = 4
      setStep(nextStep)
      setAnimating(false)
    }, 220)
  }

  function back() {
    if (step === 1 || (isContinuing && step === 4)) { onBack?.(); return }
    setAnimating(true)
    setTimeout(() => {
      const newStep = step - 1
      // Skip step 1, 2, and 3 if continuing
      if (isContinuing && newStep <= 3) {
        setStep(4)
      } else {
        setStep(newStep)
      }
      setAnimating(false)
    }, 220)
  }

  function skip() {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setStep(3)
      setAnimating(false)
    }, 220)
  }

  const kartNumber = 500 + driverNumber
  const isIgnite   = championship?.id === 'ignite-challenge'
  const isRoute66  = championship?.id === 'route66'

  // Get Margay difficulty based on selected championship
  function getMargayDifficulty() {
    if (!championship) return 'Impossible'
    if (championship.id === 'ignite-challenge') return 'Hard'
    if (championship.id === 'norway') return 'Expert'
    if (championship.id === 'route66') return 'Impossible'
    return 'Impossible'
  }

  const canAdvance =
    (step === 1 && teamName.trim().length > 0) ||
    (step === 2 && driverName.trim().length > 0) ||
    (step === 3 && championship !== null) ||
    (step === 4 && manufacturer !== null && (!isIgnite || manufacturer.id === 'margay')) ||
    (step === 5 && driverNumber >= 1 && driverNumber <= 99 && !isNumberTaken(driverNumber)) ||
    (step === 6 && sponsor !== null)

  return (
    <div className={`${styles.screen} ${animating ? styles.out : styles.in}`}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={back}>← Back</button>
        <div className={styles.stepIndicator}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
            <div key={n} className={`${styles.stepDot} ${n <= step ? styles.stepDotActive : ''}`} />
          ))}
        </div>
      </div>

      {/* Step 1 — Team Name */}
      {step === 1 && !isContinuing && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Name Your Team</h2>
          <p className={styles.stepSub}>This is what the paddock will call you.</p>
          <input
            ref={inputRef}
            className={styles.teamInput}
            type="text"
            placeholder="e.g. Redline Racing"
            value={teamName}
            maxLength={32}
            onChange={e => setTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
          />
        </div>
      )}

      {/* Step 2 — Driver Name */}
      {step === 2 && !isContinuing && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Your Driver</h2>
          <p className={styles.stepSub}>What's your name?</p>
          <input
            ref={driverInputRef}
            className={styles.teamInput}
            type="text"
            placeholder="Driver full name"
            value={driverName}
            maxLength={32}
            onChange={e => setDriverName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
          />
        </div>
      )}

      {/* Step 3 — Championship */}
      {step === 3 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Choose Your Championship</h2>
          <p className={styles.stepSub}>Pick the series you'll compete in this season.</p>
          <div className={styles.champGrid}>
            {CHAMPIONSHIPS.map(champ => (
              <button
                key={champ.id}
                className={`${styles.champCard} ${championship?.id === champ.id ? styles.cardSelected : ''}`}
                onClick={() => setChampionship(champ)}
              >
                <div className={styles.champLogoWrap}>
                  <img
                    src={champ.logo}
                    alt={champ.name}
                    className={`${styles.champLogo} ${champ.logoBg ? styles.champLogoBg : ''}`}
                    draggable={false}
                  />
                </div>
                <div className={styles.champInfo}>
                  <span
                    className={styles.diffBadge}
                    style={{ color: DIFFICULTY_COLOR[champ.difficulty], borderColor: DIFFICULTY_COLOR[champ.difficulty] }}
                  >
                    {champ.difficulty}
                  </span>
                  <span className={styles.champName}>{champ.name}</span>
                  <span className={styles.champSub}>{champ.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Kart/Chassis */}
      {step === 4 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Choose Your Chassis</h2>
          <p className={styles.stepSub}>
            {isIgnite ? 'Ignite Challenge is a Margay spec series — only Margay is eligible.' : 'Your chassis defines your season difficulty.'}
          </p>
          <div className={styles.cardGrid}>
            {MANUFACTURERS.map(mfr => {
              const lockedForIgnite = isIgnite && mfr.id !== 'margay'
              const isMargay        = mfr.id === 'margay'
              const displayDifficulty = isMargay ? getMargayDifficulty() : mfr.difficulty
              const margayWarn      = isRoute66 && isMargay
              return (
                <button
                  key={mfr.id}
                  className={`${styles.card} ${manufacturer?.id === mfr.id ? styles.cardSelected : ''} ${lockedForIgnite ? styles.cardLocked : ''} ${margayWarn ? styles.cardWarn : ''}`}
                  onClick={() => !lockedForIgnite && setManufacturer(mfr)}
                  disabled={lockedForIgnite}
                >
                  <span
                    className={styles.diffBadge}
                    style={{
                      color:        lockedForIgnite ? '#888' : DIFFICULTY_COLOR[displayDifficulty],
                      borderColor:  lockedForIgnite ? '#888' : DIFFICULTY_COLOR[displayDifficulty],
                    }}
                  >
                    {lockedForIgnite ? 'IGNITE ONLY' : margayWarn ? 'DO NOT ATTEMPT' : displayDifficulty}
                  </span>
                  <img src={mfr.kart} alt={mfr.name} className={styles.kartThumb} draggable={false} />
                  <span className={styles.cardName}>{mfr.name}</span>
                  {margayWarn && (
                    <span className={styles.cardWarnText}>Margay + Route 66 is a near-impossible combination.</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 5 — Number Selection */}
      {step === 5 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Choose Your Number</h2>
          <p className={styles.stepSub}>Your kart number on the grid.</p>
          <div className={styles.numberPickerWrap}>
            <div className={styles.numberPicker}>
              {isRoute66 && <span className={styles.kartNumPrefix}>5</span>}
              <input
                ref={driverInputRef}
                type="number"
                className={styles.kartNumInput}
                min="1"
                max="99"
                value={driverNumber}
                onChange={e => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val) && val >= 1 && val <= 99) {
                    setDriverNumber(val)
                  }
                }}
                onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
              />
            </div>
            <span className={styles.numberPickerHint}>{isRoute66 ? 'Type 1–99 · your number with a 5 on the front' : 'Type 1–999'}</span>
          </div>
        </div>
      )}

      {/* Step 6 — Sponsor */}
      {step === 6 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Choose Your Sponsor</h2>
          <p className={styles.stepSub}>They fund you — you deliver results.</p>
          <div className={styles.sponsorGrid}>
            {sponsors(manufacturer).map(sp => (
              <button
                key={sp.id}
                className={`${styles.sponsorCard} ${sponsor?.id === sp.id ? styles.cardSelected : ''}`}
                onClick={() => setSponsor(sp)}
              >
                <div className={styles.sponsorLogoWrap}>
                  {sp.logoType === 'svg-bent' && <BentAxleBrosLogo size={72} />}
                  {sp.logoType === 'img'      && <img src={sp.logo} alt={sp.name} className={styles.sponsorLogo} draggable={false} />}
                </div>
                <span className={styles.sponsorPayout}>{sp.payout}</span>
                <span className={styles.sponsorReq}>{sp.requirement}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.bottomBar}>
        {(step === 1 || step === 2) && (
          <button
            className={styles.skipBtn}
            onClick={skip}
          >
            Skip
          </button>
        )}
        <button
          className={`${styles.continueBtn} ${canAdvance ? styles.continueBtnActive : ''}`}
          disabled={!canAdvance}
          onClick={advance}
        >
          {step === TOTAL_STEPS ? 'Start Career' : 'Continue'} →
        </button>
      </div>
    </div>
  )
}
