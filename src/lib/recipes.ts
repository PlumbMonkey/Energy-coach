export type Meal = 'breakfast' | 'lunch' | 'dinner';

export interface Recipe {
  id: string;
  meal: Meal;
  title: string;
  summary: string;
  ingredients: string[];
  steps: string[];
  tags?: string[];
}

// Tag vocabulary additions (Phase 1):
// adds-salmon, adds-chicken, adds-tuna, adds-eggs
// makes-two-meals, coffee-morning, anti-inflammatory, quick, weekend

const B: Recipe[] = [
  {
    id: 'oatmeal-power-bowl',
    meal: 'breakfast',
    title: 'Oatmeal Power Bowl',
    summary: 'Rolled oats with crushed walnuts, blueberries, and manuka honey.',
    ingredients: ['rolled oats', 'crushed walnuts', 'blueberries', 'manuka honey', 'oat milk'],
    steps: [
      'Simmer oats in oat milk 5 min.',
      'Top with walnuts and blueberries.',
      'Drizzle manuka honey to finish.'
    ],
    tags: ['kidney-friendly', 'anti-inflammatory', 'vegetarian', 'quick']
  },
  {
    id: 'bagel-wow-butter',
    meal: 'breakfast',
    title: 'Bagel + Wow Butter',
    summary: 'Toasted bagel with wow butter or cream cheese, Fuji apple on the side.',
    ingredients: ['bagel', 'wow butter or cream cheese', 'Fuji apple'],
    steps: [
      'Toast bagel.',
      'Spread wow butter or cream cheese.',
      'Serve with sliced Fuji apple on the side.'
    ],
    tags: ['quick', 'vegetarian']
  },
  {
    id: 'buckwheat-waffles',
    meal: 'breakfast',
    title: 'Buckwheat Waffles',
    summary: 'Buckwheat waffles with maple syrup, hash browns, and eggs.',
    ingredients: ['buckwheat waffle mix', 'maple syrup', 'hash browns', 'eggs'],
    steps: [
      'Prepare waffle batter per package; cook in waffle iron.',
      'Pan-fry hash browns until crispy.',
      'Cook eggs as preferred.',
      'Serve together with maple syrup.'
    ],
    tags: ['gluten-free-leaning', 'coffee-morning', 'adds-eggs', 'weekend']
  },
  {
    id: 'blueberry-pancakes',
    meal: 'breakfast',
    title: 'Blueberry Pancakes',
    summary: 'Fluffy blueberry pancakes with maple syrup.',
    ingredients: ['pancake mix', 'blueberries', 'maple syrup', 'oat milk'],
    steps: [
      'Mix batter; fold in blueberries.',
      'Cook on medium heat, flip when bubbles form.',
      'Serve with maple syrup.'
    ],
    tags: ['vegetarian', 'weekend', 'anti-inflammatory']
  },
  {
    id: 'eggs-hash-browns',
    meal: 'breakfast',
    title: 'Eggs with Hash Browns',
    summary: 'Scrambled or fried eggs with crispy hash browns and optional garlic and peppers.',
    ingredients: ['eggs', 'hash browns', 'fresh garlic (optional)', 'rainbow peppers (optional)', 'olive oil'],
    steps: [
      'Pan-fry hash browns until golden and crispy.',
      'Sauté garlic and peppers if using.',
      'Cook eggs as preferred.',
      'Serve together.'
    ],
    tags: ['protein', 'savory', 'adds-eggs', 'kidney-friendly']
  },
  {
    id: 'golden-morning-bowl',
    meal: 'breakfast',
    title: 'Golden Morning Bowl',
    summary: 'Warm oats + banana with turmeric & cinnamon; creamy + crunchy.',
    ingredients: ['rolled oats', 'almond/oat milk', 'banana', 'turmeric', 'cinnamon', 'pumpkin seeds (small sprinkle)'],
    steps: [
      'Simmer oats in milk 5–7 min.',
      'Mash in ½ banana; stir turmeric + pinch cinnamon.',
      'Top with thin banana slices + tiny sprinkle seeds for crunch.'
    ],
    tags: ['kidney-friendly', 'low-oxalate-leaning', 'vegetarian']
  },
  {
    id: 'crispy-morning-hash',
    meal: 'breakfast',
    title: 'Crispy Morning Hash (Low-Oxalate)',
    summary: 'Potato + zucchini hash, crisp edges, soft middle.',
    ingredients: ['potato (diced)', 'zucchini (diced)', 'olive oil', 'garlic powder', 'pepper'],
    steps: [
      'Pan on medium-high; oil until shimmering.',
      'Add potato; leave 3–4 min before stirring.',
      'Add zucchini; season; cook to crisp edges.'
    ],
    tags: ['kidney-friendly', 'gluten-free']
  },
  {
    id: 'basic-crepes-fruit',
    meal: 'breakfast',
    title: 'Basic Crêpes + Fruit',
    summary: 'Thin crêpes with yogurt & berries/banana.',
    ingredients: ['crêpe batter', 'plain yogurt', 'berries/banana', 'maple (drizzle)'],
    steps: [
      'Nonstick pan, thin layer batter; flip when edges lift.',
      'Fill with yogurt + fruit; fold; drizzle a touch of maple.'
    ],
    tags: ['vegetarian']
  },
  {
    id: 'breakfast-greens-rotation',
    meal: 'breakfast',
    title: 'Breakfast Greens Sauté',
    summary: 'Quick sautéed greens + egg or tofu for protein.',
    ingredients: ['greens (e.g., kale/chard)', 'olive oil', 'garlic', 'egg or tofu'],
    steps: ['Sauté greens 3–4 min.', 'Add egg/tofu, cook through.', 'Pepper; serve.'],
    tags: ['protein', 'quick']
  }
];

const L: Recipe[] = [
  {
    id: 'monster-turkey-sandwich',
    meal: 'lunch',
    title: 'Monster Turkey Sandwich',
    summary: 'Whole wheat turkey sandwich with guacamole, romaine, and Fritos.',
    ingredients: ['whole wheat bread', 'turkey cold cuts', 'romaine', 'tomato', 'guacamole', 'vegan mayo', 'caesar dressing', 'sliced onion', 'Fritos'],
    steps: [
      'Layer turkey, romaine, tomato, and onion on bread.',
      'Spread guacamole and vegan mayo.',
      'Drizzle caesar dressing.',
      'Serve with Fritos on the side.'
    ],
    tags: ['quick', 'filling']
  },
  {
    id: 'pasta-tuna-bowl',
    meal: 'lunch',
    title: 'Pasta Tuna Bowl',
    summary: 'Whole wheat pasta with low-sodium tuna, broccoli, peas, and alfredo sauce.',
    ingredients: ['whole wheat pasta', 'low-sodium tuna', 'broccoli', 'green peas', 'alfredo or cheez whiz sauce'],
    steps: [
      'Cook pasta; reserve a little pasta water.',
      'Steam broccoli and peas.',
      'Drain tuna; combine all with sauce.',
      'Add pasta water to loosen if needed.'
    ],
    tags: ['adds-tuna', 'filling', 'kidney-aware']
  },
  {
    id: 'golden-cauliflower-curry',
    meal: 'lunch',
    title: 'Golden Cauliflower Curry',
    summary: 'Turmeric coconut curry; mild, cozy.',
    ingredients: ['cauliflower', 'onion', 'garlic', 'turmeric', 'coconut milk', 'rice'],
    steps: ['Sauté onion/garlic.', 'Add cauliflower + turmeric.', 'Pour coconut milk; simmer; serve over rice.'],
    tags: ['vegan']
  },
  {
    id: 'sesame-tofu-fried-rice',
    meal: 'lunch',
    title: 'Golden Grove Fried Rice (Sesame Tofu)',
    summary: 'Leftover rice + tofu; toasted sesame finish.',
    ingredients: ['cooked rice', 'firm tofu', 'frozen peas/carrots', 'sesame oil', 'low-sodium tamari (light)'],
    steps: ['Crisp tofu cubes.', 'Add rice + veg; toss.', 'Finish with a little sesame oil; tiny splash tamari.'],
    tags: ['kidney-aware', 'low-sodium']
  },
  {
    id: 'tuna-chickpea-smash',
    meal: 'lunch',
    title: 'Tuna + Chickpea Smash (Low-Sodium)',
    summary: 'High-protein spread for wrap or romaine boats.',
    ingredients: ['low-sodium tuna (rinsed)', 'chickpeas (rinsed, mashed)', 'olive oil', 'lemon', 'dill'],
    steps: ['Mash chickpeas; fold in tuna.', 'Olive oil + lemon + dill.', 'Serve in wrap/lettuce.'],
    tags: ['adds tuna', 'quick']
  },
  {
    id: 'veg-rice-soup',
    meal: 'lunch',
    title: 'Vegetable & Rice Soup (One-Pot)',
    summary: 'Light, soothing; great make-ahead.',
    ingredients: ['onion', 'carrot', 'celery', 'rice', 'water/low-sodium stock', 'bay'],
    steps: ['Sweat veg 5 min.', 'Add rice + liquid + bay; simmer till tender.', 'Pepper to finish.'],
    tags: ['gentle', 'kidney-aware']
  }
];

const D: Recipe[] = [
  {
    id: 'jamaican-style-curry',
    meal: 'dinner',
    title: 'Jamaican-Style Curry',
    summary: 'Chicken or chickpeas with zucchini, cauliflower, and coconut milk over rice.',
    ingredients: ['chicken or chickpeas', 'zucchini', 'cauliflower', 'celery', 'carrots', 'bell peppers', 'coconut milk', 'curry powder', 'cumin', 'ginger powder', 'cayenne', 'rice', 'cilantro'],
    steps: [
      'Sauté onion and peppers 3–4 min.',
      'Add spices; toast 1 min.',
      'Add chicken or chickpeas + vegetables; stir to coat.',
      'Pour coconut milk; simmer 20–25 min until tender.',
      'Serve over rice with fresh cilantro.'
    ],
    tags: ['adds-chicken', 'kidney-aware', 'makes-two-meals', 'anti-inflammatory']
  },
  {
    id: 'rice-veggie-bowl',
    meal: 'dinner',
    title: 'Rice Veggie Bowl',
    summary: 'Rice with cilantro, mixed vegetables, and chicken or chickpeas.',
    ingredients: ['rice', 'cilantro', 'mixed vegetables', 'chicken or chickpeas', 'olive oil', 'garlic powder', 'pepper'],
    steps: [
      'Cook rice; fluff with cilantro.',
      'Season and cook chicken or chickpeas until done.',
      'Sauté mixed vegetables.',
      'Assemble bowl; serve.'
    ],
    tags: ['adds-chicken', 'gentle', 'kidney-aware', 'makes-two-meals']
  },
  {
    id: 'pasta-chicken-bowl',
    meal: 'dinner',
    title: 'Pasta Chicken Bowl',
    summary: 'Pasta with chicken, broccoli, green peas, and alfredo sauce.',
    ingredients: ['pasta', 'chicken', 'broccoli', 'green peas', 'alfredo sauce'],
    steps: [
      'Cook pasta.',
      'Season and cook chicken; slice.',
      'Steam broccoli and peas.',
      'Combine all with alfredo sauce.'
    ],
    tags: ['adds-chicken', 'filling']
  },
  {
    id: 'chicken-caesar-twist',
    meal: 'dinner',
    title: 'Chicken Caesar (Twist)',
    summary: 'Grilled/air-fried chicken; light dressing.',
    ingredients: ['chicken breast', 'romaine', 'olive oil', 'lemon', 'parmesan (pinch)'],
    steps: ['Cook chicken; slice.', 'Toss romaine with oil + lemon.', 'Top with chicken + tiny parmesan.'],
    tags: ['adds chicken', 'light']
  },
  {
    id: 'baked-salmon-sheetpan',
    meal: 'dinner',
    title: 'Baked Salmon Sheet-Pan',
    summary: 'Lemon-herb salmon + veggies.',
    ingredients: ['salmon', 'zucchini', 'bell pepper', 'olive oil', 'lemon', 'herbs'],
    steps: ['Tray with veg; oil + season.', 'Lay salmon on top; 200°C / 400°F ~12–15 min.', 'Finish with lemon.'],
    tags: ['adds salmon']
  },
  {
    id: 'golden-cauliflower-curry-dinner',
    meal: 'dinner',
    title: 'Golden Cauliflower Curry (Dinner)',
    summary: 'Double up for leftover-friendly dinner.',
    ingredients: ['cauliflower', 'onion', 'garlic', 'turmeric', 'coconut milk', 'rice'],
    steps: ['Same method as lunch version; larger batch.'],
    tags: ['vegan']
  }
];

export const RECIPES: Recipe[] = [...B, ...L, ...D];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function recipesFor(meal: Meal): Recipe[] {
  return RECIPES.filter(r => r.meal === meal);
}

export function pickRecipe(meal: Meal, dateISO: string, availableTags?: string[]): Recipe {
  const full = recipesFor(meal);
  let pool = full;
  if (availableTags) {
    const filtered = full.filter(r =>
      // Include recipe if it has no protein-requires tag
      !r.tags?.some(t => t.startsWith('adds-')) ||
      // OR its required protein is available
      r.tags?.some(t => availableTags.includes(t))
    );
    // fallback to full pool if filter leaves nothing
    pool = filtered.length > 0 ? filtered : full;
  }
  const idx = hash(`${meal}:${dateISO}`) % pool.length;
  return pool[idx];
}

export function formatRecipeNote(r: Recipe): string {
  const head = `${r.title} — ${r.summary}`;
  const ing = `Ingredients: ${r.ingredients.join(', ')}`;
  const steps = r.steps.map((s, i) => `${i + 1}. ${s}`).join(' ');
  return `${head}\n${ing}\nSteps: ${steps}`;
}
