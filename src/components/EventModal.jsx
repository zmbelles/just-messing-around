import styles from './EventModal.module.css'

const TIER_LABEL  = { good: '★ Good Event', neutral: '● Event', bad: '⚠ Bad Event' }
const TIER_CLASS  = { good: styles.tierGood, neutral: styles.tierNeutral, bad: styles.tierBad }

const CONSUMABLE_LABEL = {
  oil:          'Oil',
  triFlow:      'Tri-Flow',
  chainLube:    'Chain Lube',
  fuel:         'Fuel',
  nutsAndBolts: 'Nuts & Bolts',
  bumperClips:  'Bumper Clips',
}

function fmtMoney(n) {
  const sign = n >= 0 ? '+' : '−'
  return `${sign}$${Math.abs(n).toLocaleString()}`
}

function effectLine(fx) {
  switch (fx.type) {
    case 'cash':              return { sign: fx.amount >= 0 ? 'good' : 'bad', text: fmtMoney(fx.amount) }
    case 'cashRandom': {
      const amount = Math.round(fx.min + Math.random() * (fx.max - fx.min))
      return { sign: 'good', text: fmtMoney(amount) }
    }
    case 'reputation':        return { sign: fx.amount >= 0 ? 'good' : 'bad', text: `${fx.amount >= 0 ? '+' : '−'}${Math.abs(fx.amount)} reputation` }
    case 'experience':        return { sign: fx.amount >= 0 ? 'good' : 'bad', text: `${fx.amount >= 0 ? '+' : '−'}${Math.abs(fx.amount)} experience` }
    case 'consumable': {
      const label = CONSUMABLE_LABEL[fx.key] ?? fx.key
      return { sign: fx.amount >= 0 ? 'good' : 'bad', text: `${fx.amount >= 0 ? '+' : '−'}${Math.abs(fx.amount)} ${label}` }
    }
    case 'addTires':          return { sign: 'good',    text: '+1 set of tires' }
    case 'removeRandomParts': return { sign: 'bad',     text: `−${fx.count} random part${fx.count === 1 ? '' : 's'}` }
    case 'dnf':               return { sign: 'bad',     text: 'DNF this session' }
    case 'unlockDmitri':      return { sign: 'good',    text: 'Unlocks Dmitri engine source' }
    case 'addDmitriEngine':   return { sign: 'good',    text: '+1 Dmitri engine' }
    default:                  return null
  }
}

function EffectList({ effects, requireCash }) {
  const lines = []
  if (requireCash) lines.push({ sign: 'bad', text: fmtMoney(-requireCash) })
  for (const fx of (effects ?? [])) {
    const line = effectLine(fx)
    if (line) lines.push(line)
  }
  if (lines.length === 0) return null
  return (
    <div className={styles.effects}>
      {lines.map((l, i) => (
        <span
          key={i}
          className={`${styles.effect} ${
            l.sign === 'good' ? styles.effectGood
            : l.sign === 'bad' ? styles.effectBad
            : styles.effectNeutral
          }`}
        >
          {l.text}
        </span>
      ))}
    </div>
  )
}

export default function EventModal({ event, gameState, onResolve }) {
  if (!event) return null
  const { choices, tier, title, description, effects } = event

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={`${styles.tier} ${TIER_CLASS[tier] ?? ''}`}>{TIER_LABEL[tier] ?? 'Event'}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>{description}</p>

        {choices ? (
          <div className={styles.choices}>
            {choices.map(c => {
              const cantAfford = c.requireCash && gameState.cash < c.requireCash
              return (
                <button
                  key={c.id}
                  className={`${styles.choiceBtn} ${cantAfford ? styles.choiceBtnLocked : ''}`}
                  disabled={cantAfford}
                  onClick={() => onResolve(c.id)}
                >
                  <div className={styles.choiceBody}>
                    <span className={styles.choiceLabel}>{c.label}</span>
                    <EffectList effects={c.effects} requireCash={c.requireCash} />
                  </div>
                  {cantAfford && <span className={styles.cantAfford}>Can't afford</span>}
                </button>
              )
            })}
          </div>
        ) : (
          <>
            <EffectList effects={effects} />
            <button className={styles.continueBtn} onClick={() => onResolve(null)}>
              Continue →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
