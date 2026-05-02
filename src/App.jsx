import { useState } from 'react'
import TitleScreen     from './screens/TitleScreen'
import NewCareerScreen from './screens/NewCareerScreen'
import HubScreen       from './screens/HubScreen'
import StoreScreen     from './screens/StoreScreen'
import ChassisScreen      from './screens/ChassisScreen'
import KartDetailScreen   from './screens/KartDetailScreen'
import RaceScreen         from './screens/RaceScreen'
import ChampionshipResultsScreen from './screens/ChampionshipResultsScreen'
import ChampionshipCompleteModal from './screens/ChampionshipCompleteModal'
import CreditsScreen from './screens/CreditsScreen'
import { ForceLoadoutModal } from './components/LoadoutModal'
import CompetitorScreen from './screens/CompetitorScreen'
import { getLoadout, getLoadoutTotal } from './data/loadouts'
import { getCoachingSetup } from './data/coachingSetups'
import { buildBlankStandings, buildBlankChampionshipPoints } from './data/competitors'
import { getSessions } from './data/sessions'
import { simulateSession } from './data/raceSimulation'
import {
  mustTriggerEvent, rollEventChance, rollEventTier,
} from './data/raceRules'
import { getEligibleEvents, pickEvent } from './data/raceEvents'
import { awardSessionPoints, computeSessionPoints, isHeatSession, isFeatureSession } from './data/points'
import { computeSetupStrength, setupFingerprint, TRACK_SETUPS } from './data/trackSetups'
import { STORE_ITEMS } from './data/storeItems'
import { soundManager, SOUNDS } from './utils/soundManager'

// ── fuel requirement per championship (consumed at end of weekend) ──────────
export function fuelRequirement(championship) {
  return championship?.id === 'route66' ? 5 : 3
}

// Weekend-consumable requirements (per round) used by the "Buy Race Consumables"
// quick-buy and the canRace gating logic on HubScreen.
export function weekendConsumables(championship, sessionCount) {
  return {
    oil:       1,
    triFlow:   sessionCount,
    chainLube: sessionCount,
    fuel:      fuelRequirement(championship),
  }
}

// Cost & line items needed to top up to a full weekend's worth.
export function planRaceConsumables(consumables, championship, sessionCount) {
  const reqs    = weekendConsumables(championship, sessionCount)
  const lines   = []
  let totalCost = 0
  for (const [key, need] of Object.entries(reqs)) {
    const have    = consumables?.[key] ?? 0
    const deficit = Math.max(0, need - have)
    if (deficit === 0) continue
    const item = STORE_ITEMS.find(i => i.inventoryKey === key)
    if (!item) continue
    lines.push({ item, qty: deficit })
    totalCost += item.price * deficit
  }
  return { lines, totalCost }
}

function roundLabel(championship, roundIndex) {
  const tracks = championship.tracks
  const track  = tracks[roundIndex % tracks.length]
  return { name: `Round ${roundIndex + 1} — ${track}`, track }
}

function freshRaceWeekend(championship, player) {
  return {
    sessionIndex:    0,
    weather:         'sunny',
    lastResult:      null,
    eventsTriggered: 0,
    weekendOver:     false,
    maintenance:     { triFlowApplied: false, chainLubeApplied: false },
    standings:       buildBlankStandings(championship, player),
    testedSetup:     null,   // fingerprint of last setup that was run on track
    testedStrength:  null,   // computed strength of that setup
  }
}

function buildInitialGameState(careerData) {
  const kartNumber = 500 + careerData.driverNumber
  const player     = { name: careerData.driverName, kart: kartNumber }
  const round      = roundLabel(careerData.championship, 0)

  // Get optimal setup for first track
  const firstTrack = round.track
  const optimalSetup = TRACK_SETUPS[firstTrack]?.dry ?? {
    frontTeeth: 12,
    rearTeeth: 85,
    frontTrackWidth: 45.0,
    rearTrackWidth: 55.0,
    rideHeight: 5,
  }

  // Determine starting tire type based on championship
  let defaultTireKey = 'tiresMGOrange'
  if (careerData.championship.id === 'ignite-challenge') {
    defaultTireKey = 'tiresHoosierSlick'
  } else if (careerData.championship.id === 'route66') {
    defaultTireKey = 'tiresMGRed'
  }

  return {
    teamName:          careerData.teamName,
    driverName:        careerData.driverName,
    kartNumber,
    manufacturer:      careerData.manufacturer,
    sponsor:           careerData.sponsor,
    championship:      careerData.championship,
    cash:              careerData.sponsor.payoutAmount + 2500,
    reputation:        50,
    experience:        0,
    season:            1,
    dmitriUnlocked:    false,
    loadoutApplied:    false,
    triggeredEventIds: [],
    consumables: {
      oil:          0,
      triFlow:      0,
      chainLube:    0,
      fuel:         0,
      nutsAndBolts: 50,
      bumperClips:  0,
    },
    parts: {
      completeEngine: 1,
      neckBrace: 0,
      ribProtector: 0,
      axle: 0,
      wheel: 0,
    },
    tires: {
      [defaultTireKey]: [],
    },
    kart: {
      equippedTires:         null,
      equippedFrontSprocket: null,
      equippedRearSprocket:  null,
      equippedEngine:        { id: 'completeEngine', category: 'engine', name: 'Complete Engine', price: 450, partsKey: 'completeEngine', durability: 100, power: 100 },
      equippedAxle:          { id: 'axle', category: 'axle', name: 'Axle', partsKey: 'axle', durability: 100 },
      equippedWheels:        { id: 'wheel', category: 'wheels', name: 'Wheels (Set)', partsKey: 'wheel', durability: 100 },
      frame:                 { id: 'frame', category: 'frame', name: 'Frame', partsKey: 'frame', durability: 100 },
      fairing:               { id: 'fairing', category: 'body', name: 'Fairing', price: 58, partsKey: 'fairing', durability: 100 },
      sidePodLeft:           { id: 'sidePodLeft', category: 'body', name: 'Side Pod — Left', price: 52, partsKey: 'sidePodLeft', durability: 100 },
      sidePodRight:          { id: 'sidePodRight', category: 'body', name: 'Side Pod — Right', price: 52, partsKey: 'sidePodRight', durability: 100 },
      frontBumper:           { id: 'frontBumper', category: 'body', name: 'Front Bumper', price: 45, partsKey: 'frontBumper', durability: 100 },
      rearBumper:            { id: 'rearBumper', category: 'body', name: 'Rear Bumper', price: 45, partsKey: 'rearBumper', durability: 100 },
      setup: {
        frontTrackWidth: optimalSetup.frontTrackWidth,
        rearTrackWidth:  optimalSetup.rearTrackWidth,
        frontShims:      optimalSetup.rideHeight,
      },
    },
    roundIndex: 0,
    roundHistory: [],   // [{ roundIndex, track, sessions: [{ name, points: {kart->pts} }] }]
    nextRace: {
      name:      round.name,
      track:     round.track,
      isToday:   true,
      daysUntil: 0,
    },
    championshipPoints: buildBlankChampionshipPoints(careerData.championship, player),
    raceWeekend: freshRaceWeekend(careerData.championship, player),
  }
}

function applyLoadout(state, entries) {
  let next = { ...state, loadoutApplied: true }
  for (const { item, qty } of entries) {
    next = { ...next, cash: next.cash - item.price * qty }
    if (item.inventoryKey) {
      next.consumables = {
        ...next.consumables,
        [item.inventoryKey]: (next.consumables[item.inventoryKey] ?? 0) + qty,
      }
    } else if (item.partsKey && item.partsKey.startsWith('tires')) {
      // Tires: create sets of 4
      const tireKey = item.partsKey
      const newSets = Array.from({ length: qty }, () => ({ durability: 100 }))
      next.tires = { ...next.tires, [tireKey]: [...(next.tires[tireKey] ?? []), ...newSets] }
    } else if (item.partsKey) {
      next.parts = {
        ...next.parts,
        [item.partsKey]: (next.parts[item.partsKey] ?? 0) + qty,
      }
    }
  }
  return next
}

function applyEffects(state, effects) {
  let s = { ...state }
  for (const fx of (effects ?? [])) {
    switch (fx.type) {
      case 'cash':
        s = { ...s, cash: s.cash + fx.amount }
        break
      case 'cashRandom': {
        const amount = Math.round(fx.min + Math.random() * (fx.max - fx.min))
        s = { ...s, cash: s.cash + amount }
        break
      }
      case 'reputation':
        s = { ...s, reputation: Math.max(0, s.reputation + fx.amount) }
        break
      case 'experience':
        s = { ...s, experience: Math.max(0, s.experience + fx.amount) }
        break
      case 'consumable':
        s = { ...s, consumables: { ...s.consumables, [fx.key]: Math.max(0, (s.consumables[fx.key] ?? 0) + fx.amount) } }
        break
      case 'addTires': {
        const tireKey = s.kart?.equippedTires?.partsKey ?? 'tiresHoosierSlick'
        s = { ...s, parts: { ...s.parts, [tireKey]: (s.parts[tireKey] ?? 0) + 4 } }
        break
      }
      case 'removeRandomParts': {
        const keys = Object.keys(s.parts).filter(k => s.parts[k] > 0)
        const toRemove = [...keys].sort(() => Math.random() - 0.5).slice(0, fx.count)
        const newParts = { ...s.parts }
        toRemove.forEach(k => { newParts[k] = Math.max(0, newParts[k] - 1) })
        s = { ...s, parts: newParts }
        break
      }
      case 'unlockDmitri':
        s = { ...s, dmitriUnlocked: true }
        break
      case 'addDmitriEngine': {
        const engine = {
          id: 'dmitriEngine', name: 'Dmitri Race Engine', partsKey: 'dmitriEngine',
          durability: 100, power: 130,
        }
        // Auto-equip if no engine is currently equipped; otherwise keep as spare.
        if (!s.kart?.equippedEngine) {
          s = { ...s, kart: { ...s.kart, equippedEngine: engine } }
        } else {
          s = { ...s, parts: { ...s.parts, dmitriEngine: (s.parts.dmitriEngine ?? 0) + 1 } }
        }
        break
      }
      // 'dnf' is handled at simulation level — ignore in event effects
      default: break
    }
  }
  return s
}

export default function App() {
  const [screen,         setScreen]         = useState('title')
  const [gameState,      setGameState]      = useState(null)
  const [showForceModal, setShowForceModal] = useState(false)
  const [pendingLoadout, setPendingLoadout] = useState(null)
  const [kartFrom,       setKartFrom]       = useState('chassis')
  const [pendingCrash,   setPendingCrash]   = useState(null)
  const [pendingEvent,   setPendingEvent]   = useState(null)
  const [showChampCompleteModal, setShowChampCompleteModal] = useState(false)
  const [champCompleteState, setChampCompleteState] = useState({ isWin: false, playerFinish: 10 })

  function handleTitleNavigate(dest) {
    if (dest === 'new') setScreen('new-career')
    if (dest === 'credits') setScreen('credits')
  }

  function handleCareerComplete(careerData) {
    const state   = buildInitialGameState(careerData)
    const isContinuing = gameState?.continueFromCareer ?? false

    let applied = state
    let entries = null

    // Only auto-apply standard loadout on first career, not on new game+
    if (!isContinuing) {
      entries = getLoadout(careerData.championship)
      applied = applyLoadout(state, entries)

      // Auto-equip tires from loadout
      const tireEntry = entries.find(e => e.item.partsKey?.startsWith('tires'))
      if (tireEntry) {
        const tireKey = tireEntry.item.partsKey
        if (applied.tires[tireKey] && applied.tires[tireKey].length > 0) {
          applied = {
            ...applied,
            kart: {
              ...applied.kart,
              equippedTires: {
                ...tireEntry.item,
                partsKey: tireKey,
                setIndex: 0,
                durability: 100,
              },
            },
          }
        }
      }
    }

    soundManager.stopMusic()
    setGameState(prev => {
      // If continuing from a completed career, preserve progress
      if (prev && prev.continueFromCareer && prev.careerProgressToKeep) {
        return {
          ...applied,
          parts: prev.careerProgressToKeep.parts,
          tires: prev.careerProgressToKeep.tires,
          consumables: prev.careerProgressToKeep.consumables,
          cash: prev.careerProgressToKeep.cash,
          experience: prev.careerProgressToKeep.experience,
          sponsorReputation: prev.careerProgressToKeep.sponsorReputation,
          kart: prev.careerProgressToKeep.kart,
          continueFromCareer: false,
          careerProgressToKeep: null,
        }
      }
      return applied
    })
    // Only show loadout modal on first career
    if (entries) {
      setPendingLoadout(entries)
      setShowForceModal(true)
    }
    setScreen('hub')
  }

  function handleForceModalDismiss() {
    setShowForceModal(false)
    setPendingLoadout(null)
  }

  function handleHubNavigate(dest) {
    if (dest === 'store')       setScreen('store')
    if (dest === 'chassis')     setScreen('chassis')
    if (dest === 'competitors') setScreen('competitors')
    if (dest === 'race') {
      // Deduct entry fee if this is the first session of the weekend
      setGameState(prev => {
        if (prev.raceWeekend.sessionIndex > 0) {
          setScreen('race')
          return prev
        }
        const entryFee = {
          'norway': 120,
          'ignite-challenge': 150,
          'route66': 290,
        }[prev.championship.id] ?? 120
        setScreen('race')
        return { ...prev, cash: prev.cash - entryFee }
      })
    }
  }

  // Called when player leaves the race screen back to hub.
  // If the weekend is over, advance to the next round and reset raceWeekend.
  function handleReturnToHub() {
    setGameState(prev => {
      if (!prev.raceWeekend.weekendOver) return prev
      const nextRoundIdx = (prev.roundIndex ?? 0) + 1
      const numTracks = prev.championship?.tracks?.length ?? 4
      const totalRaces = prev.championship?.totalRaces ?? numTracks
      const isChampionshipOver = nextRoundIdx >= totalRaces

      if (isChampionshipOver) {
        // Championship is complete — show results screen
        return { ...prev, showChampionshipResults: true }
      }

      const round        = roundLabel(prev.championship, nextRoundIdx)
      const player       = { name: prev.driverName, kart: prev.kartNumber }
      return {
        ...prev,
        roundIndex:  nextRoundIdx,
        nextRace:    { name: round.name, track: round.track, isToday: true, daysUntil: 0 },
        raceWeekend: freshRaceWeekend(prev.championship, player),
      }
    })
    setScreen('hub')
  }

  function handleChampionshipComplete() {
    const playerRow = gameState.championshipPoints?.find(row => row.isPlayer)
    const playerFinish = playerRow?.pos ?? 10
    const sponsorTier = gameState.sponsor?.tier ?? 1
    let requirementMet = false

    // Check sponsor requirement - higher tiers have tougher requirements
    if (sponsorTier === 4) {
      // Manufacturer sponsor: must finish top 3 (challenging)
      requirementMet = playerFinish <= 3
    } else if (sponsorTier === 3) {
      // Mobil 1: Top 5
      requirementMet = playerFinish <= 5
    } else if (sponsorTier === 2) {
      // Lawson: Top 8 (was Top 10)
      requirementMet = playerFinish <= 8
    } else {
      // Bent Axle: Top 12 (was Top 15)
      requirementMet = playerFinish <= 12
    }

    setChampCompleteState({ isWin: requirementMet, playerFinish })
    setShowChampCompleteModal(true)
  }

  function handleChampCompleteModalContinue() {
    // Continue to next season - show new career screen for selecting new championship/manufacturer/sponsor
    // Store current progress to preserve after new career selection
    setShowChampCompleteModal(false)
    setGameState(prev => {
      const prizePool = { 'norway': 2500, 'ignite-challenge': 5000, 'route66': 10000 }
      const total = prizePool[prev.championship.id] ?? 2500
      const distribution = [0.30, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05]
      const playerRow = prev.championshipPoints?.find(row => row.isPlayer)
      const playerFinish = (playerRow?.pos ?? 10) - 1
      const playerPrize = playerFinish < distribution.length ? Math.round(total * distribution[playerFinish]) : 0
      const finalCash = (prev.cash ?? 0) + playerPrize

      return {
        ...prev,
        showChampionshipResults: false,  // Hide results screen
        season: (prev.season ?? 1) + 1,
        cash: finalCash,
        continueFromCareer: true,  // Flag to preserve progress
        careerProgressToKeep: {
          parts: prev.parts,
          tires: prev.tires,
          consumables: prev.consumables,
          cash: finalCash,
          experience: prev.experience,
          sponsorReputation: prev.sponsorReputation,
          kart: prev.kart,  // Preserve equipped parts with their current durability
        },
      }
    })
    setScreen('new-career')
  }

  function handleChampCompleteModalMainMenu() {
    setShowChampCompleteModal(false)
    // On game over (not isWin), clear game state completely so progress isn't saved
    if (!champCompleteState.isWin) {
      setGameState(null)
    } else {
      setGameState(prev => ({ ...prev, showChampionshipResults: false }))
    }
    setScreen('title')
  }

  function handleKartUpdate(updatedKart) {
    setGameState(prev => ({ ...prev, kart: updatedKart }))
  }

  function handleMaintenance(item) {
    const appliedKey = item === 'triFlow' ? 'triFlowApplied' : 'chainLubeApplied'
    setGameState(prev => ({
      ...prev,
      consumables: {
        ...prev.consumables,
        [item]: Math.max(0, (prev.consumables[item] ?? 0) - 1),
      },
      raceWeekend: {
        ...prev.raceWeekend,
        maintenance: { ...prev.raceWeekend.maintenance, [appliedKey]: true },
      },
    }))
  }

  function handleService(serviceId, price) {
    if (serviceId === 'frameTable') {
      setGameState(prev => ({
        ...prev,
        cash: prev.cash - price,
        kart: {
          ...prev.kart,
          frame: { ...prev.kart.frame, durability: 100 },
        },
      }))
    } else if (serviceId === 'coaching') {
      setGameState(prev => {
        const setup = getCoachingSetup(prev.nextRace.track)
        const isRoute66 = prev.championship.id === 'route66'
        const isIgnite = prev.championship.id === 'ignite-challenge'
        const canChangeFront = !isIgnite  // Ignite can't change front sprocket
        const pitch = isRoute66 ? 219 : 35
        const isWet = prev.raceWeekend.weather === 'rain' || prev.raceWeekend.weather === 'wet'
        const frontTeeth = isWet ? setup.wetFront : setup.dryFront
        const rearTeeth = isWet ? setup.wetRear : setup.dryRear

        // Find sprocket items matching the recommended teeth
        const frontSprocket = canChangeFront ? (STORE_ITEMS.find(i =>
          i.category === 'sprockets' &&
          i.subcategory === `#${pitch} Front` &&
          i.teeth === frontTeeth
        ) || STORE_ITEMS.find(i =>
          i.category === 'sprockets' &&
          i.subcategory === `#${pitch} Front`
        )) : null

        const rearSprocket = STORE_ITEMS.find(i =>
          i.category === 'sprockets' &&
          i.subcategory === `#${pitch} Rear` &&
          i.teeth === rearTeeth
        ) || STORE_ITEMS.find(i =>
          i.category === 'sprockets' &&
          i.subcategory === `#${pitch} Rear`
        )

        const equippedFront = frontSprocket
          ? { ...frontSprocket, durability: 100, power: 100 }
          : prev.kart.equippedFrontSprocket
        const equippedRear = rearSprocket
          ? { ...rearSprocket, durability: 100, power: 100 }
          : prev.kart.equippedRearSprocket

        const cleanedSetup = {
          frontTrackWidth: setup.frontTrackWidth,
          rearTrackWidth: setup.rearTrackWidth,
          frontShims: setup.frontShims,
        }

        return {
          ...prev,
          cash: prev.cash - price,
          experience: prev.experience + 2,
          kart: {
            ...prev.kart,
            setup: cleanedSetup,
            equippedFrontSprocket: frontSprocket ? equippedFront : prev.kart.equippedFrontSprocket,
            equippedRearSprocket: equippedRear,
          }
        }
      })
    }
  }

  function handleEquipItem(slot, storeItem, explicitSetIndex = null) {
    setGameState(prev => {
      const oldEquipped = prev.kart[slot]
      let parts = { ...prev.parts }
      let tires = { ...prev.tires }

      if (slot === 'equippedTires' && storeItem) {
        // Save the currently equipped tire's durability back into inventory before swapping
        if (oldEquipped && oldEquipped.partsKey) {
          const oldKey = oldEquipped.partsKey
          const oldIdx = oldEquipped.setIndex
          if (tires[oldKey] && tires[oldKey][oldIdx] != null) {
            tires[oldKey] = [...tires[oldKey]]
            tires[oldKey][oldIdx] = { durability: oldEquipped.durability }
          }
        }

        const tireKey = storeItem.partsKey
        const tireSets = tires[tireKey] ?? []
        let tireSetIndex = -1

        if (explicitSetIndex !== null && explicitSetIndex >= 0 && explicitSetIndex < tireSets.length && tireSets[explicitSetIndex].durability > 0) {
          // Explicitly chosen set
          tireSetIndex = explicitSetIndex
        } else if (oldEquipped && oldEquipped.partsKey === tireKey && oldEquipped.setIndex >= 0 && oldEquipped.setIndex < tireSets.length && tireSets[oldEquipped.setIndex].durability > 0) {
          // Switching back to same type — prefer previous set
          tireSetIndex = oldEquipped.setIndex
        } else {
          // Find a fresh set (100% durability)
          tireSetIndex = tireSets.findIndex(t => t.durability === 100)
          if (tireSetIndex < 0) {
            tireSetIndex = tireSets.findIndex(t => t.durability > 0)
          }
        }

        if (tireSetIndex >= 0) {
          const newEquipped = { ...storeItem, setIndex: tireSetIndex, durability: tireSets[tireSetIndex].durability }
          return { ...prev, tires, kart: { ...prev.kart, equippedTires: newEquipped } }
        }
      } else if (slot === 'equippedTires' && !storeItem) {
        // Unequipping tires: save current durability back to inventory
        if (oldEquipped && oldEquipped.partsKey) {
          const tireKey = oldEquipped.partsKey
          const setIdx = oldEquipped.setIndex
          if (tires[tireKey] && tires[tireKey][setIdx] != null) {
            tires[tireKey] = [...tires[tireKey]]
            tires[tireKey][setIdx] = { durability: oldEquipped.durability }
          }
        }
        return { ...prev, tires, kart: { ...prev.kart, equippedTires: null } }
      } else if (slot !== 'equippedTires' && storeItem && storeItem.partsKey) {
        // Non-tire equipment: deduct from inventory
        parts[storeItem.partsKey] = Math.max(0, (parts[storeItem.partsKey] ?? 0) - 1)
        // Return old equipped item if durability > 0, otherwise discard it (broken)
        if (oldEquipped && oldEquipped.partsKey && (oldEquipped.durability ?? 0) > 0) {
          parts[oldEquipped.partsKey] = (parts[oldEquipped.partsKey] ?? 0) + 1
        }
        const equippedItem = { ...storeItem, durability: storeItem.durability ?? 100, power: storeItem.power ?? 100 }
        return { ...prev, parts, kart: { ...prev.kart, [slot]: equippedItem } }
      }

      return prev
    })
  }

  function handlePurchase(item, qty = 1, price = null) {
    soundManager.playEffect(SOUNDS.purchaseEffect)
    const finalPrice = price !== null ? price : item.price
    setGameState(prev => {
      let next = { ...prev, cash: prev.cash - finalPrice * qty }
      if (item.inventoryKey) {
        next.consumables = { ...prev.consumables, [item.inventoryKey]: (prev.consumables[item.inventoryKey] ?? 0) + qty }
      } else if (item.partsKey && item.partsKey.startsWith('tires')) {
        // Tire purchase: create new sets of 4
        const tireKey = item.partsKey
        const newSets = Array.from({ length: qty }, () => ({ durability: 100 }))
        next.tires = { ...prev.tires, [tireKey]: [...(prev.tires[tireKey] ?? []), ...newSets] }
      } else if (item.partsKey) {
        next.parts = { ...prev.parts, [item.partsKey]: (prev.parts[item.partsKey] ?? 0) + qty }
      }
      return next
    })
  }

  function handleBuyLoadout() {
    soundManager.playEffect(SOUNDS.purchaseEffect)
    const entries = getLoadout(gameState.championship)
    setGameState(prev => applyLoadout({ ...prev, loadoutApplied: false }, entries))
  }

  function handleBuyRaceConsumables() {
    setGameState(prev => {
      const sessionCount = getSessions(prev.championship).length
      const { lines, totalCost } = planRaceConsumables(prev.consumables, prev.championship, sessionCount)
      if (lines.length === 0)         return prev
      if (prev.cash < totalCost)      return prev
      let nextConsumables = { ...prev.consumables }
      for (const { item, qty } of lines) {
        nextConsumables[item.inventoryKey] = (nextConsumables[item.inventoryKey] ?? 0) + qty
      }
      return { ...prev, cash: prev.cash - totalCost, consumables: nextConsumables }
    })
  }

  // ── Race session handlers ──────────────────────────────────

  // Called by RaceScreen immediately on Begin Session click.
  // First checks for pre-race events. If found, shows modal and doesn't run simulation yet.
  // If no event, runs simulation and returns results.
  function handleBeginSession() {
    // Check if we already have a pending event (user is continuing after resolving one)
    if (pendingEvent) {
      const sessions = getSessions(gameState.championship)
      const session  = sessions[gameState.raceWeekend.sessionIndex]
      return simulateSession(session, gameState.raceWeekend.standings, gameState)
    }

    // Roll for event before the race
    const sessions      = getSessions(gameState.championship)
    const sessionIdx    = gameState.raceWeekend.sessionIndex
    const session       = sessions[sessionIdx]
    const totalSessions = sessions.length
    const triggeredIds  = gameState.triggeredEventIds ?? []
    const eventsCount   = gameState.raceWeekend.eventsTriggered

    const force = mustTriggerEvent(sessionIdx, totalSessions, eventsCount, gameState.championship)
    if (force || rollEventChance()) {
      const tier     = rollEventTier(gameState.manufacturer)
      const eligible = getEligibleEvents(tier, session.name, gameState.championship, triggeredIds)
      const event = pickEvent(eligible)
      if (event) {
        setPendingEvent(event)
        return null  // Don't run simulation yet; modal will show
      }
    }

    // No event, proceed directly to race simulation
    return simulateSession(session, gameState.raceWeekend.standings, gameState)
  }

  // Called by RaceScreen after the 20s display and user clicks Continue on results.
  function handleSessionComplete(results, playerCrash) {
    const sessions      = getSessions(gameState.championship)
    const sessionIdx    = gameState.raceWeekend.sessionIndex
    const session       = sessions[sessionIdx]
    const totalSessions = sessions.length
    const nextIdx       = sessionIdx + 1
    const isLastSession = nextIdx >= totalSessions

    // Find player result for lastResult
    const playerRow = results.find(r => r.isPlayer)
    const lastResult = playerRow
      ? { pos: playerRow.pos, label: playerRow.dnf ? 'DNF' : `P${playerRow.pos}`, dnf: playerRow.dnf }
      : null

    setGameState(prev => {
      const newPoints = awardSessionPoints(prev.championshipPoints, results, session.name)
      const sessionAwards = computeSessionPoints(results, session.name)
      const isScoring     = isHeatSession(session.name) || isFeatureSession(session.name)
      const testedFp  = setupFingerprint(prev.kart, prev.raceWeekend.weather)
      const testedStr = computeSetupStrength(
        prev.kart, prev.nextRace?.track, prev.raceWeekend.weather,
        prev.championship, prev.manufacturer,
      )

      // Accumulate per-round, per-session breakdown for the standings UI.
      let roundHistory = prev.roundHistory ?? []
      if (isScoring) {
        const idx = prev.roundIndex ?? 0
        const existing = roundHistory.find(r => r.roundIndex === idx)
        const entry    = { name: session.name, points: sessionAwards }
        if (existing) {
          roundHistory = roundHistory.map(r =>
            r.roundIndex === idx ? { ...r, sessions: [...r.sessions, entry] } : r
          )
        } else {
          roundHistory = [
            ...roundHistory,
            { roundIndex: idx, track: prev.nextRace?.track, sessions: [entry] },
          ]
        }
      }

      let next = {
        ...prev,
        championshipPoints: newPoints,
        roundHistory,
        raceWeekend: {
          ...prev.raceWeekend,
          sessionIndex:    nextIdx,
          standings:       results,
          lastResult,
          weekendOver:     isLastSession,
          maintenance:     { triFlowApplied: false, chainLubeApplied: false },
          testedSetup:     testedFp,
          testedStrength:  testedStr,
        },
      }
      // Reduce durability of equipped parts
      const isRaceSession = ['Heat', 'Heat 1', 'Heat 2', 'Final', 'Feature'].includes(session.name)
      const durReduction = isRaceSession ? 8 : 3  // races wear parts faster
      if (next.kart.equippedTires) {
        const tire = next.kart.equippedTires
        const tireKey = tire.partsKey
        const setIdx = tire.setIndex
        if (next.tires[tireKey] && next.tires[tireKey][setIdx]) {
          const newDur = Math.max(0, next.tires[tireKey][setIdx].durability - durReduction)
          next.tires[tireKey][setIdx] = { durability: newDur }
          next = { ...next, kart: { ...next.kart, equippedTires: { ...next.kart.equippedTires, durability: newDur } } }
        }
      }
      if (next.kart.equippedFrontSprocket) {
        next = { ...next, kart: { ...next.kart, equippedFrontSprocket: { ...next.kart.equippedFrontSprocket, durability: Math.max(0, next.kart.equippedFrontSprocket.durability - 2) } } }
      }
      if (next.kart.equippedRearSprocket) {
        next = { ...next, kart: { ...next.kart, equippedRearSprocket: { ...next.kart.equippedRearSprocket, durability: Math.max(0, next.kart.equippedRearSprocket.durability - 2) } } }
      }
      if (next.kart.equippedEngine) {
        next = { ...next, kart: { ...next.kart, equippedEngine: { ...next.kart.equippedEngine, durability: Math.max(0, next.kart.equippedEngine.durability - 1) } } }
      }
      // Bodywork durability reduction
      const bodyworkDur = isRaceSession ? 4 : 1
      const bodyworkParts = ['fairing', 'sidePodLeft', 'sidePodRight', 'frontBumper', 'rearBumper']
      for (const bwPart of bodyworkParts) {
        if (next.kart[bwPart]) {
          next = { ...next, kart: { ...next.kart, [bwPart]: { ...next.kart[bwPart], durability: Math.max(0, next.kart[bwPart].durability - bodyworkDur) } } }
        }
      }

      // Frame durability reduction
      if (next.kart.frame) {
        next = { ...next, kart: { ...next.kart, frame: { ...next.kart.frame, durability: Math.max(0, next.kart.frame.durability - (isRaceSession ? 1 : 0)) } } }
      }

      // Axle durability reduction
      if (next.kart.equippedAxle) {
        next = { ...next, kart: { ...next.kart, equippedAxle: { ...next.kart.equippedAxle, durability: Math.max(0, next.kart.equippedAxle.durability - (isRaceSession ? 1 : 0)) } } }
      }

      // Wheels durability reduction
      if (next.kart.equippedWheels) {
        next = { ...next, kart: { ...next.kart, equippedWheels: { ...next.kart.equippedWheels, durability: Math.max(0, next.kart.equippedWheels.durability - (isRaceSession ? 2 : 0)) } } }
      }

      // Award experience based on finishing position in race sessions.
      // Balance target: 2 full Norway seasons (13 races each = 26 races)
      // should bring the player to ~XP 20–22, enough for consistent top-20s
      // in Route 66. Mid-pack Norway finishes ≈ 0.75 XP/race → 26 × 0.75 ≈ 19.5.
      if (isRaceSession && !playerRow?.dnf && playerRow) {
        const xpTablePerRace = prev.championship.id === 'norway'
          // Norway: easier field, finishing higher should reward more — but the
          // mid-pack average lands near 0.75 XP/race for the 2-season goal.
          ? [1.4, 1.2, 1.0, 0.9, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35, 0.30, 0.25]
          // Route 66 / Ignite: harder fields, lower XP since you're already
          // expected to be experienced. Caps at top of skill curve quickly.
          : [0.9, 0.8, 0.7, 0.6, 0.55, 0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.18, 0.16, 0.14, 0.12, 0.10]
        const xpFlat = xpTablePerRace[playerRow.pos - 1] ?? 0.05
        // Tiny percentage component so high-XP players still inch forward
        const xpPct  = (prev.experience ?? 0) * (prev.championship.id === 'norway' ? 0.005 : 0.003)
        const xpGain = xpFlat + xpPct
        next = { ...next, experience: (next.experience ?? 0) + xpGain }
      }

      // Apply reputation changes based on penalties
      if (isRaceSession && playerRow) {
        let repChange = 0
        // -1 reputation for contact/incident
        if (playerRow.penalty && playerRow.penalty.reason && playerRow.penalty.reason.includes('contact')) {
          repChange -= 1
        }
        // -2 reputation for unsportsmanlike behavior
        if (playerRow.penalty && playerRow.penalty.reason && (playerRow.penalty.reason.includes('unsportsmanlike') || playerRow.penalty.reason.includes('aggressive'))) {
          repChange -= 2
        }
        // +5 reputation for flawless weekend (no penalties in any session this weekend)
        if (!playerRow.penalty && !playerCrash) {
          const weekendSoFar = results.filter(r => r.isPlayer).length
          const allSessionsFlawless = !results.some(r => r.isPlayer && r.penalty)
          if (allSessionsFlawless && isLastSession) {
            repChange += 5
          }
        }
        if (repChange !== 0) {
          next = { ...next, reputation: Math.max(0, (next.reputation ?? 50) + repChange) }
        }
      }

      // Consume 1 fuel per session
      const newFuel = Math.max(0, next.consumables.fuel - 1)
      next = { ...next, consumables: { ...next.consumables, fuel: newFuel } }

      // If fuel runs out, DNF the rest of the weekend
      if (newFuel === 0 && !isLastSession) {
        next = {
          ...next,
          raceWeekend: {
            ...next.raceWeekend,
            weekendOver: true,
          },
        }
      }

      return next
    })

    if (playerCrash) {
      soundManager.playEffect(SOUNDS.failureEffect)
      setPendingCrash(playerCrash)
    }
  }

  // Fix crash damage and continue racing
  function handleCrashFix() {
    if (!pendingCrash) return
    setGameState(prev => {
      let next = { ...prev }
      let boltCost = 0
      const bodyworkParts = ['fairing', 'sidePodLeft', 'sidePodRight', 'frontBumper', 'rearBumper']
      let brokenBodywork = []

      for (const partKey of pendingCrash.parts) {
        if (partKey === 'frame') {
          // Frame damage from crash sets it to broken (0 durability)
          if (next.kart.frame) {
            next = { ...next, kart: { ...next.kart, frame: { ...next.kart.frame, durability: 0 } } }
          }
          continue
        }

        if (partKey === 'bumperClips') {
          next = { ...next, consumables: { ...next.consumables, bumperClips: Math.max(0, (next.consumables.bumperClips ?? 0) - 1) } }
        } else if (partKey === 'tiresEquipped') {
          // Replace equipped tires with a fresh set if available
          if (next.kart.equippedTires) {
            const tireKey = next.kart.equippedTires.partsKey
            const freshSetIdx = (next.tires[tireKey] ?? []).findIndex(t => t.durability > 0)
            if (freshSetIdx >= 0) {
              next = { ...next, kart: { ...next.kart, equippedTires: { ...next.kart.equippedTires, setIndex: freshSetIdx, durability: 100 } } }
              boltCost++
            }
          }
        } else if (partKey === 'engineEquipped') {
          const engKey = ['completeEngine', 'lawsonPrepEngine', 'dmitriEngine'].find(k => (next.parts[k] ?? 0) > 0)
          if (engKey) {
            next = { ...next, parts: { ...next.parts, [engKey]: next.parts[engKey] - 1 } }
            boltCost++
          }
        } else if ((next.parts[partKey] ?? 0) > 0) {
          // Use spare from inventory
          next = { ...next, parts: { ...next.parts, [partKey]: next.parts[partKey] - 1 } }
          boltCost++
          // If bodywork, replace equipped with fresh copy
          if (bodyworkParts.includes(partKey)) {
            const item = STORE_ITEMS.find(i => i.partsKey === partKey)
            if (item) {
              next = { ...next, kart: { ...next.kart, [partKey]: { ...item, durability: 100 } } }
            }
          }
        } else if (bodyworkParts.includes(partKey)) {
          // Bodywork broken but no replacement available — set equipped to broken (0 durability)
          if (next.kart[partKey]) {
            next = { ...next, kart: { ...next.kart, [partKey]: { ...next.kart[partKey], durability: 0 } } }
          }
          brokenBodywork.push(partKey)
        }
      }

      // If critical bodywork is broken with no replacement, we shouldn't be here
      // (modal should have prevented this). But if we are, don't advance — just return
      // and let the next session continue or the modal show the error
      if (brokenBodywork.length > 0) {
        return next
      }

      next = { ...next, consumables: { ...next.consumables, nutsAndBolts: Math.max(0, next.consumables.nutsAndBolts - boltCost) } }
      return next
    })
    setPendingCrash(null)
  }

  // Retire from race weekend — simulate rest of weekend with DNF, then advance round or end championship
  function handleCrashRetire() {
    setGameState(prev => {
      const sessions = getSessions(prev.championship)
      const currentIdx = prev.raceWeekend.sessionIndex

      // Simulate remaining sessions with player DNF
      let standings = prev.raceWeekend.standings
      for (let i = currentIdx; i < sessions.length; i++) {
        const session = sessions[i]
        const result = simulateSession(session, standings, prev)
        standings = result.results.map(r => r.isPlayer ? { ...r, dnf: true } : r)
      }

      const nextRoundIdx = (prev.roundIndex ?? 0) + 1
      const numTracks = prev.championship?.tracks?.length ?? 4
      const totalRaces = prev.championship?.totalRaces ?? numTracks
      const isChampionshipOver = nextRoundIdx >= totalRaces

      // If championship is over, show results instead of advancing to next round
      if (isChampionshipOver) {
        return { ...prev, showChampionshipResults: true }
      }

      const round = roundLabel(prev.championship, nextRoundIdx)
      const player = { name: prev.driverName, kart: prev.kartNumber }
      return {
        ...prev,
        roundIndex: nextRoundIdx,
        nextRace: { name: round.name, track: round.track, isToday: true, daysUntil: 0 },
        raceWeekend: freshRaceWeekend(prev.championship, player),
      }
    })
    setPendingCrash(null)
    setPendingEvent(null)
    setScreen('hub')
  }

  // Resolve a paddock event (choiceId = choice.id, or null for no-choice events)
  // After resolving, the race will automatically start when RaceScreen calls handleBeginSession again
  function handleEventResolve(choiceId) {
    if (!pendingEvent) return
    const choice  = choiceId != null ? pendingEvent.choices?.find(c => c.id === choiceId) : null
    const effects = choice ? choice.effects : (pendingEvent.effects ?? [])
    setGameState(prev => {
      const updated = applyEffects(prev, effects)
      // Mark this event as triggered
      return {
        ...updated,
        triggeredEventIds: [...(updated.triggeredEventIds ?? []), pendingEvent.id],
        raceWeekend: {
          ...updated.raceWeekend,
          eventsTriggered: (updated.raceWeekend?.eventsTriggered ?? 0) + 1,
        },
      }
    })
    setPendingEvent(null)
    // RaceScreen will automatically trigger race start
  }

  const activeScreen = (() => {
    if (gameState?.showChampionshipResults) return <ChampionshipResultsScreen gameState={gameState} onComplete={handleChampionshipComplete} />
    if (screen === 'title')      return <TitleScreen onNavigate={handleTitleNavigate} />
    if (screen === 'credits')    return <CreditsScreen onBack={() => setScreen('title')} />
    if (screen === 'new-career') return <NewCareerScreen gameState={gameState} onComplete={handleCareerComplete} onBack={() => setScreen('title')} />
    if (screen === 'hub')        return <HubScreen gameState={gameState} onNavigate={handleHubNavigate} onBuyRaceConsumables={handleBuyRaceConsumables} />
    if (screen === 'store')      return (
      <StoreScreen
        gameState={gameState}
        onPurchase={handlePurchase}
        onBuyLoadout={handleBuyLoadout}
        onBack={() => setScreen('hub')}
      />
    )
    if (screen === 'competitors') return <CompetitorScreen gameState={gameState} onBack={() => setScreen('hub')} />
    if (screen === 'chassis')    return <ChassisScreen gameState={gameState} onBack={() => setScreen('hub')} onOpenKart={() => { setKartFrom('chassis'); setScreen('kart') }} onService={handleService} />
    if (screen === 'kart')       return <KartDetailScreen gameState={gameState} onBack={() => setScreen(kartFrom)} onEquip={handleEquipItem} onSetupChange={handleKartUpdate} />
    if (screen === 'race')       return (
      <RaceScreen
        gameState={gameState}
        onBack={handleReturnToHub}
        onTuneKart={() => { setKartFrom('race'); setScreen('kart') }}
        onMaintenance={handleMaintenance}
        onBeginSession={handleBeginSession}
        onSessionComplete={handleSessionComplete}
        pendingCrash={pendingCrash}
        pendingEvent={pendingEvent}
        onCrashFix={handleCrashFix}
        onCrashRetire={handleCrashRetire}
        onEventResolve={handleEventResolve}
      />
    )
    return null
  })()

  return (
    <>
      {activeScreen}
      {showForceModal && pendingLoadout && (
        <ForceLoadoutModal
          entries={pendingLoadout}
          total={getLoadoutTotal(gameState.championship)}
          onDismiss={handleForceModalDismiss}
        />
      )}
      {showChampCompleteModal && (
        <ChampionshipCompleteModal
          playerFinish={champCompleteState.playerFinish}
          isWin={champCompleteState.isWin}
          onContinue={handleChampCompleteModalContinue}
          onMainMenu={handleChampCompleteModalMainMenu}
        />
      )}
    </>
  )
}
