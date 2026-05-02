import { useState } from 'react'
import { STORE_ITEMS } from '../data/storeItems'
import styles from '../screens/KartDetailScreen.module.css'

const TIRE_PART_KEYS = ['tiresHoosierSlick','tiresHoosierRain','tiresMGYellow','tiresMGOrange','tiresMGRed','tiresRain']

function DurabilityBar({ value }) {
  const pct   = Math.max(0, Math.min(100, value))
  const color = pct > 60 ? '#45e87a' : pct > 30 ? '#e8b84b' : '#e85555'
  return (
    <div className={styles.durabilityBar}>
      <div className={styles.durabilityFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function KartTiresComponent({ gameState, onEquip, championship }) {
  const { tires = {}, kart } = gameState
  const { equippedTires } = kart
  const [drillDownItem, setDrillDownItem] = useState(null)

  const tireItems = STORE_ITEMS.filter(i => {
    if (!TIRE_PART_KEYS.includes(i.partsKey)) return false
    if (!i.restrictedTo) return true
    const allowed = Array.isArray(i.restrictedTo) ? i.restrictedTo : [i.restrictedTo]
    return allowed.includes(championship?.id)
  })

  function getSetCount(partsKey) {
    const allSets = (tires[partsKey] ?? []).filter(s => s.durability > 0)
    return allSets.length
  }

  function getAllSetsForType(partsKey) {
    const allSets = tires[partsKey] ?? []
    return allSets
      .map((set, idx) => ({ ...set, originalIndex: idx }))
      .filter(s => s.durability > 0)
  }

  function handleSelectSet(item, setIndex) {
    onEquip('equippedTires', item, setIndex)
    setDrillDownItem(null)
  }

  const availableTireItems = tireItems.filter(item => getSetCount(item.partsKey) > 0 || (equippedTires && equippedTires.partsKey === item.partsKey))

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Tires</p>

      <div className={styles.slotSection}>
        <p className={styles.slotTitle}>Equipped Set</p>
        <div className={`${styles.equippedSlot} ${equippedTires ? styles.equippedSlotFilled : ''}`}>
          {equippedTires ? (
            <>
              <div className={styles.equippedInfo}>
                <span className={styles.equippedName}>{equippedTires.name}</span>
                <div className={styles.equippedDur}>
                  <DurabilityBar value={equippedTires.durability} />
                  <span className={styles.durLabel}>{Math.round(equippedTires.durability)}%</span>
                </div>
              </div>
              <button className={styles.unequipBtn} onClick={() => onEquip('equippedTires', null)}>Remove</button>
            </>
          ) : (
            <span className={styles.emptySlot}>Nothing equipped</span>
          )}
        </div>

        {availableTireItems.length > 0 ? (
          <div className={styles.inventoryList}>
            {availableTireItems.map(item => {
              const count = getSetCount(item.partsKey)
              return (
                <button
                  key={item.id}
                  className={styles.inventoryItem}
                  onClick={() => setDrillDownItem(item)}
                >
                  <span className={styles.invItemName}>{item.name}</span>
                  <span className={styles.invItemMeta}>
                    <span className={styles.invItemQty}>×{count} set{count !== 1 ? 's' : ''}</span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          !equippedTires && <p className={styles.noStock}>None in inventory — visit the Store.</p>
        )}
      </div>

      {drillDownItem && (
        <div className={styles.tireModalOverlay} onClick={() => setDrillDownItem(null)}>
          <div className={styles.tireModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.tireModalClose} onClick={() => setDrillDownItem(null)}>×</button>
            <h3 className={styles.tireModalTitle}>{drillDownItem.name}</h3>
            <p className={styles.tireModalSub}>Click a set to equip it.</p>

            <div className={styles.tireSetList}>
              {getAllSetsForType(drillDownItem.partsKey).map(set => {
                const isEquipped = equippedTires && equippedTires.partsKey === drillDownItem.partsKey && equippedTires.setIndex === set.originalIndex
                const displayDurability = isEquipped ? equippedTires.durability : set.durability
                return (
                  <button
                    key={set.originalIndex}
                    className={`${styles.tireSetItem} ${isEquipped ? styles.tireSetItemEquipped : ''}`}
                    onClick={() => !isEquipped && handleSelectSet(drillDownItem, set.originalIndex)}
                    disabled={isEquipped}
                  >
                    <div className={styles.tireSetHeader}>
                      <span className={styles.tireSetLabel}>Set #{set.originalIndex + 1}</span>
                      {isEquipped && <span className={styles.tireSetEquippedBadge}>EQUIPPED</span>}
                    </div>
                    <div className={styles.tireSetDurability}>
                      <DurabilityBar value={displayDurability} />
                      <span className={styles.durLabel}>{Math.round(displayDurability)}%</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
