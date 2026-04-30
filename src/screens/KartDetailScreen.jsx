import GameHeader from '../components/GameHeader'
import KartTiresComponent from '../components/KartTiresComponent'
import KartBodyworkComponent from '../components/KartBodyworkComponent'
import KartEngineComponent from '../components/KartEngineComponent'
import KartFrameComponent from '../components/KartFrameComponent'
import KartAxleComponent from '../components/KartAxleComponent'
import KartWheelsComponent from '../components/KartWheelsComponent'
import { STORE_ITEMS } from '../data/storeItems'
import styles from './KartDetailScreen.module.css'

function getSprocketItems(pitch, type, championship) {
  const sub = `#${pitch} ${type}`
  return STORE_ITEMS.filter(i => {
    if (i.category !== 'sprockets' || i.subcategory !== sub) return false
    if (!i.restrictedTo) return true
    const allowed = Array.isArray(i.restrictedTo) ? i.restrictedTo : [i.restrictedTo]
    return allowed.includes(championship?.id)
  })
}

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
      {available.length === 0 && !equipped && (
        <p className={styles.noStock}>None in inventory — visit the Store.</p>
      )}
    </div>
  )
}

function AdjustRow({ label, value, display, onDown, onUp, downDisabled, upDisabled }) {
  return (
    <div className={styles.adjustRow}>
      <span className={styles.adjustLabel}>{label}</span>
      <div className={styles.adjustControls}>
        <button className={styles.adjBtn} onClick={onDown} disabled={downDisabled}>−</button>
        <span className={styles.adjustValue}>{display ?? value}</span>
        <button className={styles.adjBtn} onClick={onUp}   disabled={upDisabled}>+</button>
      </div>
    </div>
  )
}

export default function KartDetailScreen({ gameState, onBack, onEquip, onSetupChange }) {
  const { manufacturer, parts = {}, kart, championship, experience = 0 } = gameState
  const { equippedFrontSprocket, equippedRearSprocket, setup } = kart
  const isRoute66  = championship.id === 'route66'
  const isIgnite   = championship.id === 'ignite-challenge'
  const pitch      = isRoute66 ? 219 : 35
  const hasMyChron = (parts.mychron ?? 0) > 0

  function shouldShowHint() {
    if (experience >= 100) return true
    if (experience >= 75) return Math.random() < 0.333
    if (experience >= 51) return Math.random() < 0.2
    if (experience >= 21) return true
    return Math.random() < 0.333
  }

  const showHint = shouldShowHint()

  function getInventoryItems(storeItemList) {
    return storeItemList.map(item => {
      const qty = parts[item.partsKey] ?? 0
      return { item, qty }
    })
  }

  function updateSetup(key, val) {
    onSetupChange({ ...kart, setup: { ...setup, [key]: val } })
  }

  return (
    <div className={styles.screen}>
      <GameHeader gameState={gameState} />

      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Chassis</button>
        <div className={styles.kartTitle}>
          <img src={manufacturer.kart} alt={manufacturer.name} className={styles.kartThumb} draggable={false} />
          <span className={styles.kartName}>{manufacturer.name}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <KartTiresComponent gameState={gameState} onEquip={onEquip} championship={championship} />
        <KartBodyworkComponent gameState={gameState} onEquip={onEquip} />
        <KartEngineComponent gameState={gameState} onEquip={onEquip} />
        <KartFrameComponent gameState={gameState} />
        <KartAxleComponent gameState={gameState} onEquip={onEquip} />
        <KartWheelsComponent gameState={gameState} onEquip={onEquip} />

        {/* ── Sprockets ── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>Sprockets</p>
          {!isIgnite && (
            <SlotSection
              title={`#${pitch} Front Sprocket`}
              equipped={equippedFrontSprocket}
              inventory={getInventoryItems(getSprocketItems(pitch, 'Front', championship))}
              onEquip={item => onEquip('equippedFrontSprocket', item)}
              onUnequip={() => onEquip('equippedFrontSprocket', null)}
            />
          )}
          <SlotSection
            title={`#${pitch} Rear Sprocket`}
            equipped={equippedRearSprocket}
            inventory={getInventoryItems(getSprocketItems(pitch, 'Rear', championship))}
            onEquip={item => onEquip('equippedRearSprocket', item)}
            onUnequip={() => onEquip('equippedRearSprocket', null)}
          />
        </div>

        {/* ── Setup ── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>Setup</p>
          {!hasMyChron ? (
            <div className={styles.noMyChron}>
              <span className={styles.noMyChronIcon}>⏱</span>
              <p className={styles.noMyChronText}>No MyChron installed — you can't read lap times so there's no way to know if a change helped. Buy one from the Store.</p>
            </div>
          ) : (
            <>
            {showHint && (
              <div className={styles.setupHint}>
                💡 Hints: wider track helps with grip on smooth turns; taller ride height helps on bumpy tracks; adjust sprockets for track speeds.
              </div>
            )}
            <div className={styles.setupList}>
              <AdjustRow
                label="Rear Track Width"
                value={setup.rearTrackWidth}
                display={`${setup.rearTrackWidth.toFixed(1)}"`}
                onDown={() => updateSetup('rearTrackWidth', Math.max(52, setup.rearTrackWidth - 0.5))}
                onUp={()   => updateSetup('rearTrackWidth', Math.min(58, setup.rearTrackWidth + 0.5))}
                downDisabled={setup.rearTrackWidth <= 52}
                upDisabled={setup.rearTrackWidth >= 58}
              />
              <AdjustRow
                label="Front Track Width"
                value={setup.frontTrackWidth}
                display={`${setup.frontTrackWidth.toFixed(1)}"`}
                onDown={() => updateSetup('frontTrackWidth', Math.max(43, +(setup.frontTrackWidth - 0.5).toFixed(1)))}
                onUp={()   => updateSetup('frontTrackWidth', Math.min(47, +(setup.frontTrackWidth + 0.5).toFixed(1)))}
                downDisabled={setup.frontTrackWidth <= 43}
                upDisabled={setup.frontTrackWidth >= 47}
              />
              <AdjustRow
                label="Front Ride Height"
                value={setup.frontShims}
                display={`${setup.frontShims} shim${setup.frontShims !== 1 ? 's' : ''}`}
                onDown={() => updateSetup('frontShims', Math.max(0, setup.frontShims - 1))}
                onUp={()   => updateSetup('frontShims', Math.min(6, setup.frontShims + 1))}
                downDisabled={setup.frontShims <= 0}
                upDisabled={setup.frontShims >= 6}
              />
            </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
