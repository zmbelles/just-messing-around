import styles from '../screens/KartDetailScreen.module.css'

function DurabilityBar({ value }) {
  const pct   = Math.max(0, Math.min(100, value))
  const color = pct > 60 ? '#45e87a' : pct > 30 ? '#e8b84b' : '#e85555'
  return (
    <div className={styles.durabilityBar}>
      <div className={styles.durabilityFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function KartFrameComponent({ gameState }) {
  const { kart } = gameState
  const { frame } = kart

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Frame</p>
      {frame ? (
        <div className={styles.slotSection}>
          <p className={styles.slotTitle}>Equipped Frame</p>
          <div className={`${styles.equippedSlot} ${frame ? styles.equippedSlotFilled : ''}`}>
            <div className={styles.equippedInfo}>
              <span className={styles.equippedName}>{frame.name}</span>
              <div className={styles.equippedDur}>
                <DurabilityBar value={frame.durability} />
                <span className={styles.durLabel}>{Math.round(frame.durability)}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.slotTitle}>No frame equipped</p>
      )}
    </div>
  )
}
