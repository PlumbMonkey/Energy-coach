// src/components/MealPlannerTab.tsx

interface Meal {
  breakfast: string
  lunch: string
  dinner: string
}

interface MealDay {
  day: number // 1 = Monday … 7 = Sunday
  theme: string
  meals: Meal
}

const mealPlanData: MealDay[] = [
  {
    day: 1,
    theme: 'Asian Flavors & Batch Prep',
    meals: {
      breakfast: 'Rice cooker oatmeal with blueberries and a dash of cinnamon.',
      lunch: 'Homemade, low-sodium hot and sour soup (tofu, cabbage, broth).',
      dinner: 'Cast-iron chicken and broccoli in a light garlic sauce over rice.',
    },
  },
  {
    day: 2,
    theme: 'Mexican-Inspired',
    meals: {
      breakfast: 'Scrambled egg whites with chopped bell peppers in a corn tortilla.',
      lunch: 'Leftover hot and sour soup and a small portion of rice.',
      dinner: 'Cast iron chicken fajitas (onions, bell peppers, no-salt spices) in corn tortillas.',
    },
  },
  {
    day: 3,
    theme: 'Italian',
    meals: {
      breakfast: 'Rice cooker oatmeal with diced apples and nutmeg.',
      lunch: 'Leftover chicken fajitas served as a bowl over rice.',
      dinner: 'Pasta primavera (zucchini, garlic, green beans tossed with pasta).',
    },
  },
  {
    day: 4,
    theme: 'Indian-Spiced',
    meals: {
      breakfast: 'Quick rice porridge (congee) with sesame oil and green onions.',
      lunch: 'Leftover pasta primavera.',
      dinner: 'Chickpea and spinach curry over fresh rice.',
    },
  },
  {
    day: 5,
    theme: 'Asian Fusion',
    meals: {
      breakfast: 'Scrambled eggs and a piece of toast or leftover rice.',
      lunch: 'Leftover chickpea and spinach curry.',
      dinner: 'Cast iron fried rice (peas, carrots, egg, low-sodium aminos).',
    },
  },
  {
    day: 6,
    theme: 'Simple & Fresh',
    meals: {
      breakfast: 'Rice cooker oatmeal with a handful of raspberries.',
      lunch: 'Leftover fried rice.',
      dinner: 'Pan-seared white fish with lemon zest and black pepper. Blanched green beans.',
    },
  },
  {
    day: 7,
    theme: 'Italian Comfort',
    meals: {
      breakfast: 'Egg whites cooked with a handful of spinach.',
      lunch: 'Refreshing pasta salad (flaked leftover white fish, olive oil, lemon, cold pasta).',
      dinner: 'Garlic and herb crispy chicken thighs with blanched carrots and rice.',
    },
  },
]

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const MEAL_KEYS: (keyof Meal)[] = ['breakfast', 'lunch', 'dinner']

export default function MealPlannerTab() {
  // Map JS getDay() (0 = Sun) → plan day (1 = Mon … 7 = Sun)
  const todayPlanDay = (() => {
    const d = new Date().getDay()
    return d === 0 ? 7 : d
  })()

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-4 text-center tracking-wide">
        Kidney-friendly · Low-sodium · Brain-fueling
      </p>

      {/* 7-day grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {mealPlanData.map((dayData) => {
          const isToday = dayData.day === todayPlanDay
          return (
            <div
              key={dayData.day}
              className={[
                'rounded-xl border p-4 flex flex-col gap-2 transition-colors',
                isToday
                  ? 'border-orange-500 bg-orange-950/30 ring-1 ring-orange-500/40'
                  : 'border-zinc-700 bg-zinc-900/60',
              ].join(' ')}
            >
              {/* Day header */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <span
                  className={[
                    'text-sm font-bold',
                    isToday ? 'text-orange-400' : 'text-zinc-200',
                  ].join(' ')}
                >
                  {DAY_NAMES[dayData.day - 1]}
                </span>
                {isToday && (
                  <span className="text-xs font-semibold text-orange-300 bg-orange-900/60 px-1.5 py-0.5 rounded-full border border-orange-700/50">
                    Today
                  </span>
                )}
              </div>

              {/* Theme badge */}
              <span className="self-start inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-900/40 text-orange-300 border border-orange-800/60 leading-tight">
                {dayData.theme}
              </span>

              {/* Meals */}
              <div className="mt-1 space-y-2 border-t border-zinc-700/50 pt-2">
                {MEAL_KEYS.map((meal) => (
                  <div key={meal}>
                    <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-0.5">
                      {meal}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {dayData.meals[meal]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Prep & Hydration Tips card */}
      <div className="rounded-xl bg-teal-50 border-l-4 border-teal-600 p-4">
        <h4 className="text-sm font-bold text-teal-800 mb-3">Prep &amp; Hydration Tips</h4>
        <ul className="space-y-2">
          <li className="text-sm text-teal-800">
            <strong>Spice Blends:</strong> Mix your Italian, Mexican, and Indian spice blends ahead of
            time. Relying on garlic, ginger, lemon, lime, vinegar, and herbs will keep your brain sharp
            and your kidneys safe without missing the salt.
          </li>
          <li className="text-sm text-teal-800">
            <strong>Portion Control:</strong> When making dishes like the garlic broccoli or stir-fries,
            plate exactly what you need for that meal and immediately box the rest for lunch.
          </li>
          <li className="text-sm text-teal-800">
            <strong>Hydration:</strong> Keep a large glass of water at your desk while you work on your
            creative projects. Proper fluid intake is critical for PKD management.
          </li>
        </ul>
      </div>
    </div>
  )
}
