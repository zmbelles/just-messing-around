import styles from './GameHeader.module.css'

const CONSUMABLE_REQS = { oil: 1, triFlow: 1, chainLube: 1, fuel: 3 }

const CONSUMABLE_LABELS = {
  oil:          'Oil',
  triFlow:      'Tri-Flow',
  chainLube:    'Chain Lube',
  fuel:         'Fuel',
  nutsAndBolts: 'Nuts & Bolts',
}

export default function GameHeader({ gameState }) {
  const { teamName, cash, reputation, experience, consumables } = gameState

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.teamName}>{teamName}</span>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Cash</span>
            <span className={styles.statValue}>${cash.toLocaleString()}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statLabel}>Reputation</span>
            <div className={styles.barRow}>
              <span className={styles.statValue}>{reputation}</span>
              <div className={styles.bar}>
                <div className={styles.repFill} style={{ width: `${Math.min(reputation, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statLabel}>Experience</span>
            <div className={styles.barRow}>
              <span className={styles.statValue}>{Math.floor(experience)}</span>
              <div className={styles.bar}>
                <div className={styles.expFill} style={{ width: `${Math.min(experience, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.consumables}>
        {Object.entries(CONSUMABLE_LABELS).map(([key, label]) => {
          const count    = consumables[key] ?? 0
          const required = CONSUMABLE_REQS[key]
          const low      = required !== undefined && count < required
          return (
            <div key={key} className={`${styles.consumable} ${low ? styles.consumableLow : ''}`}>
              <span className={styles.consumableCount}>{count}</span>
              <span className={styles.consumableLabel}>{label}</span>
            </div>
          )
        })}
      </div>
    </header>
  )
}
