import styles from './LoadoutModal.module.css'

function ItemList({ entries }) {
  return (
    <div className={styles.itemList}>
      {entries.map(({ item, qty }) => (
        <div key={item.id} className={styles.itemRow}>
          <span className={styles.itemName}>
            {qty > 1 ? `${qty}× ` : ''}{item.name}
          </span>
          <span className={styles.itemQtyPrice}>
            ${(item.price * qty).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* Force-buy receipt shown on first hub entry */
export function ForceLoadoutModal({ entries, total, onDismiss }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Starting Loadout Applied</p>
          <p className={styles.subtitle}>
            The following items have been added to your inventory and deducted from your budget.
          </p>
        </div>
        <ItemList entries={entries} />
        <div className={styles.total}>
          <span className={styles.totalLabel}>Total Deducted</span>
          <span className={`${styles.totalValue} ${total < 0 ? styles.totalNegative : ''}`}>
            −${Math.abs(total).toFixed(2)}
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={onDismiss}>Got it</button>
        </div>
      </div>
    </div>
  )
}

/* Yes/No confirm shown when clicking Buy Standard Loadout in store */
export function LoadoutConfirmModal({ entries, total, cash, onConfirm, onCancel }) {
  const afterCash = cash - total
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Buy Standard Loadout?</p>
          <p className={styles.subtitle}>
            This will purchase the following items and deduct the total from your cash.
          </p>
        </div>
        <ItemList entries={entries} />
        <div className={styles.total}>
          <span className={styles.totalLabel}>Total</span>
          <span className={`${styles.totalValue} ${afterCash < 0 ? styles.totalNegative : ''}`}>
            ${total.toFixed(2)}
            {afterCash < 0 && <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>
              (puts you ${Math.abs(afterCash).toFixed(2)} in debt)
            </span>}
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
          <button className={styles.btnPrimary} onClick={onConfirm}>Buy</button>
        </div>
      </div>
    </div>
  )
}
