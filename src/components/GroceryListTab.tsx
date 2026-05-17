// src/components/GroceryListTab.tsx

import { useState } from 'react'

interface GroceryItem {
  id: string
  name: string
}

interface GroceryCategory {
  category: string
  items: GroceryItem[]
}

const groceryListData: GroceryCategory[] = [
  {
    category: 'Pantry & Dry Goods',
    items: [
      { id: 'p1', name: 'Rolled Oats' },
      { id: 'p2', name: 'White Rice (Jasmine or Basmati)' },
      { id: 'p3', name: 'Dry Pasta (your choice of shape)' },
      { id: 'p4', name: 'Soft Corn Tortillas' },
      { id: 'p5', name: 'Canned Chickpeas (no salt added, 1 can)' },
      { id: 'p6', name: 'Coconut Milk (1 can, for curry)' },
      { id: 'p7', name: 'Frozen Peas' },
    ],
  },
  {
    category: 'Produce',
    items: [
      { id: 'v1', name: 'Blueberries & Raspberries (fresh or frozen)' },
      { id: 'v2', name: 'Apples (1–2)' },
      { id: 'v3', name: 'Lemons & Limes (2 each)' },
      { id: 'v4', name: 'Garlic (2 heads) & Fresh Ginger (1 knob)' },
      { id: 'v5', name: 'Broccoli (1 head or 1 bunch)' },
      { id: 'v6', name: 'Cabbage (1 small head)' },
      { id: 'v7', name: 'Bell Peppers (2–3, assorted colors)' },
      { id: 'v8', name: 'Onions (3–4 yellow or white)' },
      { id: 'v9', name: 'Green Onions (1 bunch)' },
      { id: 'v10', name: 'Zucchini (2 medium)' },
      { id: 'v11', name: 'Green Beans (fresh or frozen)' },
      { id: 'v12', name: 'Fresh Spinach (1 large bag)' },
      { id: 'v13', name: 'Carrots (1 bunch or bag)' },
    ],
  },
  {
    category: 'Proteins & Dairy',
    items: [
      { id: 'pr1', name: 'Chicken (1 pack breasts, 1 pack thighs)' },
      { id: 'pr2', name: 'White Fish (Cod or Tilapia, 2 fillets)' },
      { id: 'pr3', name: 'Eggs (1 dozen) or Egg Whites (carton)' },
      { id: 'pr4', name: 'Firm Tofu (1 block)' },
    ],
  },
  {
    category: 'Condiments, Oils & Spices',
    items: [
      { id: 'c1', name: 'Low-Sodium Vegetable Broth' },
      { id: 'c2', name: 'Low-Sodium Soy Sauce or Coconut Aminos' },
      { id: 'c3', name: 'Rice Vinegar' },
      { id: 'c4', name: 'Olive Oil & Sesame Oil' },
      { id: 'c5', name: 'Cornstarch (for thickening)' },
      {
        id: 'c6',
        name: 'Spices: Black Pepper, White Pepper, Cinnamon, Nutmeg, Cumin, Paprika, Oregano, Turmeric, Coriander, Rosemary, Thyme',
      },
    ],
  },
]

const ALL_IDS: string[] = groceryListData.flatMap((cat) =>
  cat.items.map((item) => item.id)
)

export default function GroceryListTab() {
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  const totalItems = ALL_IDS.length
  const remainingCount = totalItems - checkedIds.length

  function toggleItem(id: string) {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function checkAll() {
    setCheckedIds([...ALL_IDS])
  }

  function clearAll() {
    setCheckedIds([])
  }

  return (
    <div>
      {/* Controls + live count */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <p className="text-sm text-zinc-400">
          <span
            className={
              remainingCount === 0
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-200 font-semibold'
            }
          >
            {remainingCount}
          </span>{' '}
          of {totalItems} items remaining
        </p>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
            onClick={checkAll}
          >
            Check All
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold transition-colors"
            onClick={clearAll}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Categorised checklist */}
      <div className="space-y-5">
        {groceryListData.map((cat) => {
          const catCheckedCount = cat.items.filter((i) =>
            checkedIds.includes(i.id)
          ).length

          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-green-600 uppercase tracking-wider">
                  {cat.category}
                </h4>
                <span className="text-xs text-zinc-500">
                  {catCheckedCount}/{cat.items.length}
                </span>
              </div>

              <div className="space-y-1">
                {cat.items.map((item) => {
                  const isChecked = checkedIds.includes(item.id)
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-green-500 shrink-0 cursor-pointer"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                      />
                      <span
                        className={[
                          'text-sm transition-colors',
                          isChecked
                            ? 'line-through text-zinc-500'
                            : 'text-zinc-200',
                        ].join(' ')}
                      >
                        {item.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
