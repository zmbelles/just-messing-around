import { STORE_ITEMS } from './storeItems'

function item(id, qty) {
  const found = STORE_ITEMS.find(i => i.id === id)
  if (!found) throw new Error(`Loadout item not found: ${id}`)
  return { item: found, qty }
}

function allSprockets(pitch, type) {
  const sub = `#${pitch} ${type}`
  return STORE_ITEMS
    .filter(i => i.category === 'sprockets' && i.subcategory === sub)
    .map(i => ({ item: i, qty: 1 }))
}

// Route 66 weekend: 8 sessions × (triFlow + chainLube), 1 oil, 5 gal fuel
const ROUTE66_LOADOUT = [
  ...allSprockets(219, 'Front'),
  ...allSprockets(219, 'Rear'),
  item('tiresMGRed',  1),
  item('chain219',    1),
  item('oil',         1),
  item('fuel',        5),
  item('chainLube',   8),
  item('triFlow',     8),
]

// Norway Club weekend: 5 sessions, MG Orange tires
const NORWAY_LOADOUT = [
  ...allSprockets(35, 'Front'),
  ...allSprockets(35, 'Rear'),
  item('tiresMGOrange', 1),
  item('chain35',   1),
  item('oil',       1),
  item('fuel',      3),
  item('chainLube', 5),
  item('triFlow',   5),
]

// Ignite Challenge weekend: 5 sessions, Hoosier slicks
const IGNITE_LOADOUT = [
  ...allSprockets(35, 'Front'),
  ...allSprockets(35, 'Rear'),
  item('tiresHoosierSlick', 1),
  item('chain35',   1),
  item('oil',       1),
  item('fuel',      3),
  item('chainLube', 5),
  item('triFlow',   5),
]

export function getLoadout(championship) {
  if (championship.id === 'route66') return ROUTE66_LOADOUT
  if (championship.id === 'ignite-challenge') return IGNITE_LOADOUT
  return NORWAY_LOADOUT
}

export function getLoadoutTotal(championship) {
  return getLoadout(championship)
    .reduce((sum, { item, qty }) => sum + item.price * qty, 0)
}
