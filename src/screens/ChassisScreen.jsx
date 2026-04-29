import { useEffect } from 'react'
import GameHeader from '../components/GameHeader'
import { STORE_ITEMS } from '../data/storeItems'
import styles from './ChassisScreen.module.css'
import { soundManager, SOUNDS } from '../utils/soundManager'

function playHoverSound() {
  soundManager.playEffect(SOUNDS.hoverEffect)
}

const SERVICES = [
  { id: 'coaching',      name: 'Race Coach',        desc: 'Practice with a veteran that dials in your setup for you.',  price: 500, wip: false },
  { id: 'alignment',     name: 'Chassis Alignment', desc: 'Set caster, camber, and toe to spec.',                price: 75,  wip: false },
  { id: 'clutchRebuild', name: 'Clutch Rebuild',    desc: 'Disassemble, clean, and re-spring the wet clutch.',   price: 60,  wip: false },
  { id: 'carbRebuild',   name: 'Carb Rebuild',      desc: 'Full carburetor teardown, clean, and re-jet.',        price: 55,  wip: false },
  { id: 'engineRebuild', name: 'Engine Rebuild',    desc: 'Full teardown and inspection by a tech.',             price: 200, wip: false },
  { id: 'frameTable',    name: 'Frame Table',       desc: 'Straighten a bent frame back to spec.',               price: 500, wip: false },
  { id: 'dyno',          name: 'Dyno Tune',         desc: 'Carb tune on the dyno for max power.',                price: 150, wip: true  },
]

function getPartsInventory(parts) {
  return STORE_ITEMS
    .filter(item => item.partsKey && !item.partsKey.startsWith('tires') && (parts[item.partsKey] ?? 0) > 0)
    .map(item => ({ ...item, qty: parts[item.partsKey] }))
}

function getTireInventory(tires) {
  const result = []
  for (const [tireKey, sets] of Object.entries(tires)) {
    const item = STORE_ITEMS.find(i => i.partsKey === tireKey)
    if (item && sets.length > 0) {
      // Create one entry per tire set (don't group)
      sets.forEach((set, setIdx) => {
        if (set.durability > 0) {
          result.push({ ...item, durability: set.durability, setIndex: setIdx, tireKey })
        }
      })
    }
  }
  return result
}

export default function ChassisScreen({ gameState, onNavigate, onBack, onOpenKart, onService }) {
  const { manufacturer, parts = {}, tires = {}, kart = {} } = gameState
  const equippedTires = kart.equippedTires
  const ownedParts = getPartsInventory(parts)
  const ownedTires = getTireInventory(tires).filter(tire => {
    // Exclude the currently equipped tire set
    if (!equippedTires) return true
    const isEquipped =
      equippedTires.partsKey === tire.tireKey &&
      equippedTires.setIndex === tire.setIndex &&
      equippedTires.setIndex >= 0
    return !isEquipped
  })


  return (
    <div className={styles.screen}>
      <GameHeader gameState={gameState} />

      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Hub</button>
      </div>

      <div className={styles.grid}>

        {/* Box 1 — Your Kart */}
        <button className={`${styles.card} ${styles.kartCardClickable}`} onClick={onOpenKart} onMouseEnter={playHoverSound}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Your Kart</span>
          </div>
          <div className={styles.kartCard}>
            <img
              src={manufacturer.kart}
              alt={manufacturer.name}
              className={styles.kartImg}
              draggable={false}
            />
            <div className={styles.kartInfo}>
              <p className={styles.kartName}>{manufacturer.name}</p>
              <p className={styles.kartSub}>Chassis</p>
            </div>
          </div>
        </button>

        {/* Box 2 — Other Parts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Other Parts</span>
            {ownedParts.length > 0 && (
              <span className={styles.partCount}>{ownedParts.length} type{ownedParts.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {ownedParts.length === 0 ? (
            <p className={styles.emptyNote}>No other parts in inventory.</p>
          ) : (
            <div className={styles.partsList}>
              {ownedParts.map(item => (
                <div key={item.id} className={styles.partRow}>
                  <span className={styles.partName}>{item.name}</span>
                  <span className={styles.partQty}>×{item.qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Box 3 — Services */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Services</span>
          </div>
          <div className={styles.servicesList}>
            {SERVICES.filter(svc => {
              // Only show frameTable if frame is broken
              if (svc.id === 'frameTable') return kart?.frame?.durability === 0
              return true
            }).map(svc => (
              <button
                key={svc.id}
                className={`${styles.serviceRow} ${svc.wip ? styles.serviceWip : styles.serviceClickable}`}
                disabled={svc.wip || gameState.cash < svc.price}
                onClick={() => !svc.wip && onService?.(svc.id, svc.price)}
                onMouseEnter={(!svc.wip && gameState.cash >= svc.price) ? playHoverSound : undefined}
              >
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceName}>{svc.name}</span>
                  <span className={styles.serviceDesc}>{svc.desc}</span>
                </div>
                <div className={styles.serviceRight}>
                  {svc.wip
                    ? <span className={styles.wipBadge}>Soon</span>
                    : <span className={`${styles.servicePrice} ${gameState.cash < svc.price ? styles.servicePriceLow : ''}`}>${svc.price}</span>
                  }
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Box 4 — Tires */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Tires</span>
            {equippedTires && (
              <span className={styles.partCount}>1 equipped</span>
            )}
          </div>
          {equippedTires ? (
            <div className={styles.equippedBox}>
              <p className={styles.equippedName}>{equippedTires.name}</p>
              <p className={styles.equippedMeta}>Durability: {equippedTires.durability}%</p>
            </div>
          ) : (
            <p className={styles.emptyNote}>No tires equipped.</p>
          )}
          {ownedTires.length > 0 && (
            <>
              <p className={styles.inventoryLabel}>In Inventory:</p>
              <div className={styles.partsList}>
                {ownedTires.map((tire) => (
                  <div key={`${tire.tireKey}-${tire.setIndex}`} className={styles.partRow}>
                    <span className={styles.partName}>{tire.name}</span>
                    <span className={styles.partQty}>{Math.round(tire.durability)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
