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

const B: Recipe[] = [
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

export function pickRecipe(meal: Meal, dateISO: string): Recipe {
  const pool = recipesFor(meal);
  const idx = hash(`${meal}:${dateISO}`) % pool.length;
  return pool[idx];
}

export function formatRecipeNote(r: Recipe): string {
  const head = `${r.title} — ${r.summary}`;
  const ing = `Ingredients: ${r.ingredients.join(', ')}`;
  const steps = r.steps.map((s, i) => `${i + 1}. ${s}`).join(' ');
  return `${head}\n${ing}\nSteps: ${steps}`;
}
