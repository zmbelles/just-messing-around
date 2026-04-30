import { STORE_ITEMS } from '../data/storeItems'
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

function SlotSection({ title, equipped, inventory, onEquip, onUnequip }) {
  const available = inventory.filter(i => (i.qty ?? 0) > 0)
  return (
    <div className={styles.slotSection}>
      <p className={styles.slotTitle}>{title}</p>
      <div className={`${styles.equippedSlot} ${equipped ? styles.equippedSlotFilled : ''}`}>
        {equipped ? (
          <>
            <div className={styles.equippedInfo}>
              <span className={styles.equippedName}>{equipped.name}</span>
              {equipped.durability !== undefined && (
                <div className={styles.equippedDur}>
                  <DurabilityBar value={equipped.durability} />
                  <span className={styles.durLabel}>{Math.round(equipped.durability)}%</span>
                </div>
              )}
            </div>
            <button className={styles.unequipBtn} onClick={onUnequip}>Remove</button>
          </>
        ) : (
          <span className={styles.emptySlot}>Nothing equipped</span>
        )}
      </div>
      {available.length > 0 && (
        <div className={styles.inventoryList}>
          {available.map(({ item, qty }) => (
            <button
              key={item.id}
              className={styles.inventoryItem}
              onClick={() => onEquip(item)}
            >
              <span className={styles.invItemName}>{item.name}</span>
              <span className={styles.invItemMeta}>
                {item.durability !== undefined && (
                  <span className={styles.invItemLife}>Lifespan 100% · Fresh</span>
                )}
                <span className={styles.invItemQty}>×{qty} in stock</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KartAxleComponent({ gameState, onEquip }) {
  const { parts = {}, kart } = gameState

  const axleItems = STORE_ITEMS.filter(i => i.partsKey === 'axle')

  function getInventoryItems(storeItemList) {
    return storeItemList.map(item => {
      const qty = parts[item.partsKey] ?? 0
      return { item, qty }
    })
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Axle</p>
      <SlotSection
        title="Equipped Axle"
        equipped={kart.equippedAxle}
        inventory={getInventoryItems(axleItems)}
        onEquip={item => onEquip('equippedAxle', item)}
        onUnequip={() => onEquip('equippedAxle', null)}
      />
    </div>
  )
}
