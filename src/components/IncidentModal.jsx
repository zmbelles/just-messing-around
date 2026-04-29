import styles from './IncidentModal.module.css'

const PART_NAMES = {
  frontBumper:     'Front Bumper',
  rearBumper:      'Rear Bumper',
  sidePodLeft:     'Side Pod — Left',
  sidePodRight:    'Side Pod — Right',
  bumperClips:     'Bumper Clips',
  fairing:         'Fairing',
  chain35:         '#35 Chain',
  chain219:        '#219 Chain',
  wheel:           'Wheel',
  spindleArmLeft:  'Spindle Arm — Left',
  spindleArmRight: 'Spindle Arm — Right',
  axle:            'Axle',
  tiresEquipped:   'Tires (equipped set)',
  engineEquipped:  'Engine',
  frame:           'Frame',
}

function checkAvailable(partKey, gameState) {
  const { parts, consumables } = gameState
  if (partKey === 'frame') return false  // never fixable on-site
  if (partKey === 'bumperClips') return (consumables.bumperClips ?? 0) > 0
  if (partKey === 'tiresEquipped') {
    return Object.entries(parts).some(([k, v]) => k.startsWith('tires') && v >= 4)
  }
  if (partKey === 'engineEquipped') {
    return ['completeEngine', 'lawsonPrepEngine', 'dmitriEngine'].some(k => (parts[k] ?? 0) > 0)
  }
  return (parts[partKey] ?? 0) > 0
}

function boltCost(parts) {
  return parts.filter(p => p !== 'bumperClips' && p !== 'frame').length
}

export default function IncidentModal({ crash, gameState, onFix, onRetire }) {
  if (!crash) return null
  const { intensityLabel, parts, frameBent } = crash
  const { consumables } = gameState

  const allAvailable   = parts.every(p => checkAvailable(p, gameState))
  const boltsNeeded    = boltCost(parts)
  const boltsAvailable = consumables.nutsAndBolts ?? 0
  const canFix = !frameBent && allAvailable && boltsAvailable >= boltsNeeded

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.badge}>
          <span className={styles.badgeLabel}>{intensityLabel} Crash</span>
        </div>
        <h2 className={styles.title}>
          {frameBent ? 'Frame Destroyed — Retire from Event' : `Damage Assessment`}
        </h2>
        <p className={styles.subtitle}>
          {frameBent
            ? 'The frame is bent beyond field repair. Your weekend is over.'
            : 'The following parts were damaged. Review your inventory below.'}
        </p>

        <div className={styles.partsList}>
          {parts.map(p => {
            const avail = checkAvailable(p, gameState)
            const isFrame = p === 'frame'
            return (
              <div key={p} className={`${styles.partRow} ${isFrame ? styles.partRowFrame : ''}`}>
                <span className={styles.partName}>{PART_NAMES[p] ?? p}</span>
                <span className={`${styles.partStatus} ${avail ? styles.partAvail : styles.partMissing}`}>
                  {isFrame ? 'Cannot repair on-site' : avail ? 'In inventory ✓' : 'Not in inventory ✗'}
                </span>
              </div>
            )
          })}
        </div>

        {!frameBent && (
          <div className={styles.boltRow}>
            <span className={styles.boltLabel}>Nuts & Bolts needed:</span>
            <span className={`${styles.boltVal} ${boltsAvailable < boltsNeeded ? styles.boltMissing : styles.boltOk}`}>
              {boltsNeeded} (have {boltsAvailable})
            </span>
          </div>
        )}

        <div className={styles.actions}>
          {!frameBent && (
            <button
              className={`${styles.fixBtn} ${!canFix ? styles.fixBtnDisabled : ''}`}
              disabled={!canFix}
              onClick={onFix}
            >
              Fix &amp; Continue →
            </button>
          )}
          <button className={styles.retireBtn} onClick={onRetire}>
            Retire from Event
          </button>
        </div>

        {!frameBent && !canFix && (
          <p className={styles.cantFixNote}>
            {!allAvailable ? 'Missing required parts — cannot repair on-site.' : `Need ${boltsNeeded} nuts & bolts to install parts.`}
          </p>
        )}
      </div>
    </div>
  )
}
