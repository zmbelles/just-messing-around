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
          {available.map(({ item, qty }) => {
            const isTire = item.partsKey?.startsWith('tires')
            const qtyLabel = isTire ? `×${qty} set${qty !== 1 ? 's' : ''}` : `×${qty} in stock`
            return (
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
                  <span className={styles.invItemQty}>{qtyLabel}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
      {available.length === 0 && !equipped && (
        <p className={styles.noStock}>None in inventory — visit the Store.</p>
      )}
    </div>
  )
}

export default function KartTiresComponent({ gameState, onEquip, championship }) {
  const { tires = {}, kart } = gameState
  const { equippedTires } = kart

  const TIRE_PART_KEYS = ['tiresHoosierSlick','tiresHoosierRain','tiresMGYellow','tiresMGOrange','tiresMGRed','tiresRain']
  const tireItems = STORE_ITEMS.filter(i => {
    if (!TIRE_PART_KEYS.includes(i.partsKey)) return false
    if (!i.restrictedTo) return true
    const allowed = Array.isArray(i.restrictedTo) ? i.restrictedTo : [i.restrictedTo]
    return allowed.includes(championship?.id)
  })

  function getInventoryItems(storeItemList) {
    return storeItemList.map(item => {
      let qty = 0
      if (item.partsKey && item.partsKey.startsWith('tires')) {
        const tireSets = (tires[item.partsKey] ?? []).filter(s => s.durability > 0)
        qty = tireSets.filter((_, idx) =>
          !(equippedTires && equippedTires.partsKey === item.partsKey && equippedTires.setIndex === idx)
        ).length
      }
      return { item, qty }
    })
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Tires</p>
      <SlotSection
        title="Equipped Set"
        equipped={equippedTires}
        inventory={getInventoryItems(tireItems)}
        onEquip={item => onEquip('equippedTires', item)}
        onUnequip={() => onEquip('equippedTires', null)}
      />
    </div>
  )
}
