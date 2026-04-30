import { STORE_ITEMS } from '../data/storeItems'
import styles from '../screens/KartDetailScreen.module.css'

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
                <span className={styles.invItemQty}>×{qty} in stock</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {available.length === 0 && !equipped && (
        <p className={styles.noStock}>None in inventory — visit the Store.</p>
      )}
    </div>
  )
}

export default function KartWheelsComponent({ gameState, onEquip }) {
  const { parts = {}, kart } = gameState

  const wheelItems = STORE_ITEMS.filter(i => i.partsKey === 'wheel')

  function getInventoryItems(storeItemList) {
    return storeItemList.map(item => {
      const qty = parts[item.partsKey] ?? 0
      return { item, qty }
    })
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Wheels (Set)</p>
      <SlotSection
        title="Equipped Wheels"
        equipped={kart.equippedWheels}
        inventory={getInventoryItems(wheelItems)}
        onEquip={item => onEquip('equippedWheels', item)}
        onUnequip={() => onEquip('equippedWheels', null)}
      />
    </div>
  )
}
