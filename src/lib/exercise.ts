export interface Block { label: string; minutes: number; details: string }
export interface Plan { title: string; blocks: Block[] }

function dayIndex(dateISO: string) {
  return new Date(dateISO).getDay(); // 0..6
}

export function planForDate(dateISO: string): Plan {
  const d = dayIndex(dateISO) % 4; // 4-day rotation
  const commonWarm: Block = { label: 'Qi Gong Warm-up', minutes: 10, details: 'Ba Duan Jin style; gentle range' };
  const cool: Block = { label: 'Qi Gong Cool-down', minutes: 5, details: 'Loose shakes, breath, open/close' };

  const A: Plan = {
    title: 'Mobility + Walk (Energy)',
    blocks: [
      commonWarm,
      { label: 'Walk (easy pace)', minutes: 25, details: 'RPE 3–4; nasal breathing' },
      { label: 'Hips/Shoulders Mobility', minutes: 10, details: 'Cats-cows, hip circles, wall slides' },
      cool
    ]
  };
  const B: Plan = {
    title: 'Strength A (Low-Impact)',
    blocks: [
      commonWarm,
      { label: 'Circuit ×2', minutes: 20, details: 'Chair squats 8–12, Wall push-ups 8–12, Band rows 8–12, Glute bridge 10–15, Dead bug 8–10/side' },
      { label: 'Walk (short)', minutes: 15, details: 'Easy flush' },
      cool
    ]
  };
  const C: Plan = {
    title: 'Balance + Core',
    blocks: [
      commonWarm,
      { label: 'Balance Drills', minutes: 12, details: 'Single-leg (support nearby), heel-toe walks' },
      { label: 'Core (gentle)', minutes: 10, details: 'Side plank (knees), bird-dog slow reps' },
      { label: 'Walk', minutes: 20, details: 'Relaxed' },
      cool
    ]
  };
  const D: Plan = {
    title: 'Recovery + Longer Walk',
    blocks: [
      { label: 'Qi Gong Flow', minutes: 15, details: 'Smooth continuous set' },
      { label: 'Walk (long easy)', minutes: 35, details: 'Comfortable pace' },
      { label: 'Stretch', minutes: 8, details: 'Calves, hamstrings, chest doorway stretch' }
    ]
  };

  const rot = [A, B, C, D];
  return rot[d];
}

export function planNote(p: Plan): string {
  const lines = p.blocks.map(b => `• ${b.label} — ${b.minutes}m (${b.details})`);
  return `${p.title}\n${lines.join('\n')}`;
}
