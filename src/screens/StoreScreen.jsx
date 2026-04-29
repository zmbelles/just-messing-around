import { useState, useEffect } from 'react'
import { CATEGORIES, STORE_ITEMS } from '../data/storeItems'
import { getLoadout, getLoadoutTotal } from '../data/loadouts'
import { LoadoutConfirmModal } from '../components/LoadoutModal'
import styles from './StoreScreen.module.css'
import { soundManager, SOUNDS } from '../utils/soundManager'

function playHoverSound() {
  soundManager.playEffect(SOUNDS.hoverEffect)
}

export default function StoreScreen({ gameState, onPurchase, onBuyLoadout, onBack }) {
  const [activeCategory, setActiveCategory] = useState('consumables')
  const [activeSubcat,   setActiveSubcat]   = useState(null)
  const [showConfirm,    setShowConfirm]    = useState(false)


  const { cash, consumables, parts = {}, tires = {}, championship, season = 1 } = gameState
  const loadoutEntries = getLoadout(championship)
  const loadoutTotal   = getLoadoutTotal(championship)

  const currentCat = CATEGORIES.find(c => c.id === activeCategory)

  function selectCategory(id) {
    setActiveCategory(id)
    const cat = CATEGORIES.find(c => c.id === id)
    setActiveSubcat(cat?.subcategories?.[0] ?? null)
  }

  function getQty(item) {
    if (item.inventoryKey) return consumables[item.inventoryKey] ?? 0
    if (item.partsKey && item.partsKey.startsWith('tires')) {
      // Count tire sets with durability > 0
      return (tires[item.partsKey] ?? []).filter(s => s.durability > 0).length
    }
    if (item.partsKey)     return parts[item.partsKey] ?? 0
    return 0
  }

  function handleBuy(item) {
    if (cash < item.price) return
    onPurchase(item)
  }

  const visible = STORE_ITEMS.filter(i => {
    if (i.category !== activeCategory) return false
    if (activeSubcat && i.subcategory)  return i.subcategory === activeSubcat
    return true
  })

  return (
    <>
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Hub</button>
        <div className={styles.topRight}>
          <button className={styles.loadoutBtn} onClick={() => setShowConfirm(true)}>
            Buy Standard Loadout
          </button>
          <div className={styles.cashDisplay}>
            <span className={styles.cashLabel}>Cash</span>
            <span className={styles.cashValue}>${cash.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* sidebar */}
        <nav className={styles.sidebar}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.catBtn} ${activeCategory === cat.id ? styles.catBtnActive : ''}`}
              onClick={() => selectCategory(cat.id)}
              onMouseEnter={playHoverSound}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* main content */}
        <div className={styles.content}>
          {/* subcategory tabs */}
          {currentCat?.subcategories && (
            <div className={styles.subcatTabs}>
              {currentCat.subcategories.map(sub => (
                <button
                  key={sub}
                  className={`${styles.subcatTab} ${activeSubcat === sub ? styles.subcatTabActive : ''}`}
                  onClick={() => setActiveSubcat(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* item grid */}
          <div className={styles.itemGrid}>
            {visible.map(item => {
              const qty        = getQty(item)
              const canAfford  = cash >= item.price
              const seasonLock = item.lockedUntilSeason && season < item.lockedUntilSeason
              return (
                <div key={item.id} className={`${styles.itemCard} ${item.restrictedTo ? styles.itemCardRestricted : ''} ${seasonLock ? styles.itemCardLocked : ''}`}>
                  <div className={styles.itemTop}>
                    <div>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemDesc}>{item.desc}</p>
                    </div>
                    {item.restrictedTo && (
                      <span className={styles.restrictedBadge}>{item.restrictedTo} only</span>
                    )}
                    {seasonLock && (
                      <span className={styles.seasonLockBadge}>Season {item.lockedUntilSeason}</span>
                    )}
                  </div>
                  <div className={styles.itemBottom}>
                    <span className={styles.itemPrice}>
                      ${item.price.toFixed(2)} <span className={styles.itemUnit}>/ {item.unit}</span>
                    </span>
                    <div className={styles.buyRow}>
                      <span className={styles.ownedCount}>
                        {seasonLock ? 'Locked' : item.partsKey?.startsWith('tires') ? `${qty} sets` : `Owned: ${qty}`}
                      </span>
                      <button
                        className={`${styles.buyBtn} ${canAfford && !seasonLock ? styles.buyBtnActive : ''}`}
                        disabled={!canAfford || seasonLock}
                        onClick={() => handleBuy(item)}
                        onMouseEnter={playHoverSound}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
    {showConfirm && (
      <LoadoutConfirmModal
        entries={loadoutEntries}
        total={loadoutTotal}
        cash={cash}
        onConfirm={() => { onBuyLoadout(); setShowConfirm(false) }}
        onCancel={() => setShowConfirm(false)}
      />
    )}
  </>
  )
}
