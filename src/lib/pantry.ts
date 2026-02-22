// src/lib/pantry.ts — local-first pantry tracker
// Tracks ingredient availability and drives recipe filtering + shopping list.

export type PantryStatus = 'full' | 'low' | 'out'

export type PantryCategory =
  | 'protein'   // salmon, chicken, tuna, eggs, turkey
  | 'produce'   // peppers, tomato, zucchini, broccoli, apple
  | 'pantry'    // pasta, rice, oats, walnuts, coconut milk
  | 'dairy'     // cream cheese, mozzarella, marble cheese
  | 'frozen'    // frozen salmon, frozen pizza, hash browns
  | 'drinks'    // coffee, green tea, nettle tea, sparkling water

export interface PantryItem {
  id: string
  name: string
  category: PantryCategory
  status: PantryStatus
  recipeTag?: string   // links to Recipe tags e.g. 'adds-salmon'
  updatedAt: string    // ISO string
}

const PANTRY_KEY = 'ec_pantry'

// ---- Persistence ----

export function loadPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(PANTRY_KEY)
    if (raw) return JSON.parse(raw) as PantryItem[]
  } catch { /* ignore */ }
  return getDefaultPantry()
}

export function savePantry(items: PantryItem[]): void {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items))
  } catch { /* ignore quota / private mode */ }
}

export function updateItem(
  items: PantryItem[],
  id: string,
  status: PantryStatus,
): PantryItem[] {
  return items.map(item =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
  )
}

// ---- Derived views ----

/** Returns recipeTag[] for items that are not 'out' — used to filter recipe suggestions */
export function getAvailableTags(items: PantryItem[]): string[] {
  return items
    .filter(item => item.status !== 'out' && item.recipeTag != null)
    .map(item => item.recipeTag!)
}

/** Returns items that need to be bought (low or out) */
export function getShoppingList(items: PantryItem[]): PantryItem[] {
  return items.filter(item => item.status === 'low' || item.status === 'out')
}

/** Cycles status FULL → LOW → OUT → FULL */
export function cycleStatus(current: PantryStatus): PantryStatus {
  if (current === 'full') return 'low'
  if (current === 'low') return 'out'
  return 'full'
}

export function formatShoppingList(items: PantryItem[]): string {
  const list = getShoppingList(items)
  if (list.length === 0) return 'Nothing needed — pantry is stocked!'
  const lines = list.map(item => `${item.status === 'out' ? '[ ] ' : '[~] '}${item.name}`)
  return `Shopping List — ${new Date().toLocaleDateString()}\n\n${lines.join('\n')}`
}

// ---- Default pantry (user's known staples) ----

export function getDefaultPantry(): PantryItem[] {
  const now = new Date().toISOString()
  const item = (
    id: string,
    name: string,
    category: PantryCategory,
    recipeTag?: string,
  ): PantryItem => ({ id, name, category, status: 'full', recipeTag, updatedAt: now })

  return [
    // Proteins
    item('salmon-frozen',     'Salmon (frozen)',        'protein',  'adds-salmon'),
    item('chicken',           'Chicken',                'protein',  'adds-chicken'),
    item('tuna-low-sodium',   'Tuna (low-sodium)',      'protein',  'adds-tuna'),
    item('turkey-cold-cuts',  'Turkey cold cuts',       'protein'),
    item('eggs',              'Eggs',                   'protein',  'adds-eggs'),
    // Produce
    item('blueberries',       'Blueberries',            'produce'),
    item('rainbow-peppers',   'Rainbow / Bell peppers', 'produce'),
    item('zucchini',          'Zucchini',               'produce'),
    item('cauliflower',       'Cauliflower',            'produce'),
    item('broccoli',          'Broccoli',               'produce'),
    item('tomato',            'Tomato',                 'produce'),
    item('yellow-onion',      'Yellow onion',           'produce'),
    item('fresh-garlic',      'Fresh garlic',           'produce'),
    item('romaine-mix',       'Romaine salad mix',      'produce'),
    item('guacamole',         'Guacamole',              'produce'),
    item('fuji-apples',       'Fuji apples',            'produce'),
    // Pantry
    item('rolled-oats',       'Rolled oats',            'pantry'),
    item('walnuts',           'Walnuts',                'pantry'),
    item('manuka-honey',      'Manuka honey',           'pantry'),
    item('pasta-ww',          'Pasta (whole wheat)',    'pantry'),
    item('rice',              'Rice',                   'pantry'),
    item('coconut-milk',      'Coconut milk',           'pantry'),
    item('bagels',            'Bagels',                 'pantry'),
    item('ww-bread',          'Whole wheat bread',      'pantry'),
    item('buckwheat-waffle',  'Buckwheat waffle mix',   'pantry'),
    // Dairy
    item('cream-cheese',      'Cream cheese / Vegan mayo', 'dairy'),
    item('marble-cheese',     'Marble cheese / Mozzarella', 'dairy'),
    // Frozen
    item('hash-browns',       'Hash browns (frozen)',   'frozen'),
    item('frozen-pizza',      'Frozen pizza',           'frozen'),
    // Drinks
    item('coffee',            'Coffee',                 'drinks'),
    item('green-tea',         'Green tea',              'drinks'),
    item('nettle-tea',        'Nettle leaf tea',        'drinks'),
    item('sparkling-water',   'Sparkling mineral water','drinks'),
  ]
}
