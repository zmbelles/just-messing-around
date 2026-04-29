import GameHeader from '../components/GameHeader'
import { STORE_ITEMS } from '../data/storeItems'
import styles from './KartDetailScreen.module.css'

const TIRE_PART_KEYS = ['tiresHoosierSlick','tiresHoosierRain','tiresMGYellow','tiresMGOrange','tiresMGRed','tiresRain']
const ENGINE_PART_KEYS = ['completeEngine','lawsonPrepEngine','dmitriEngine']
const BODYWORK_PART_KEYS = ['fairing','sidePodLeft','sidePodRight','frontBumper','rearBumper']

function getTireItems(championship) {
  return STORE_ITEMS.filter(i => {
    if (!TIRE_PART_KEYS.includes(i.partsKey)) return false
    if (!i.restrictedTo) return true
    // restrictedTo can be a string or array
    const allowed = Array.isArray(i.restrictedTo) ? i.restrictedTo : [i.restrictedTo]
    return allowed.includes(championship?.id)
  })
}

function getSprocketItems(pitch, type, championship) {
  const sub = `#${pitch} ${type}`
  return STORE_ITEMS.filter(i => {
    if (i.category !== 'sprockets' || i.subcategory !== sub) return false
    if (!i.restrictedTo) return true
    const allowed = Array.isArray(i.restrictedTo) ? i.restrictedTo : [i.restrictedTo]
    return allowed.includes(championship?.id)
  })
}

function getEngineItems() {
  return STORE_ITEMS.filter(i => ENGINE_PART_KEYS.includes(i.partsKey))
}

function getBodyworkItems() {
  return STORE_ITEMS.filter(i => BODYWORK_PART_KEYS.includes(i.partsKey))
}

function renderBodyworkSlot(partKey, kart, parts) {
  const item = STORE_ITEMS.find(i => i.partsKey === partKey)
  const equipped = kart[partKey]
  const spareQty = parts[partKey] ?? 0
  const isBroken = equipped && (equipped.durability ?? 100) === 0
  const durabilityPct = equipped ? (equipped.durability ?? 100) : 0

  return (
    <button
      key={partKey}
      className={`${styles.bodyworkSlot} ${isBroken ? styles.bodyworkBroken : equipped ? styles.bodyworkEquipped : ''}`}
      onClick={() => {
        if (isBroken && spareQty > 0) {
          // Replace broken part with spare
          onEquip(partKey, item)
        }
      }}
      disabled={!isBroken && !equipped}
      title={item?.name}
    >
      {equipped ? (
        <>
          <span className={styles.bodyworkPartName}>{item?.name.split(' ')[0]}</span>
          {isBroken ? (
            <span className={styles.bodyworkStatus}>BROKEN</span>
          ) : (
            <span className={styles.bodyworkLife}>{durabilityPct}%</span>
          )}
        </>
      ) : (
        <span className={styles.bodyworkEmpty}>—</span>
      )}
    </button>
  )
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

function SlotSection({ title, equipped, inventory, onEquip, onUnequip, itemLabel }) {
  const available = inventory.filter(i => (i.qty ?? 0) > 0)
  return (
    <div className={styles.slotSection}>
      <p className={styles.slotTitle}>{title}</p>

      {/* equipped */}
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

      {/* available in inventory */}
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
  const { manufacturer, parts = {}, tires = {}, kart, championship, experience = 0 } = gameState
  const { equippedTires, equippedFrontSprocket, equippedRearSprocket, equippedEngine, frame, fairing, sidePodLeft, sidePodRight, frontBumper, rearBumper, setup } = kart
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
      let qty = 0
      if (item.partsKey && item.partsKey.startsWith('tires')) {
        // For tires, count sets with durability > 0, excluding the equipped set
        const tireSets = (tires[item.partsKey] ?? []).filter(s => s.durability > 0)
        qty = tireSets.filter((_, idx) =>
          !(equippedTires && equippedTires.partsKey === item.partsKey && equippedTires.setIndex === idx)
        ).length
      } else {
        qty = parts[item.partsKey] ?? 0
      }
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

        {/* ── Tires ── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>Tires</p>
          <SlotSection
            title="Equipped Set"
            equipped={equippedTires}
            inventory={getInventoryItems(getTireItems(championship))}
            onEquip={item => onEquip('equippedTires', item)}
            onUnequip={() => onEquip('equippedTires', null)}
          />
        </div>

        {/* ── Bodywork ── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>Bodywork</p>
          {[
            { partKey: 'fairing', label: 'Fairing' },
            { partKey: 'sidePodLeft', label: 'Left Side Pod' },
            { partKey: 'sidePodRight', label: 'Right Side Pod' },
            { partKey: 'frontBumper', label: 'Front Bumper' },
            { partKey: 'rearBumper', label: 'Rear Bumper' },
          ].map(({ partKey, label }) => (
            <SlotSection
              key={partKey}
              title={label}
              equipped={kart[partKey]}
              inventory={getInventoryItems([STORE_ITEMS.find(i => i.partsKey === partKey)].filter(Boolean))}
              onEquip={item => onEquip(partKey, item)}
              onUnequip={() => onEquip(partKey, null)}
            />
          ))}
        </div>

        {/* ── Engine ── */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>Engine</p>
          <SlotSection
            title="Equipped Engine"
            equipped={equippedEngine}
            inventory={getInventoryItems(getEngineItems())}
            onEquip={item => onEquip('equippedEngine', item)}
            onUnequip={() => onEquip('equippedEngine', null)}
          />
        </div>

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

        {/* ── Frame ── */}
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
